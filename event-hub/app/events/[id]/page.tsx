// app/events/[id]/page.tsx
import { getEventById } from '@/lib/db/events';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const event = await getEventById(params.id);
  if (!event) return notFound();

  const startDate = new Date(event.eventStartTime);
  const endDate = new Date(event.eventEndTime);

  const dateString = format(startDate, 'eeee, MMMM d, yyyy');
  const timeString = `${format(startDate, 'h:mm a')} - ${format(endDate, 'h:mm a')}`;

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 grid md:grid-cols-3 gap-12">
      <div className="md:col-span-1 text-sm text-muted-foreground space-y-2">
        <p>{dateString}</p>
        <p>{timeString}</p>
        <p>{event.location}</p>
        <Link
          href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.name)}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}&location=${encodeURIComponent(event.location)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          Google Calendar – ICS
        </Link>
      </div>

      <div className="md:col-span-2 space-y-6">
        <div>
          <h1 className="text-3xl font-bold leading-tight">{event.name}</h1>
        </div>

        <div className="space-y-2 text-sm">
          <p><strong>Talk title:</strong> {event.name}</p>
          <p><strong>Date & Time:</strong> {dateString}, {timeString}</p>
          <p><strong>Location:</strong> {event.location}</p>
          {event.lecturers && event.lecturers.length > 0 && (
            <p><strong>Speaker:</strong> {event.lecturers.map(l => `${l.lecturer.firstName} ${l.lecturer.lastName}`).join(', ')}</p>
          )}
        </div>

        {event.description && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Abstract:</h2>
            <p className="text-sm text-gray-700 whitespace-pre-line">{event.description}</p>
          </div>
        )}

        <Button asChild>
          <Link href={`/events/${event.id}/register`}>Register</Link>
        </Button>

        <Button asChild variant="outline" className="mt-4">
          <Link href="/events">Back to Events</Link>
        </Button>
      </div>
    </div>
  );
}
