// app/events/[id]/review/page.tsx

import { getCategories } from "@/app/actions";
import { MainLayout } from "@/components/layout/main-layout";
import { Container } from "@/components/ui/container";
import { getTokenForServerComponent } from "@/lib/auth/auth";
import { getEventById } from "@/lib/db/events";
import { getUserById } from "@/lib/db/users";
import { format, toZonedTime } from 'date-fns-tz';
import { notFound, redirect } from "next/navigation";
import ReviewEventClientForm from "./ReviewEventClientForm";

const torontoTimeZone = 'America/Toronto';

// Helper to format UTC Date to local datetime-local string (Toronto)
const formatUtcToLocalInput = (date: Date): string => {
  const zonedTime = toZonedTime(date, torontoTimeZone);
  // Format needed by datetime-local input: YYYY-MM-DDTHH:mm
  return format(zonedTime, "yyyy-MM-dd'T'HH:mm");
};

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
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          formattedQuestions = parsed
            .map((q: unknown) => {
              if (typeof q === "string") return { question: q };
              if (typeof q === "object" && q !== null && "question" in q && typeof q.question === "string") {
                return { question: q.question };
              }
              return null; // Invalid item
            })
            .filter((item): item is { question: string } => item !== null);
        }
      } catch (e) {
        console.error("Error parsing customizedQuestion string:", e);
      }
    } else if (Array.isArray(raw)) {
      // Handle if raw is already a JsonArray
      formattedQuestions = raw
        .map((q) => { // q is JsonValue here
          if (typeof q === "string") return { question: q };
          if (typeof q === "object" && q !== null && "question" in q && typeof q.question === "string") {
            return { question: q.question };
          }
          return null; // Invalid item
        })
        .filter((item): item is { question: string } => item !== null);
    } else if (raw && typeof raw === 'object') {
      // Handle case where raw might be a single object like { question: "..." }
      if ("question" in raw && typeof raw.question === "string") {
        formattedQuestions = [{ question: raw.question }];
      }
    }
  } catch (e) {
    console.error("Error processing customizedQuestion:", e);
  }

  return (
    <MainLayout>
      <Container>
        <ReviewEventClientForm
          eventId={event.id}
          reviewerId={userId}
          status={event.status as "PENDING_REVIEW" | "APPROVED"}
          defaultValues={{
            name: event.name,
            description: event.description || "",
            location: event.location,
            categoryId: String(event.category.id),
            eventStartTime: formatUtcToLocalInput(event.eventStartTime),
            eventEndTime: formatUtcToLocalInput(event.eventEndTime),
            availableSeats: event.availableSeats,
            waitlistCapacity: event.waitlistCapacity ?? 0,
            reviewComment: event.reviewComment || "",
            customizedQuestion: formattedQuestions,
          }}
          categories={categories}
        />
      </Container>
    </MainLayout>
  );
}
