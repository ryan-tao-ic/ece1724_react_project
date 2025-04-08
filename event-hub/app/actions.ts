"use server";

import prisma from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { registerToEventInDb, cancelRegistration } from '@/lib/db/registration';
import { redirect } from 'next/navigation';

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

export async function createEvent(formData: FormData) {
  const rawData = {
    name: formData.get("name"),
    description: formData.get("description") || "",
    location: formData.get("location"),
    eventStartTime: formData.get("eventStartTime"),
    eventEndTime: formData.get("eventEndTime"),
    availableSeats: formData.get("availableSeats"),
    categoryId: formData.get("categoryId"),
  };

  const validationResult = eventSchema.safeParse(rawData);

  if (!validationResult.success) {
    return {
      success: false,
      errors: validationResult.error.format(),
    };
  }

  const data = validationResult.data;

  try {
    await prisma.event.create({
      data: {
        name: data.name,
        description: data.description,
        location: data.location,
        eventStartTime: new Date(data.eventStartTime),
        eventEndTime: new Date(data.eventEndTime),
        availableSeats: data.availableSeats,
        categoryId: data.categoryId,
        status: 'DRAFT',
        createdBy: 'placeholder-user-id',
      },
    });

    revalidatePath('/events');
    return { success: true };
  } catch (error) {
    console.error("Error creating event:", error);
    return {
      success: false,
      errors: { _form: ["Failed to create event"] },
    };
  }
}

export async function registerToEvent(formData: FormData) {
  const eventId = formData.get('eventId') as string;
  const userId = formData.get('userId') as string;
  const phoneNumber = formData.get('phoneNumber') as string;
  const role = formData.get('role') as string;
  const affiliation = formData.get('affiliation') as string;

  const customAnswers: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('custom_')) {
      customAnswers[key.replace('custom_', '')] = value.toString();
    }
  }

  // Try register (this will handle duplication check internally)
  const result = await registerToEventInDb({
    eventId,
    userId,
    phoneNumber,
    role,
    affiliation,
    customAnswers,
  });

  revalidatePath(`/events/${eventId}/register`);

  // Redirect with status and qrCode to indicate this is a first-time registration success
  redirect(`/events/${eventId}/register?status=${result.status}&code=${encodeURIComponent(result.qrCode)}`);
}

export async function cancelRegistrationAction(formData: FormData) {
  const eventId = formData.get('eventId') as string;
  const userId = formData.get('userId') as string;

  await cancelRegistration(eventId, userId);

  revalidatePath(`/events/${eventId}/register`);
  redirect(`/events/${eventId}/register?cancelled=1`);
}