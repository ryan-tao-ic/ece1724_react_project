// lib/db/registration.ts
import prisma from './prisma';
import { sendConfirmationEmail } from '@/lib/email/sendConfirmationEmail';
import { sendUpgradeEmail } from '@/lib/email/sendUpgradeEmail';

export async function getUserRegistration(eventId: string, userId: string) {
  return await prisma.eventUserRegistration.findUnique({
    where: {
      eventId_userId: { eventId, userId },
    },
  });
}

export async function getUserRegistrations(userId: string) {
  const now = new Date();
  
  const registrations = await prisma.eventUserRegistration.findMany({
    where: {
      userId,
      status: {
        in: ['REGISTERED', 'WAITLISTED', 'ATTENDED'] 
      }
    },
    include: {
      event: {
        include: {
          category: true
        }
      }
    },
    orderBy: {
      event: {
        eventStartTime: 'asc'
      }
    }
  });

  const upcomingRegistrations = registrations.filter(
    reg => new Date(reg.event.eventStartTime) > now
  );
  
  const pastRegistrations = registrations.filter(
    reg => new Date(reg.event.eventStartTime) <= now
  );
  
  return {
    upcoming: upcomingRegistrations,
    past: pastRegistrations
  };
}

export async function registerToEventInDb(params: {
  eventId: string;
  userId: string;
  phoneNumber?: string;
  role: string;
  affiliation?: string;
  customAnswers?: Record<string, string>;
}) {
  const { eventId, userId, phoneNumber, role, affiliation, customAnswers } = params;

  const existingRegistration = await prisma.eventUserRegistration.findUnique({
    where: { eventId_userId: { eventId, userId } },
  });

  if (existingRegistration) {
    return {
      status: existingRegistration.status,
      qrCode: existingRegistration.qrCode,
    };
  }

  const isLecturer = await prisma.eventLecturers.findUnique({
    where: { 
      eventId_lecturerId: { 
        eventId, 
        lecturerId: userId 
      } 
    },
  });

  if (isLecturer) {
    return {
      status: 'LECTURER_CANNOT_REGISTER',
      qrCode: '',
    };
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { registrations: true },
  });

  if (!event) throw new Error('Event not found');

  const totalRegistered = event.registrations.filter(
    (r) => r.status === 'REGISTERED'
  ).length;
  
  const hasAvailableSeats = totalRegistered < event.availableSeats;
  
  if (hasAvailableSeats) {
    const qrCode = JSON.stringify({ eventId, userId, timestamp: Date.now() });
    
    const reg = await prisma.eventUserRegistration.create({
      data: {
        eventId,
        userId,
        status: 'REGISTERED',
        qrCode,
        customizedQuestionAnswer: customAnswers,
        waitlistPosition: null,
      },
    });

    await sendConfirmationEmail({
      event,
      userId,
      status: 'REGISTERED',
      qrCode,
    });

    return { status: 'REGISTERED', qrCode };
  } else {
    const totalWaitlisted = event.registrations.filter(
      (r) => r.status === 'WAITLISTED'
    ).length;
    
    const waitlistIsFull = event.waitlistCapacity > 0 && 
                          totalWaitlisted >= event.waitlistCapacity;
    
    if (waitlistIsFull) {
      return { status: 'FULL', qrCode: '' };
    } else {
      const waitlistPosition = totalWaitlisted + 1;
      const qrCode = JSON.stringify({ eventId, userId, timestamp: Date.now() });
      
      const reg = await prisma.eventUserRegistration.create({
        data: {
          eventId,
          userId,
          status: 'WAITLISTED',
          qrCode, 
          customizedQuestionAnswer: customAnswers,
          waitlistPosition,
        },
      });

      await sendConfirmationEmail({
        event,
        userId,
        status: 'WAITLISTED',
        qrCode: '', 
      });

      return { status: 'WAITLISTED', qrCode };
    }
  }
}

export async function cancelRegistration(eventId: string, userId: string) {
  await prisma.eventUserRegistration.delete({
    where: {
      eventId_userId: { eventId, userId },
    },
  });

  await upgradeFirstWaitlistedUser(eventId);
}

export async function upgradeFirstWaitlistedUser(eventId: string) {
  const first = await prisma.eventUserRegistration.findFirst({
    where: {
      eventId,
      status: 'WAITLISTED',
    },
    orderBy: {
      waitlistPosition: 'asc',
    },
  });

  if (!first) return;

  const newQr = JSON.stringify({ eventId, userId: first.userId, timestamp: Date.now() });

  await prisma.eventUserRegistration.update({
    where: {
      eventId_userId: { eventId, userId: first.userId },
    },
    data: {
      status: 'REGISTERED',
      waitlistPosition: null,
      qrCode: newQr,
    },
  });

  const event = await prisma.event.findUniqueOrThrow({ where: { id: eventId } });

  await sendUpgradeEmail({
    event,
    userId: first.userId,
    qrCode: newQr,
  });
}