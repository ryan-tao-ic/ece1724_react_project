// app//events/[id]/review/ReviewEventClientForm.tsx

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format, toZonedTime } from 'date-fns-tz';
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { reviewEventAction } from "@/app/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

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
  customizedQuestion: z
    .array(z.object({ question: z.string().min(1) }))
    .optional(),
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
  status: "PENDING_REVIEW" | "APPROVED";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [missingCommentError, setMissingCommentError] = useState(false);

  // Calculate the minimum allowed date/time (now in Toronto)
  const torontoTimeZone = 'America/Toronto';
  const nowInToronto = toZonedTime(new Date(), torontoTimeZone);
  // Format for datetime-local input: YYYY-MM-DDTHH:mm
  const minDateTime = format(nowInToronto, "yyyy-MM-dd'T'HH:mm");

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "customizedQuestion",
  });

  const onReviewSubmit = async (
    newStatus: "APPROVED" | "PUBLISHED" | "DRAFT" | undefined
  ) => {
    setError("");
    setMissingCommentError(false);

    const data = form.getValues();
    const formattedQuestions =
      data.customizedQuestion?.map((q) => q.question) || [];

    if (newStatus === "DRAFT") {
      const comment = data.reviewComment?.trim();
      if (!comment) {
        setMissingCommentError(true);
        return;
      }
    }

    try {
      setLoading(true);

      await reviewEventAction(eventId, {
        ...data,
        customizedQuestion: formattedQuestions.map((q) => ({ question: q })),
        status: newStatus || status, // keep same status for Save
        reviewerId,
      });
      // Determine success message based on action
      let successMessage = "Event saved successfully.";
      if (newStatus === "APPROVED") successMessage = "Event approved successfully.";
      else if (newStatus === "PUBLISHED") successMessage = "Event published successfully.";
      else if (newStatus === "DRAFT") successMessage = "Event rejected successfully.";

      toast.success(successMessage);
      router.push("/dashboard");
    } catch (err) {
      const errorMessage = "Failed to update event.";
      setError(errorMessage); // Keep state for potential inline display
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-10">
      <h1 className="text-4xl font-bold leading-tight tracking-tight">
        Review Event
      </h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {missingCommentError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            Please provide a review comment when rejecting the event.
          </AlertDescription>
        </Alert>
      )}

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Title</Label>
          <Input {...form.register("name")} />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">
            Description
          </Label>
          <Textarea {...form.register("description")} rows={4} />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Location</Label>
          <Input {...form.register("location")} />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Category</Label>
          <select
            {...form.register("categoryId")}
            className="w-full h-10 rounded border border-gray-300 px-3"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Start Time
            </Label>
            <Input
              type="datetime-local"
              {...form.register("eventStartTime")}
              min={minDateTime}
            />
          </div>
          <div className="flex-1 space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              End Time
            </Label>
            <Input
              type="datetime-local"
              {...form.register("eventEndTime")}
              min={minDateTime}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">
            Available Seats
          </Label>
          <Input
            type="number"
            {...form.register("availableSeats", { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">
            Waitlist Capacity
          </Label>
          <Input
            type="number"
            {...form.register("waitlistCapacity", { valueAsNumber: true })}
          />
        </div>

        {/* Review Comment */}
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-gray-800">
            Review Comment
          </Label>
          <Textarea
            {...form.register("reviewComment")}
            placeholder={
              status === "PENDING_REVIEW"
                ? "Add comments for approval or rejection"
                : "Optional comment for publishing"
            }
            rows={3}
            className={missingCommentError ? "border-red-500" : ""}
          />
          {missingCommentError && (
            <p className="text-sm text-red-500 mt-1">
              Review comment is required when rejecting an event.
            </p>
          )}
        </div>

        {/* Custom Questions */}
        <div className="space-y-2 p-4 border rounded-md bg-gray-50">
          <Label className="text-sm font-semibold text-gray-800">
            Custom Questions
          </Label>
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <Input
                  {...form.register(`customizedQuestion.${index}.question`)}
                  placeholder={`Question ${index + 1}`}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => remove(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              onClick={() => append({ question: "" })}
            >
              + Add Question
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
            className="sm:mr-auto"
          >
            Return
          </Button>
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
            variant="outline"
            onClick={() => onReviewSubmit(undefined)}
          >
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}
