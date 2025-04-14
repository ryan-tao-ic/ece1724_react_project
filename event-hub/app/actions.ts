"use server";

import prisma from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { registerToEventInDb, cancelRegistration } from '@/lib/db/registration';
import { redirect } from 'next/navigation';
import { getTokenForServerComponent } from '@/lib/auth/auth';
import { sendCancelNoticeEmails } from '@/lib/email/sendCancelNoticeEmails';

const eventSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  eventStartTime: z
    .string()
    .refine((value) => !isNaN(Date.parse(value)), "Invalid start date"),
  eventEndTime: z
    .string()
    .refine((value) => !isNaN(Date.parse(value)), "Invalid end date"),
  availableSeats: z.coerce.number().int().positive(),
  categoryId: z.string(),
});

type EventFormData = z.infer<typeof eventSchema>;

export async function getCategories() {
  return await prisma.eventCategory.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });
}

export async function createEventAction(data: {
  name: string;
  description: string;
  location: string;
  categoryId: string;
  eventStartTime: string;
  eventEndTime: string;
  availableSeats: number;
  waitlistCapacity?: number;
  status: 'DRAFT' | 'PENDING_REVIEW';
  createdBy: string;
  customizedQuestion?: string[];
}) {
  return await prisma.event.create({
    data: {
      ...data,
      categoryId: parseInt(data.categoryId, 10),
      eventStartTime: new Date(data.eventStartTime),
      eventEndTime: new Date(data.eventEndTime),
      customizedQuestion: data.customizedQuestion?.map((q) => ({ question: q })),
    },
  });
}

// Define or import ReviewFormValues
type ReviewFormValues = {
  name: string;
  description?: string;
  location: string;
  categoryId: string;
  eventStartTime: string;
  eventEndTime: string;
  availableSeats: number;
  customizedQuestion?: { question: string }[];
  reviewComment?: string;
  waitlistCapacity?: number;
};

// Define or import EventStatus
export type EventStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'PUBLISHED';

export async function reviewEventAction(eventId: string, data: ReviewFormValues & { status: EventStatus, reviewerId: string }) {
  try {
    const {
      name,
      description,
      location,
      categoryId,
      eventStartTime,
      eventEndTime,
      availableSeats,
      waitlistCapacity,
      customizedQuestion,
      reviewComment,
      status: status,
      reviewerId
    } = data;

    const formattedQuestions = customizedQuestion?.map((q) => q.question) || [];

    await prisma.event.update({
      where: { id: eventId },
      data: {
        name,
        description,
        location,
        categoryId: parseInt(categoryId),
        eventStartTime: new Date(eventStartTime),
        eventEndTime: new Date(eventEndTime),
        availableSeats,
        waitlistCapacity: waitlistCapacity ?? 0,
        customizedQuestion: formattedQuestions,
        reviewComment: reviewComment ?? null,
        status,
        reviewedBy: reviewerId  
      },
    });

    return { success: true };
  } catch (err) {
    console.error('reviewEventAction error:', err);
    return { success: false, message: 'Failed to review event.' };
  }
}


export async function updateEvent(id: string, data: {
  name: string;
  description: string;
  location: string;
  categoryId: string;
  eventStartTime: string;
  eventEndTime: string;
  availableSeats: number;
  customizedQuestion?: string[];
  status?: "DRAFT" | "PENDING_REVIEW" | "APPROVED"; 
}) {
  return await prisma.event.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      location: data.location,
      categoryId: parseInt(data.categoryId, 10),
      eventStartTime: new Date(data.eventStartTime),
      eventEndTime: new Date(data.eventEndTime),
      availableSeats: data.availableSeats,
      customizedQuestion: data.customizedQuestion,
      status: data.status, 
    },
  });
}

export async function registerToEvent(formData: FormData) {
  /* const session = await getServerSession(authOptions);
  const user = session?.user;
  if (!user) redirect("/login");*/
  const token = await getTokenForServerComponent();
  const id = token.id;
  const user = await prisma.user.findUnique({
    where: { id },
  });
  if (!user) redirect("/login");

  const eventId = formData.get('eventId') as string;
  const phoneNumber = formData.get('phoneNumber') as string;
  const role = formData.get('role') as string;
  const affiliation = formData.get('affiliation') as string;

  const customAnswers: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('custom_')) {
      customAnswers[key.replace('custom_', '')] = value.toString();
    }
  }

  const result = await registerToEventInDb({
    eventId,
    userId: user.id,
    phoneNumber,
    role,
    affiliation,
    customAnswers,
  });

  revalidatePath(`/events/${eventId}/register`);

  if (result.status === 'FULL') {
    redirect(`/events/${eventId}/register?status=FULL`);
  } else if (result.status === 'LECTURER_CANNOT_REGISTER') {
    redirect(`/events/${eventId}/register?status=LECTURER_CANNOT_REGISTER`);
  } else {
    redirect(`/events/${eventId}/register?status=${result.status}&code=${encodeURIComponent(result.qrCode)}`);
  }
}

export async function cancelRegistrationAction(formData: FormData) {
  // const session = await getServerSession(authOptions);
  const token = await getTokenForServerComponent();
  const id = token.id;
  const user = await prisma.user.findUnique({
    where: { id },
  });
  if (!user) redirect("/login");
  /* const user = session?.user;
  if (!user) redirect("/login");*/

  const eventId = formData.get('eventId') as string;

  await cancelRegistration(eventId, user.id);

  revalidatePath(`/events/${eventId}/register`);
  redirect(`/events/${eventId}/register?cancelled=1`);
}

export async function cancelEventAction(formData: FormData) {
  'use server';

  const eventId = formData.get('eventId') as string;
  const staffId = formData.get('staffId') as string;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.status !== "PUBLISHED" || event.reviewedBy !== staffId) {
    throw new Error("Not allowed to cancel this event.");
  }

  await prisma.event.update({
    where: { id: eventId },
    data: { status: "CANCELLED" },
  });

  await sendCancelNoticeEmails(eventId);

  revalidatePath(`/events/${eventId}`);
}
