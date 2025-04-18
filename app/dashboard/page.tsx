// app/dashboard/page.tsx

import { cancelRegistrationAction } from "@/app/actions";
import { MainLayout } from "@/components/layout/main-layout";
import { Button, Container } from "@/components/ui";
import { getTokenForServerComponent } from '@/lib/auth/auth';
import { getApprovedEventsByReviewer, getCancelledEventsByReviewer, getCreatedEvents, getPendingReviewEvents, getPublishedEventsByReviewer } from "@/lib/db/events";
import { getUserRegistrations } from "@/lib/db/registration";
import { getUserById } from "@/lib/db/users";
import t from "@/lib/i18n";
import { createCalendarLink, formatDate } from "@/lib/utils";
import { CalendarIcon, ExternalLinkIcon, MapPin, QrCodeIcon, Tag, XCircleIcon } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

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
      <Container className="py-12">
        {/* Header */}
        <div className="bg-white rounded-lg border p-8 shadow-sm mb-10">
          <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-2">
            {t("dashboard.title")}
          </h1>
          <p className="text-gray-600 max-w-2xl">
            {role === "STAFF"
              ? "Review, manage, and publish events submitted by lecturers."
              : t("dashboard.description")}
          </p>
        </div>

        {role !== 'STAFF' && (
          <>
            {/* Upcoming Events */}
            <Section title={t("dashboard.upcomingEvents.title")} events={upcoming} type="upcoming" />

            {/* Past Events */}
            <Section title={t("dashboard.pastEvents.title")} events={past} type="past" />
          </>
        )}

        {/* My Created Events */}
        {(role === "LECTURER" || role === "STAFF") && (
          <div className="mt-12">
            <div className="flex items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {role === "STAFF" ? "Events You are Reviewing or Reviewed" : "My Created Events"}
              </h2>
            </div>
            {visibleCreatedEvents.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {visibleCreatedEvents.map(event => (
                  <div key={event.id} className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300">
                    <div className="border-l-4 border-primary p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-semibold text-gray-900 line-clamp-1">{event.name}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${event.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                            event.status === 'PENDING_REVIEW' ? 'bg-amber-100 text-amber-800' :
                              event.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                                event.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                                  event.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                    'bg-red-100 text-red-800'
                          }`}>
                          {event.status}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-600">
                          <span className="text-lg mr-2 flex-shrink-0" aria-hidden="true">🗓️</span>
                          <CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" />
                          <span className="text-sm">{formatDate(event.eventStartTime)}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <span className="text-lg mr-2 flex-shrink-0" aria-hidden="true">📍</span>
                          <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" />
                          <span className="text-sm truncate">{event.location}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <span className="text-lg mr-2 flex-shrink-0" aria-hidden="true">🏷️</span>
                          <Tag className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" />
                          <span className="text-sm">{event.category.name}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" asChild className="flex-1">
                          <Link href={`/events/${event.id}`}>View Details</Link>
                        </Button>

                        {/* LECTURER can edit all but published */}
                        {role === "LECTURER" && event.status !== "PUBLISHED" && (
                          <Button variant="secondary" size="sm" asChild className="flex-1">
                            <Link href={`/events/${event.id}/edit`}>Continue Editing</Link>
                          </Button>
                        )}

                        {/* STAFF logic: */}
                        {role === "STAFF" && ["PENDING_REVIEW", "APPROVED"].includes(event.status || "") && (
                          <Button variant="secondary" size="sm" asChild className="flex-1">
                            <Link href={`/events/${event.id}/review`}>Review Event</Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900">
                  {role === "STAFF"
                    ? "No events available for review."
                    : "You haven't created any events yet."}
                </h3>
                {role === "LECTURER" && (
                  <>
                    <p className="mt-1 text-sm text-gray-500">
                      Ready to contribute an event?
                    </p>
                    <Button className="mt-4" asChild>
                      <Link href="/events/create">Apply for an Event</Link>
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
      <div className="flex items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>
      {events.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map(reg => (
            <div key={reg.id} className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="border-l-4 border-primary p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold text-gray-900 line-clamp-1">{reg.event.name}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${reg.status === 'REGISTERED' ? 'bg-green-100 text-green-800' :
                      reg.status === 'WAITLISTED' ? 'bg-yellow-100 text-yellow-800' :
                        reg.status === 'ATTENDED' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                    }`}>{reg.status}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <span className="text-lg mr-2 flex-shrink-0" aria-hidden="true">🗓️</span>
                    <CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" />
                    <span className="text-sm">{formatDate(reg.event.eventStartTime)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="text-lg mr-2 flex-shrink-0" aria-hidden="true">📍</span>
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" />
                    <span className="text-sm truncate">{reg.event.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="text-lg mr-2 flex-shrink-0" aria-hidden="true">🏷️</span>
                    <Tag className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" />
                    <span className="text-sm">{reg.event.category.name}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button variant="outline" size="sm" asChild className="flex-grow-0">
                    <Link href={`/events/${reg.event.id}`}>
                      <ExternalLinkIcon className="h-3.5 w-3.5 mr-1" />
                      Event Details
                    </Link>
                  </Button>
                  {isUpcoming && reg.status === 'REGISTERED' && reg.event.status !== 'CANCELLED' && (
                    <>
                      <Button variant="outline" size="sm" asChild className="flex-grow-0">
                        <Link href={`/events/${reg.event.id}/register`}>
                          <QrCodeIcon className="h-3.5 w-3.5 mr-1" />
                          View QR Code
                        </Link>
                      </Button>
                      <div className="flex w-full gap-2 mt-2">
                        <form action={cancelRegistrationAction} className="flex-grow">
                          <input type="hidden" name="eventId" value={reg.event.id} />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 w-full justify-center"
                            type="submit"
                          >
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
                          className="flex items-center justify-center text-sm text-blue-600 hover:text-blue-800 border border-blue-200 rounded-md px-3 py-1 hover:bg-blue-50 transition-colors"
                        >
                          <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                          Add to Calendar
                        </a>
                      </div>
                    </>
                  )}

                  {isUpcoming && reg.event.status === 'CANCELLED' && (
                    <p className="text-sm text-red-600 font-medium mt-2 w-full">This event has been cancelled.</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">
            {isUpcoming ? t("dashboard.upcomingEvents.empty.title") : t("dashboard.pastEvents.empty.title")}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
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
