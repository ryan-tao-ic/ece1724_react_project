"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import QrCode from "@/components/qr-code";
import CancelledRedirect from "@/components/cancelled-redirect";
import CalendarSubscription from "@/components/calendar/CalendarSubscription";
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

  if (cancelled) return <CancelledRedirect eventName={event.name} />;

  if (status === "LECTURER_CANNOT_REGISTER") {
    return (
      <div className="max-w-xl mx-auto py-10 space-y-6 text-center">
        <h1 className="text-2xl font-bold text-amber-600">You cannot register for this event</h1>
        <p className="text-sm">As a lecturer for this event, you are automatically included and do not need to register.</p>
        <Button asChild><a href="/dashboard">Return to Dashboard</a></Button>
      </div>
    );
  }

  if (status === "FULL") {
    return (
      <div className="max-w-xl mx-auto py-10 space-y-6 text-center">
        <h1 className="text-2xl font-bold">We're sorry, this event and its waitlist are both full.</h1>
        <p className="text-sm">Event: {event.name}</p>
        <Button asChild><a href="/dashboard">Return to Dashboard</a></Button>
      </div>
    );
  }

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
            <div className="flex justify-center mt-4">
              <CalendarSubscription eventId={event.id} />
            </div>
          </>
        )}

        <form action={cancelRegistrationAction} className="pt-2">
          <input type="hidden" name="eventId" value={event.id} />
          <Button variant="destructive" type="submit">Cancel Registration</Button>
        </form>
        <Button asChild><a href="/dashboard">Return to Dashboard</a></Button>
      </div>
    );
  }

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
            <div className="flex justify-center mt-4">
              <CalendarSubscription eventId={event.id} />
            </div>
          </>
        )}

        <form action={cancelRegistrationAction} className="pt-2">
          <input type="hidden" name="eventId" value={event.id} />
          <Button variant="destructive" type="submit">Cancel Registration</Button>
        </form>
        <Button asChild><a href="/dashboard">Go to Dashboard</a></Button>
      </div>
    );
  }

  const customQuestions = Array.isArray(event.customizedQuestion) ? event.customizedQuestion : [];
  const roles = ['Undergraduate Student', 'Graduate Student', 'Faculty/Staff', 'General Public'];

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-3xl font-bold text-center mb-8">Register for: {event.name}</h1>
      <form action={registerToEvent} className="space-y-8">
        <input type="hidden" name="eventId" value={event.id} />

        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Basic Information</h2>
          <div className="space-y-1.5">
            <Label>Full Name</Label>
            <Input value={`${user.firstName} ${user.lastName}`} readOnly />
          </div>
          <div className="space-y-1.5">
            <Label>Email Address</Label>
            <Input type="email" value={user.email} readOnly />
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Optional Details</h2>
          <div className="space-y-1.5">
            <Label>Phone Number</Label>
            <Input name="phoneNumber" type="tel" defaultValue={user.phoneNumber || ''} />
          </div>
          <div className="space-y-1.5">
            <Label>Affiliation</Label>
            <Input name="affiliation" defaultValue={user.affiliation || ''} />
          </div>
          <div className="space-y-1.5">
            <Label>Role in the Event</Label>
            <RadioGroup name="role" required className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1.5">
              {roles.map(role => (
                <div key={role} className="flex items-center space-x-2">
                  <RadioGroupItem value={role} id={role} />
                  <Label htmlFor={role}>{role}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        {customQuestions.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Additional Questions</h2>
            {customQuestions.map((item: { question: string }, index: number) => (
              <div key={index} className="space-y-1.5">
                <Label>{item.question}</Label>
                {item.question.toLowerCase().includes("why") || item.question.toLowerCase().includes("goal") ? (
                  <Textarea name={`custom_${index}`} />
                ) : (
                  <Input name={`custom_${index}`} />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-4 pt-2">
          <Button type="submit">Submit Registration</Button>
          <Button type="button" variant="outline" asChild><a href="/dashboard">Cancel</a></Button>
        </div>
      </form>
    </div>
  );
}