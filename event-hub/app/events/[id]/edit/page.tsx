// app/events/[id]/edit/page.tsx
// This file is a server component that handles the editing process for an event.
// It retrieves the event details, user information, and categories for the event.

import { getEventById } from "@/lib/db/events"; 
import { getCategories } from "@/app/actions"; 
import { notFound, redirect } from "next/navigation"; 
import EditEventClientForm from "./EditEventClientForm";
import { getTokenForServerComponent } from '@/lib/auth/auth';
import { getUserById } from "@/lib/db/users";

export default async function EditEventPage({
  params, 
}: {
  params: { id: string }; 
}) {
  const resolvedParams = await params;
  
  const token = await getTokenForServerComponent();
  const userId = token.id;
  if (!userId) redirect("/login");
  
  const user = await getUserById(userId);
  if (!user) return notFound();
  
  const event = await getEventById(resolvedParams.id);
  if (!event) return notFound();

  if (event.status === 'PUBLISHED' && user.role !== 'STAFF') {
    redirect(`/events/${event.id}`);
  }

  const wasRejected =
    event.status === 'DRAFT' &&
    !!event.reviewedBy && 
    !!event.reviewComment;
  
  const categories = await getCategories();
  
  let formattedQuestions;
  try {
    if (typeof event.customizedQuestion === 'string' && event.customizedQuestion) {
      const parsed = JSON.parse(event.customizedQuestion);
      formattedQuestions = Array.isArray(parsed) 
        ? parsed.map(item => typeof item === 'string' ? { question: item } : item)
        : [{ question: event.customizedQuestion }];
    } 
    else if (Array.isArray(event.customizedQuestion)) {
      formattedQuestions = event.customizedQuestion.map(q => {
        if (q && typeof q === 'object' && 'question' in q) {
          return q;
        }
        else if (typeof q === 'string') {
          return { question: q };
        }
        return { question: String(q) };
      });
    }
    else if (event.customizedQuestion === null || event.customizedQuestion === undefined) {
      formattedQuestions = [];
    }
    else {
      formattedQuestions = [{ question: String(event.customizedQuestion) }];
    }
  } catch (error) {
    console.error("Error parsing customizedQuestion:", error);
    formattedQuestions = [];
  }
  
  return (
    <EditEventClientForm
      eventId={event.id}
      wasRejected={wasRejected}
      reviewComment={event.reviewComment || ""}
      defaultValues={{
        name: event.name,
        location: event.location,
        eventStartTime: new Date(event.eventStartTime).toISOString().substring(0, 16),
        eventEndTime: new Date(event.eventEndTime).toISOString().substring(0, 16),
        availableSeats: event.availableSeats,
        categoryId: event.category.id.toString(),
        description: event.description || '',
        customizedQuestion: formattedQuestions,
        status: ['DRAFT', 'PENDING_REVIEW', 'APPROVED'].includes(event.status) 
          ? event.status as 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' 
          : undefined,
      }}
      categories={categories}
    />
  );
}