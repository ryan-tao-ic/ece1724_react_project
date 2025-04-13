// app/events/[id]/review/page.tsx

import { getEventById } from "@/lib/db/events";
import { getCategories } from "@/app/actions";
import { getTokenForServerComponent } from "@/lib/auth/auth";
import { getUserById } from "@/lib/db/users";
import { notFound, redirect } from "next/navigation";
import ReviewEventClientForm from "./ReviewEventClientForm";

export default async function ReviewEventPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const eventId = decodeURIComponent(id);
  const token = await getTokenForServerComponent();
  const userId = token?.id;
  if (!userId) redirect("/login");

  const user = await getUserById(userId);
  if (!user || user.role !== "STAFF") redirect("/dashboard");

  const event = await getEventById(eventId);
  if (!event) return notFound();

  // Stricter access: check reviewedBy
  const canReview = 
    (event.status === "PENDING_REVIEW" && (!event.reviewedBy || event.reviewedBy === userId)) ||
    (["APPROVED", "PUBLISHED"].includes(event.status) && event.reviewedBy === userId && event.reviewedBy !== null);

  if (!canReview) {
    return notFound(); // deny access to unrelated staff
  }


  const categories = await getCategories();

  let formattedQuestions: { question: string }[] = [];
  try {
    const raw = event.customizedQuestion;
    if (typeof raw === "string") {
      formattedQuestions = JSON.parse(raw).map((q: string) => ({ question: q }));
    } else if (Array.isArray(raw)) {
      formattedQuestions = raw.map((q: any) =>
        typeof q === "string" ? { question: q } : q
      );
    }
  } catch (e) {
    console.error("Parse question error", e);
  }

  return (
    <ReviewEventClientForm
      eventId={event.id}
      reviewerId={userId}
      status={event.status as "PENDING_REVIEW" | "APPROVED"}
      defaultValues={{
        name: event.name,
        description: event.description || "",
        location: event.location,
        categoryId: String(event.category.id),
        eventStartTime: new Date(event.eventStartTime).toISOString().slice(0, 16),
        eventEndTime: new Date(event.eventEndTime).toISOString().slice(0, 16),
        availableSeats: event.availableSeats,
        waitlistCapacity: event.waitlistCapacity ?? 0,
        reviewComment: event.reviewComment || "",
        customizedQuestion: formattedQuestions,
      }}
      categories={categories}
    />
  );
}
