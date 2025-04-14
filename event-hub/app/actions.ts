"use server";

import prisma from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { registerToEventInDb, cancelRegistration } from '@/lib/db/registration';
import { redirect } from 'next/navigation';
import { getTokenForServerComponent } from '@/lib/auth/auth';
import { sendConfirmationEmail } from '@/lib/email/sendConfirmationEmail';  
import { createEventMaterial } from "@/lib/db/materials";
import { uploadFileToStorage, getSignedUrl } from "@/lib/file-storage";
import { StorageError } from "@/lib/file-storage/errors";
import { UploadResult } from "@/lib/types";

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

/**
 * Helper function to get the authenticated user or redirect to login
 */
async function getAuthenticatedUser() {
  const token = await getTokenForServerComponent();
  if (!token?.id) redirect("/login");
  
  const user = await prisma.user.findUnique({
    where: { id: token.id }
  });
  
  if (!user) redirect("/login");
  return user;
}

export async function createEvent(formData: FormData) {
  const user = await getAuthenticatedUser();

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
        categoryId: Number(data.categoryId),
        status: 'DRAFT',
        createdBy: user.id,
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
  const user = await getAuthenticatedUser();

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
  const user = await getAuthenticatedUser();
  const eventId = formData.get('eventId') as string;

  await cancelRegistration(eventId, user.id);

  revalidatePath(`/events/${eventId}/register`);
  redirect(`/events/${eventId}/register?cancelled=1`);
}

/**
 * Refresh a signed URL for a file
 * @param filePath The path of the file
 * @returns A new signed URL
 */
export async function refreshSignedUrl(filePath: string): Promise<string> {
  // Pass through directly to the storage service
  return await getSignedUrl(filePath);
}

/**
 * Upload a material to an event
 * This server action handles the file validation, upload to cloud storage,
 * and database record creation for event materials.
 */
export async function uploadEventMaterial(formData: FormData): Promise<UploadResult> {
  try {
    const user = await getAuthenticatedUser();
    
    const eventId = formData.get('eventId') as string;
    const file = formData.get('file') as File;
    
    if (!eventId || !file) {
      return { success: false, error: "Missing event ID or file" };
    }
    
    // Validate file type
    if (file.type !== 'application/pdf') {
      return { success: false, error: "Only PDF files are supported" };
    }
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: "File size exceeds 10MB limit" };
    }
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Generate a unique file path for the material
    const uniqueFileName = `${Date.now()}-${file.name}`;
    const filePath = `event-materials/${uniqueFileName}`;
    
    // Upload to Google Cloud Storage
    const signedUrl = await uploadFileToStorage(buffer, file.name, file.type);
    
    // Save to database - store just the file path, not the full signed URL
    const material = await createEventMaterial(
      eventId,
      user.id,
      filePath, // Store the path, not the URL
      file.name,
      file.type
    );
    
    return { 
      success: true, 
      material: {
        id: material.id,
        fileName: material.fileName,
        filePath: material.filePath,
        fileType: material.fileType,
        uploadedAt: material.uploadedAt,
        signedUrl // Include the signed URL in the response
      } 
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    
    // Handle specific error types
    if (error instanceof StorageError) {
      return { 
        success: false, 
        error: "Failed to save file to cloud storage. Please try again." 
      };
    }
    
    // Database or other errors
    return { 
      success: false, 
      error: "An unexpected error occurred. Please try again later." 
    };
  }
}