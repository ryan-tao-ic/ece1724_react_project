// app/events/[id]/edit/EditEventClientForm.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { updateEvent, deleteEventAction } from '@/app/actions';
import { EventStatus } from '@prisma/client';

const eventSchema = z.object({
  name: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  location: z.string().min(1, 'Location is required'),
  categoryId: z.string().min(1, 'Category is required'),
  eventStartTime: z.string().min(1, 'Start time is required'),
  eventEndTime: z.string().min(1, 'End time is required'),
  availableSeats: z.number().min(1, 'At least 1 seat is required'),
  waitlistCapacity: z.number().min(0, 'Waitlist capacity cannot be negative').optional(),
  customizedQuestion: z.array(z.object({ question: z.string().min(1) })).optional(),
  status: z.enum(['DRAFT', 'PENDING_REVIEW', 'APPROVED']).optional(),
})
.refine((data) => {
  const now = new Date();
  const start = new Date(data.eventStartTime);
  return start > now;
}, {
  message: 'Start time must be in the future.',
  path: ['eventStartTime'],
})
.refine((data) => {
  const start = new Date(data.eventStartTime);
  const end = new Date(data.eventEndTime);
  return start < end;
}, {
  message: 'Start time must be before end time.',
  path: ['eventEndTime'],
})
.refine((data) => {
  const start = new Date(data.eventStartTime);
  const end = new Date(data.eventEndTime);
  const oneHourInMs = 60 * 60 * 1000;
  return end.getTime() - start.getTime() >= oneHourInMs;
}, {
  message: 'Event must last at least 1 hour.',
  path: ['eventEndTime'],
});

export type EventFormValues = z.infer<typeof eventSchema>;

export default function EditEventClientForm({
  eventId,
  wasRejected,
  reviewComment,
  defaultValues,
  rawStatus,
  categories,
  userId,
  userRole,
  createdBy,
}: {
  eventId: string;
  wasRejected: boolean;
  reviewComment: string;
  defaultValues: EventFormValues;
  rawStatus: string;
  categories: { id: number; name: string }[];
  userId: string;
  userRole: "USER" | "LECTURER" | "STAFF" | "ADMIN";
  createdBy: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'customizedQuestion',
  });

  const currentStatus = defaultValues?.status || 'DRAFT';

  const canDeleteEvent =
    userRole === "LECTURER" &&
    createdBy === userId &&
    !["PUBLISHED", "CANCELLED"].includes(rawStatus);

  const onSubmit = async (
    data: EventFormValues,
    status?: EventStatus
  ) => {
    setLoading(true);
    try {
      const formattedQuestions = data.customizedQuestion?.map((q) => q.question) || [];
      await updateEvent(eventId, {
        ...data,
        customizedQuestion: formattedQuestions,
        status: (status ?? data.status) as "DRAFT" | "PENDING_REVIEW" | "APPROVED" | undefined,
      });
      alert("Event updated successfully.");
      router.push('/dashboard');
    } catch (err) {
      alert('Failed to update event.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6">Edit Event</h1>
  
      {wasRejected && reviewComment && (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-4 rounded mb-6">
          <p className="font-semibold">This event was reviewed and sent back by staff.</p>
          <p className="mt-2 whitespace-pre-line">{reviewComment}</p>
        </div>
      )}
  
      <form className="space-y-6">
        <div>
          <Label>Title</Label>
          <Input {...form.register('name')} />
        </div>
  
        <div>
          <Label>Description</Label>
          <Textarea {...form.register('description')} />
        </div>
  
        <div>
          <Label>Location</Label>
          <Input {...form.register('location')} />
        </div>
  
        <div>
          <Label>Category</Label>
          <select {...form.register('categoryId')} className="w-full h-10 rounded border px-3">
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
  
        <div className="flex gap-4">
          <div className="flex-1">
            <Label>Start Time</Label>
            <Input type="datetime-local" {...form.register('eventStartTime')} />
          </div>
          <div className="flex-1">
            <Label>End Time</Label>
            <Input type="datetime-local" {...form.register('eventEndTime')} />
          </div>
        </div>
  
        <div>
          <Label>Available Seats</Label>
          <Input type="number" {...form.register('availableSeats', { valueAsNumber: true })} />
        </div>
  
        <div>
          <Label>Waitlist Capacity</Label>
          <Input type="number" {...form.register('waitlistCapacity', { valueAsNumber: true })} />
        </div>
  
        <div>
          <Label>Custom Questions (Optional)</Label>
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <Input
                  {...form.register(`customizedQuestion.${index}.question`)}
                  placeholder={`Question ${index + 1}`}
                />
                <Button type="button" variant="destructive" onClick={() => remove(index)}>Remove</Button>
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={() => append({ question: '' })}>
              + Add Question
            </Button>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
          >
            Return 
          </Button>
    
          {currentStatus === 'DRAFT' && (
            <Button
              type="button"
              disabled={loading}
              onClick={form.handleSubmit((data) => onSubmit(data, 'PENDING_REVIEW'))}
            >
              Submit for Review
            </Button>
          )}
  
          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={form.handleSubmit((data) => onSubmit(data))}
          >
            Save
          </Button>
  
          {canDeleteEvent && (
            <Button 
              type="button" 
              variant="destructive"
              onClick={async (e) => {
                if (confirm("Are you sure you want to permanently delete this event and all associated data?")) {
                  const formData = new FormData();
                  formData.append("eventId", eventId);
                  formData.append("userId", userId);
                  await deleteEventAction(formData);
                  router.push("/dashboard"); 
                }
              }}
            >
              Delete Event
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}