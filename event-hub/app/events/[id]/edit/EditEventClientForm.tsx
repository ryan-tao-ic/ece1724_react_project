// app/events/[id]/edit/EditEventClientForm.tsx
// This component is responsible for rendering the edit event form.

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
import { updateEvent } from '@/app/actions';

// ✅ Schema with optional status
const eventSchema = z.object({
  name: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  location: z.string().min(1, 'Location is required'),
  categoryId: z.string().min(1, 'Category is required'),
  eventStartTime: z.string().min(1, 'Start time is required'),
  eventEndTime: z.string().min(1, 'End time is required'),
  availableSeats: z.number().min(1, 'At least 1 seat is required'),
  customizedQuestion: z.array(z.object({ question: z.string().min(1) })).optional(),
  status: z.enum(['DRAFT', 'PENDING_REVIEW', 'APPROVED']).optional(),
}).refine((data) => {
  const start = new Date(data.eventStartTime);
  const end = new Date(data.eventEndTime);
  return start < end;
}, {
  message: 'Start time must be before end time.',
  path: ['eventEndTime'],
});

export type EventFormValues = z.infer<typeof eventSchema>;

export default function EditEventClientForm({
  eventId,
  defaultValues,
  categories,
}: {
  eventId: string;
  defaultValues: EventFormValues;
  categories: { id: number; name: string }[];
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

  const onSubmit = async (
    data: EventFormValues,
    status?: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED'
  ) => {
    setLoading(true);
    try {
      const formattedQuestions = data.customizedQuestion?.map((q) => q.question) || [];
      await updateEvent(eventId, {
        ...data,
        customizedQuestion: formattedQuestions,
        status: status ?? data.status, // keep current if none specified
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

        <div className="flex gap-4">
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
        </div>
      </form>
    </div>
  );
}
