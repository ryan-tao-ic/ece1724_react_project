// app/events/create/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { getCategories, createEventAction } from '@/app/actions';
import { useSession } from 'next-auth/react';

const eventSchema = z.object({
  name: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  location: z.string().min(1, 'Location is required'),
  categoryId: z.string().min(1, 'Category is required'),
  eventStartTime: z.string().min(1, 'Start time is required'),
  eventEndTime: z.string().min(1, 'End time is required'),
  availableSeats: z.number().min(10, 'At least 10 seats are required'),
  waitlistCapacity: z.number().min(0).optional().default(0),
  customizedQuestion: z.array(z.object({ question: z.string().min(1) })).optional(),
}).refine((data) => {
  const start = new Date(data.eventStartTime);
  const end = new Date(data.eventEndTime);
  return start < end;
}, {
  message: 'Start time must be before end time.',
  path: ['eventEndTime'],
});

type EventFormValues = z.infer<typeof eventSchema>;

export default function CreateEventPage() {
  const [categories, setCategories] = useState<{ name: string; id: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const router = useRouter();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: '',
      description: '',
      location: '',
      categoryId: '',
      eventStartTime: '',
      eventEndTime: '',
      availableSeats: 10,
      waitlistCapacity: 0,
      customizedQuestion: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'customizedQuestion',
  });

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const onSubmit = async (data: EventFormValues, status: 'DRAFT' | 'PENDING_REVIEW') => {
    if (!userId) {
      alert("You must be logged in to create an event.");
      return;
    }
    setLoading(true);
    try {
      const formattedQuestions = data.customizedQuestion?.map((q) => q.question) || [];
      await createEventAction({ ...data, customizedQuestion: formattedQuestions, status, createdBy: userId });
      alert("Event submitted successfully.");
      router.push('/dashboard');
    } catch (err) {
      alert('Failed to create event.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6">Create an Event</h1>
      <form className="space-y-6" onSubmit={form.handleSubmit((data) => onSubmit(data, 'PENDING_REVIEW'))}>
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

        {/* Custom Questions */}
        <div>
          <Label>Custom Questions (Optional)</Label>
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <Input {...form.register(`customizedQuestion.${index}.question`)} placeholder={`Question ${index + 1}`} />
                <Button type="button" variant="destructive" onClick={() => remove(index)}>Remove</Button>
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={() => append({ question: '' })}>+ Add Question</Button>
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>Submit for Review</Button>
          <Button type="button" variant="secondary" onClick={form.handleSubmit((data) => onSubmit(data, 'DRAFT'))} disabled={loading}>
            Save as Draft
          </Button>
        </div>
      </form>
    </div>
  );
}
