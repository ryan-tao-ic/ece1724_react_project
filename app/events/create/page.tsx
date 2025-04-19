// app/events/create/page.tsx

'use client';

import { createEventAction, getCategories } from '@/app/actions';
import { MainLayout } from "@/components/layout/main-layout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Container } from "@/components/ui/container";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, toZonedTime } from 'date-fns-tz';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

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

  // Calculate the minimum allowed date/time (now in Toronto)
  const torontoTimeZone = 'America/Toronto';
  const nowInToronto = toZonedTime(new Date(), torontoTimeZone);
  // Format for datetime-local input: YYYY-MM-DDTHH:mm
  const minDateTime = format(nowInToronto, "yyyy-MM-dd'T'HH:mm");

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

  const [error, setError] = useState("");

  const onSubmit = async (data: EventFormValues, status: 'DRAFT' | 'PENDING_REVIEW') => {
    setError("");

    if (!userId) {
      const msg = "You must be logged in to create an event.";
      setError(msg);
      toast.error(msg);
      return;
    }
    setLoading(true);
    try {
      const formattedQuestions = data.customizedQuestion?.map((q) => q.question) || [];
      await createEventAction({ ...data, customizedQuestion: formattedQuestions, status, createdBy: userId });

      const successMessage = status === 'DRAFT'
        ? "Event saved as draft successfully."
        : "Event submitted for review successfully.";
      toast.success(successMessage);
      router.push('/dashboard');
    } catch (err) {
      const errorMessage = 'Failed to create event.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <Container>
        <div className="max-w-2xl mx-auto py-12 space-y-10">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">Create an Event</h1>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form className="space-y-6" onSubmit={form.handleSubmit((data) => onSubmit(data, 'PENDING_REVIEW'))}>

            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Title</Label>
              <Input {...form.register('name')} />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Description</Label>
              <Textarea {...form.register('description')} rows={4} />
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Location</Label>
              <Input {...form.register('location')} />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Category</Label>
              <select {...form.register('categoryId')} className="w-full h-10 rounded border border-gray-300 px-3">
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Time */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">Start Time</Label>
                <Input type="datetime-local" {...form.register('eventStartTime')} min={minDateTime} />
              </div>
              <div className="flex-1 space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">End Time</Label>
                <Input type="datetime-local" {...form.register('eventEndTime')} min={minDateTime} />
              </div>
            </div>

            {/* Seats */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Available Seats</Label>
              <Input type="number" {...form.register('availableSeats', { valueAsNumber: true })} />
            </div>

            {/* Waitlist */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Waitlist Capacity</Label>
              <Input type="number" {...form.register('waitlistCapacity', { valueAsNumber: true })} />
            </div>

            {/* Custom Questions */}
            <div className="space-y-2 p-4 border rounded-md bg-gray-50">
              <Label className="text-sm font-semibold text-gray-800">Custom Questions (Optional)</Label>
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <Input
                      {...form.register(`customizedQuestion.${index}.question`)}
                      placeholder={`Question ${index + 1}`}
                      className="flex-1"
                    />
                    <Button type="button" variant="destructive" onClick={() => remove(index)}>Remove</Button>
                  </div>
                ))}
                <Button type="button" variant="secondary" onClick={() => append({ question: '' })}>
                  + Add Question
                </Button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
              <Button type="button" variant="outline" onClick={() => window.history.back()}>
                Return
              </Button>
              <Button type="submit" disabled={loading}>
                Submit for Review
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={form.handleSubmit((data) => onSubmit(data, 'DRAFT'))}
                disabled={loading}
              >
                Save as Draft
              </Button>
            </div>
          </form>
        </div>
      </Container>
    </MainLayout>
  );
}
