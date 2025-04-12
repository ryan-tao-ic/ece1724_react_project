// app/events/[id]/register/RegisterClientForm.tsx
// This file is a client component that handles the registration form for an event.
// It includes the form fields for user input, handles the registration process, and displays the QR code if the registration is successful.  

"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import QrCode from "@/components/qr-code";
import CancelledRedirect from "@/components/cancelled-redirect";
import { cancelRegistrationAction, registerToEvent } from "@/app/actions";

export default function RegisterClientForm({
  user,
  event,
  registration,
  searchParams,
}: {
  user: any;
  event: any;
  registration: any;
  searchParams?: { status?: string; code?: string; cancelled?: string };
}) {
  const status = searchParams?.status;
  const qrCode = searchParams?.code;
  const cancelled = searchParams?.cancelled === "1";

  const start = new Date(event.eventStartTime).toISOString().replace(/[-:]/g, '').split('.')[0];
  const end = new Date(event.eventEndTime).toISOString().replace(/[-:]/g, '').split('.')[0];

  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.name)}&dates=${start}/${end}&location=${encodeURIComponent(event.location)}`;

  // Cancelled flow
  if (cancelled) {
    return <CancelledRedirect eventName={event.name} />;
  }

  if (status === "LECTURER_CANNOT_REGISTER") {
    return (
      <div className="max-w-xl mx-auto py-10 space-y-6 text-center">
        <h1 className="text-2xl font-bold text-amber-600">
          You cannot register for this event
        </h1>
        <p className="text-sm">
          As a lecturer for this event, you are automatically included and do not need to register.
        </p>
        <Button asChild>
          <a href="/dashboard">Return to Dashboard</a>
        </Button>
      </div>
    );
  }

  if (status === "FULL") {
    return (
      <div className="max-w-xl mx-auto py-10 space-y-6 text-center">
        <h1 className="text-2xl font-bold">
          We're sorry, this event and its waitlist are both full.
        </h1>
        <p className="text-sm">Event: {event.name}</p>
        <Button asChild>
          <a href="/dashboard">Return to Dashboard</a>
        </Button>
      </div>
    );
  }

  // Fresh redirect after registration
  if ((status === "REGISTERED" || status === "WAITLISTED") && qrCode) {
    return (
      <div className="max-w-xl mx-auto py-10 space-y-6 text-center">
        <h1 className="text-2xl font-bold">
          {status === "REGISTERED" ? "Registration successful!" : "You have been added to the waitlist!"}
        </h1>
        <p className="text-sm">Event: {event.name}</p>
        
        {status === "REGISTERED" && (
          <>
            <p className="text-sm">QR Code</p>
            <div className="flex justify-center">
              <QrCode value={qrCode} />
            </div>
            <a href={calendarUrl} target="_blank" className="text-blue-600 underline">
              Add to Google Calendar
            </a>
          </>
        )}
        
        <form action={cancelRegistrationAction}>
          <input type="hidden" name="eventId" value={event.id} />
          <Button variant="destructive" type="submit">Cancel Registration</Button>
        </form>
        <Button asChild>
          <a href="/dashboard">Return to Dashboard</a>
        </Button>
      </div>
    );
  }

  // Already registered in DB
  if (registration?.status === "REGISTERED" || registration?.status === "WAITLISTED") {
    return (
      <div className="max-w-xl mx-auto py-10 space-y-6 text-center">
        <h1 className="text-2xl font-bold">
          {registration.status === "REGISTERED" ? "You have already registered for this event." : "You are already on the waitlist for this event."}
        </h1>
        <p className="text-sm">Event: {event.name}</p>
        
        {registration.status === "REGISTERED" && (
          <>
            <p className="text-sm">QR Code</p>
            <div className="flex justify-center">
              <QrCode value={registration.qrCode} />
            </div>
            <a href={calendarUrl} target="_blank" className="text-blue-600 underline">
              Add to Google Calendar
            </a>
          </>
        )}
        
        <form action={cancelRegistrationAction}>
          <input type="hidden" name="eventId" value={event.id} />
          <Button variant="destructive" type="submit">Cancel Registration</Button>
        </form>
        <Button asChild>
          <a href="/dashboard">Go to Dashboard</a>
        </Button>
      </div>
    );
  }

  type CustomQuestion = { question: string };

  const customQuestions: CustomQuestion[] = Array.isArray(event.customizedQuestion)
    ? event.customizedQuestion
    : [];

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Register for: {event.name}</h1>
      <form action={registerToEvent} className="space-y-4">
        <input type="hidden" name="eventId" value={event.id} />

        <div>
          <Label>Full Name</Label>
          <Input value={`${user.firstName} ${user.lastName}`} readOnly />
        </div>

        <div>
          <Label>Email Address</Label>
          <Input type="email" value={user.email} readOnly />
        </div>

        <div>
          <Label>Phone Number (optional)</Label>
          <Input name="phoneNumber" type="tel" defaultValue={user.phoneNumber || ''} />
        </div>

        <div>
          <Label>Role in the Event</Label>
          <RadioGroup name="role" required>
            {['Undergraduate Student', 'Graduate Student', 'Faculty/Staff', 'General Public'].map((role) => (
              <div key={role} className="flex items-center space-x-2">
                <RadioGroupItem value={role} id={role} />
                <Label htmlFor={role}>{role}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div>
          <Label>Affiliation (optional)</Label>
          <Input name="affiliation" defaultValue={user.affiliation || ''} />
        </div>

        {customQuestions.map((item, index) => {
          const label = typeof item?.question === 'string' ? item.question : '';
          return (
            <div key={index}>
              <Label>{label}</Label>
              {label.toLowerCase().includes('why') || label.toLowerCase().includes('goal') ? (
                <Textarea name={`custom_${index}`} />
              ) : (
                <Input name={`custom_${index}`} />
              )}
            </div>
          );
        })}

        <Button type="submit">Submit Registration</Button>
      </form>
    </div>
  );
}