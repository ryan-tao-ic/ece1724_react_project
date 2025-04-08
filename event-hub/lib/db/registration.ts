// lib/db/registration.ts
import prisma from './prisma';
import { sendConfirmationEmail } from '@/lib/email/sendConfirmationEmail';

export async function getUserRegistration(eventId: string, userId: string) {
  return await prisma.eventUserRegistration.findUnique({
    where: {
      eventId_userId: { eventId, userId },
    },
  });
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

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { registrations: true },
  });

  if (!event) throw new Error('Event not found');

  const totalRegistered = event.registrations.filter(r => r.status === 'REGISTERED').length;
  const totalCapacity = event.availableSeats;
  const isWaitlisted = totalRegistered >= totalCapacity;
  const registrationStatus = isWaitlisted ? 'WAITLISTED' : 'REGISTERED';

  const qrCode = JSON.stringify({ eventId, userId, timestamp: Date.now() });

  const reg = await prisma.eventUserRegistration.create({
    data: {
      eventId,
      userId,
      status: registrationStatus,
      qrCode,
      customizedQuestionAnswer: customAnswers,
      waitlistPosition: isWaitlisted ? event.registrations.length + 1 : null,
    },
  });

  await sendConfirmationEmail({
    event,
    userId,
    status: registrationStatus,
    qrCode,
  });

  return { status: registrationStatus, qrCode };
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

  await sendConfirmationEmail({
    event,
    userId: first.userId,
    status: 'REGISTERED',
    qrCode: newQr,
  });
}
