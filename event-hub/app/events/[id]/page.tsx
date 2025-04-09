// app/events/[id]/page.tsx 
import { getEventById } from '@/lib/db/events';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getTokenForServerComponent } from '@/lib/auth/auth';
import { getUserRegistration } from '@/lib/db/registration';
import { InfoIcon } from 'lucide-react';

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;
  if (!id) return notFound();
  
  const event = await getEventById(id);
  if (!event) return notFound();

  // const session = await getServerSession(authOptions);
  // const userId = session?.user?.id;
  // const {userId} = await getTokenForServerComponent(); 
  const token = await getTokenForServerComponent();
  const userId = token.id;

  let userRegistration = null;
  let isUserLecturer = false;
  
  if (userId) {
    userRegistration = await getUserRegistration(event.id, userId);
    
    isUserLecturer = event.lecturers.some(
      (l: { lecturer: { id: string } }) => l.lecturer.id === userId
    );
  }

  const startDate = new Date(event.eventStartTime);
  const endDate = new Date(event.eventEndTime);

  const dateString = format(startDate, 'eeee, MMMM d, yyyy');
  const timeString = `${format(startDate, 'h:mm a')} - ${format(endDate, 'h:mm a')}`;

  let registerButtonText = "Register";
  let showRegisterButton = true;
  let registrationMessage = null;
  
  if (!userId) {
    registerButtonText = "Login to Register";
  } else if (isUserLecturer) {
    showRegisterButton = false;
    registrationMessage = {
      type: "info",
      text: "You are a lecturer for this event. You do not need to register."
    };
  } else if (userRegistration) {
    showRegisterButton = true;
    registerButtonText = "Manage Registration";
    
    if (userRegistration.status === "REGISTERED") {
      registrationMessage = {
        type: "success",
        text: "You are registered for this event."
      };
    } else if (userRegistration.status === "WAITLISTED") {
      registrationMessage = {
        type: "warning",
        text: "You are on the waitlist for this event."
      };
    }
  }

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
            <p><strong>Speaker:</strong> {event.lecturers.map((l: { lecturer: { firstName: any; lastName: any; }; }) => `${l.lecturer.firstName} ${l.lecturer.lastName}`).join(', ')}</p>
          )}
        </div>

        {event.description && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Abstract:</h2>
            <p className="text-sm text-gray-700 whitespace-pre-line">{event.description}</p>
          </div>
        )}

        {registrationMessage && (
          <div className={`p-3 rounded-md ${
            registrationMessage.type === "success" ? "bg-green-50 text-green-700 border border-green-200" :
            registrationMessage.type === "warning" ? "bg-amber-50 text-amber-700 border border-amber-200" :
            "bg-blue-50 text-blue-700 border border-blue-200"
          }`}>
            <div className="flex items-center gap-2">
              <InfoIcon className="h-4 w-4" />
              <p className="text-sm font-medium">{registrationMessage.text}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          {showRegisterButton && (
            <Button asChild>
              <Link href={userId ? `/events/${event.id}/register` : "/login"}>
                {registerButtonText}
              </Link>
            </Button>
          )}

          <Button asChild variant="outline">
            <Link href="/events">Back to Events</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}