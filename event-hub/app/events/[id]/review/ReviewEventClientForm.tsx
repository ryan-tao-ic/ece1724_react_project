// app//events/[id]/review/ReviewEventClientForm.tsx

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
import { reviewEventAction } from '@/app/actions';

const reviewSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  location: z.string().min(1),
  categoryId: z.string().min(1),
  eventStartTime: z.string().min(1),
  eventEndTime: z.string().min(1),
  availableSeats: z.number().min(10),
  waitlistCapacity: z.number().min(0).optional().default(0), 
  reviewComment: z.string().optional(),
  customizedQuestion: z.array(z.object({ question: z.string().min(1) })).optional(),
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;

export default function ReviewEventClientForm({
  eventId,
  reviewerId,
  defaultValues,
  categories,
  status,
}: {
  eventId: string;
  reviewerId: string;
  defaultValues: ReviewFormValues;
  categories: { id: number; name: string }[];
  status: 'PENDING_REVIEW' | 'APPROVED';
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'customizedQuestion',
  });

  const onReviewSubmit = async (newStatus: 'APPROVED' | 'PUBLISHED' | 'DRAFT' | undefined) => {
    const data = form.getValues();
    const formattedQuestions = data.customizedQuestion?.map((q) => q.question) || [];

    try {
      setLoading(true);
      await reviewEventAction(eventId, {
        ...data,
        customizedQuestion: formattedQuestions.map((q) => ({ question: q })),
        status: newStatus || status, // keep same status for Save
        reviewerId,
        
      });
      alert("Event updated.");
      router.push("/dashboard");
    } catch (err) {
      alert("Failed to update event.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6">Review Event</h1>
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div>
          <Label>Title</Label>
          <Input {...form.register("name")} />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea {...form.register("description")} />
        </div>
        <div>
          <Label>Location</Label>
          <Input {...form.register("location")} />
        </div>
        <div>
          <Label>Category</Label>
          <select {...form.register("categoryId")} className="w-full h-10 rounded border px-3">
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <Label>Start Time</Label>
            <Input type="datetime-local" {...form.register("eventStartTime")} />
          </div>
          <div className="flex-1">
            <Label>End Time</Label>
            <Input type="datetime-local" {...form.register("eventEndTime")} />
          </div>
        </div>
        <div>
          <Label>Available Seats</Label>
          <Input type="number" {...form.register("availableSeats", { valueAsNumber: true })} />
        </div>
        <div>
          <Label>Waitlist Capacity</Label>
          <Input
            type="number"
            {...form.register("waitlistCapacity", { valueAsNumber: true })}
          />
        </div>
        <div>
          <Label>Review Comment</Label>
          <Textarea 
            {...form.register("reviewComment")} 
            placeholder={status === "PENDING_REVIEW" 
              ? "Add comments for approval or rejection" 
              : "Optional comment for publishing"
            }
          />
        </div>
        <div>
          <Label>Custom Questions</Label>
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <Input {...form.register(`customizedQuestion.${index}.question`)} placeholder={`Question ${index + 1}`} />
                <Button type="button" variant="destructive" onClick={() => remove(index)}>Remove</Button>
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={() => append({ question: "" })}>
              + Add Question
            </Button>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          {status === "PENDING_REVIEW" && (
            <>
              <Button 
                type="button" 
                disabled={loading} 
                onClick={() => onReviewSubmit("APPROVED")}
              >
                Approve
              </Button>
              <Button 
                type="button" 
                disabled={loading} 
                variant="destructive" 
                onClick={() => onReviewSubmit("DRAFT")}
              >
                Reject
              </Button>
            </>
          )}
          {status === "APPROVED" && (
            <Button 
              type="button" 
              disabled={loading} 
              onClick={() => onReviewSubmit("PUBLISHED")}
            >
              Publish
            </Button>
          )}
          <Button 
            type="button" 
            variant="secondary" 
            disabled={loading} 
            onClick={() => onReviewSubmit(undefined)}
          >
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}