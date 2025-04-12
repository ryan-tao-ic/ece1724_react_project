// app/dashboard/page.tsx

import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";
import t from "@/lib/i18n";
import { Button, Container } from "@/components/ui";
import { radius, spacing, text } from "@/lib/theme";
import { getTokenForServerComponent } from '@/lib/auth/auth';
import { notFound, redirect } from "next/navigation";
import { getUserRegistrations } from "@/lib/db/registration";
import { getCreatedEvents, getPendingReviewEvents, getApprovedEventsByReviewer, getPublishedEventsByReviewer, getCancelledEventsByReviewer } from "@/lib/db/events";
import { getUserById } from "@/lib/db/users";
import { formatDate, createCalendarLink } from "@/lib/utils";
import { CalendarIcon, ExternalLinkIcon, QrCodeIcon, XCircleIcon } from "lucide-react";
import { cancelRegistrationAction } from "@/app/actions";

export default async function DashboardPage() {
  const token = await getTokenForServerComponent();
  const id = token.id;
  if (!id) redirect("/login");

  const user = await getUserById(id);
  if (!user) return notFound();
  const role = user.role;

  let createdEvents: { id: string; name: string; status?: string; eventStartTime: Date; location: string; category: { name: string } }[] = [];
  if (role === 'LECTURER') {
    createdEvents = await getCreatedEvents(id);
  } else if (role === 'STAFF') {
    const pending = await getPendingReviewEvents();
    const approved = await getApprovedEventsByReviewer(id);
    const published = await getPublishedEventsByReviewer(id);
    const own = await getCreatedEvents(id);
    const cancelled = await getCancelledEventsByReviewer(id);
    const all = [...pending, ...approved, ...published, ...cancelled, ...own];
    const seen = new Set();
    createdEvents = all.filter(event => {
      if (seen.has(event.id)) return false;
      seen.add(event.id);
      return true;
    });
  }

  const visibleCreatedEvents = role === "LECTURER"
    ? createdEvents
    : role === "STAFF"
      ? createdEvents.filter(event => ["PENDING_REVIEW", "APPROVED", "PUBLISHED", "CANCELLED"].includes(event.status || ""))
      : [];

  const { upcoming, past } = await getUserRegistrations(id);

  return (
    <MainLayout>
      <Container className="py-10">
        {/* Header */}
        <div className="mb-6">
          <h1 className={`font-bold tracking-tight ${text["3xl"]}`}>
            {t("dashboard.title")}
          </h1>
          <p className="text-muted-foreground">{t("dashboard.description")}</p>
        </div>

        {/* Upcoming Events */}
        <Section title={t("dashboard.upcomingEvents.title")} events={upcoming} type="upcoming" />

        {/* Past Events */}
        <Section title={t("dashboard.pastEvents.title")} events={past} type="past" />

        {/* My Created Events */}
        {(role === "LECTURER" || role === "STAFF") && (
          <div className="mt-12">
            <h2 className={`font-semibold mb-4 ${text.xl}`}>My Created Events</h2>
            {visibleCreatedEvents.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {visibleCreatedEvents.map(event => (
                  <div key={event.id} className="border rounded-lg p-5 bg-white shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium truncate">{event.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        event.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                        event.status === 'PENDING_REVIEW' ? 'bg-amber-100 text-amber-800' :
                        event.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                        event.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                        event.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {event.status}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1 mb-4">
                      <div><strong>Date:</strong> {formatDate(event.eventStartTime)}</div>
                      <div><strong>Location:</strong> {event.location}</div>
                      <div><strong>Category:</strong> {event.category.name}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/events/${event.id}`}>View Details</Link>
                      </Button>

                      {/* LECTURER can edit all but published */}
                      {role === "LECTURER" && event.status !== "PUBLISHED" && (
                        <Button variant="secondary" size="sm" asChild>
                          <Link href={`/events/${event.id}/edit`}>Continue Editing</Link>
                        </Button>
                      )}

                      {/* STAFF logic: */}
                      {role === "STAFF" && ["PENDING_REVIEW", "APPROVED"].includes(event.status || "") && (
                        <Button variant="secondary" size="sm" asChild>
                          <Link href={`/events/${event.id}/review`}>Review Event</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`border border-dashed p-8 text-center ${radius.lg}`}>
                <h3 className={`font-medium ${text.lg}`}>
                  {role === "STAFF"
                    ? "No events available for review."
                    : "You haven’t created any events yet."}
                </h3>
                {role === "LECTURER" && (
                  <>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Ready to contribute a lecture or event?
                    </p>
                    <Button className="mt-4" asChild>
                      <Link href="/events/create">Submit an Event</Link>
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </Container>
    </MainLayout>
  );
}

// Subcomponent to render Upcoming/Past events
function Section({ title, events, type }: { title: string; events: any[]; type: "upcoming" | "past" }) {
  const isUpcoming = type === "upcoming";
  return (
    <div className="mb-10">
      <h2 className={`font-semibold mb-4 ${text.xl}`}>{title}</h2>
      {events.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map(reg => (
            <div key={reg.id} className="border rounded-lg p-5 bg-white">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium truncate">{reg.event.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  reg.status === 'REGISTERED' ? 'bg-green-100 text-green-800' :
                  reg.status === 'WAITLISTED' ? 'bg-yellow-100 text-yellow-800' :
                  reg.status === 'ATTENDED' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>{reg.status}</span>
              </div>
              <div className="text-sm text-muted-foreground space-y-1 mb-4">
                <div><strong>Date:</strong> {formatDate(reg.event.eventStartTime)}</div>
                <div><strong>Location:</strong> {reg.event.location}</div>
                <div><strong>Category:</strong> {reg.event.category.name}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/events/${reg.event.id}`}>
                    <ExternalLinkIcon className="h-3.5 w-3.5 mr-1" />
                    Event Details
                  </Link>
                </Button>
                {isUpcoming && reg.status === 'REGISTERED' && (
                  <>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/events/${reg.event.id}/register`}>
                        <QrCodeIcon className="h-3.5 w-3.5 mr-1" />
                        View QR Code
                      </Link>
                    </Button>
                    <form action={cancelRegistrationAction}>
                      <input type="hidden" name="eventId" value={reg.event.id} />
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" type="submit">
                        <XCircleIcon className="h-3.5 w-3.5 mr-1" />
                        Cancel Registration
                      </Button>
                    </form>
                    <a
                      href={createCalendarLink({
                        name: reg.event.name,
                        location: reg.event.location,
                        eventStartTime: reg.event.eventStartTime.toString(),
                        eventEndTime: reg.event.eventEndTime.toString(),
                      })}
                      target="_blank"
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                      Add to Calendar
                    </a>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`border border-dashed p-8 text-center ${radius.lg}`}>
          <h3 className={`font-medium ${text.lg}`}>
            {isUpcoming ? t("dashboard.upcomingEvents.empty.title") : t("dashboard.pastEvents.empty.title")}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {isUpcoming ? t("dashboard.upcomingEvents.empty.description") : t("dashboard.pastEvents.empty.description")}
          </p>
          {isUpcoming && (
            <Button className="mt-4" asChild>
              <Link href="/events">{t("dashboard.upcomingEvents.empty.action")}</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
