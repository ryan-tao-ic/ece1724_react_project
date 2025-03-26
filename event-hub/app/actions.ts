'use server';

import prisma from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Simple validation schema for creating events
const eventSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  eventStartTime: z.string().refine(value => !isNaN(Date.parse(value)), "Invalid start date"),
  eventEndTime: z.string().refine(value => !isNaN(Date.parse(value)), "Invalid end date"),
  availableSeats: z.coerce.number().int().positive(),
  categoryId: z.string(),
});

// Type for form data
type EventFormData = z.infer<typeof eventSchema>;

/**
 * Create a new event
 */
export async function createEvent(formData: FormData) {
  // Extract form data
  const rawData = {
    name: formData.get('name'),
    description: formData.get('description') || '',
    location: formData.get('location'),
    eventStartTime: formData.get('eventStartTime'),
    eventEndTime: formData.get('eventEndTime'),
    availableSeats: formData.get('availableSeats'),
    categoryId: formData.get('categoryId'),
  };
  
  // Validate form data
  const validationResult = eventSchema.safeParse(rawData);
  
  if (!validationResult.success) {
    return { 
      success: false, 
      errors: validationResult.error.format() 
    };
  }

  const data = validationResult.data;
  
  try {
    // Create event in database
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
        createdBy: 'placeholder-user-id', // This would normally come from session
      },
    });
    
    // Revalidate events page to show new event
    revalidatePath('/events');
    
    return { success: true };
  } catch (error) {
    console.error('Error creating event:', error);
    return { 
      success: false, 
      errors: { _form: ['Failed to create event'] } 
    };
  }
} 