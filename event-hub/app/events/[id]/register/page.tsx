// app/events/[id]/register/page.tsx
import { getEventById } from '@/lib/db/events';
import { getUserById } from '@/lib/db/users';
import { getUserRegistration } from '@/lib/db/registration';
import { registerToEvent, cancelRegistrationAction } from '@/app/actions';
import { notFound } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import QrCode from '@/components/qr-code';
import CancelledRedirect from '@/components/cancelled-redirect';

export default async function RegisterPage({ params, searchParams }: {
  params: { id: string },
  searchParams?: { status?: string; code?: string; cancelled?: string }
}) {
  const event = await getEventById(params.id);
  if (!event) return notFound();

  const user = await getUserById('80d882bd-af72-4566-9e8e-ad5559cccf48');
  if (!user) return notFound();

  const cancelled = searchParams?.cancelled === '1';
  
  // ✅ Cancelled flow
  if (cancelled) {
    return <CancelledRedirect eventName={event.name} />;
  }

  // Check if this is a redirect from a fresh registration with status parameter
  const status = searchParams?.status;
  const qrCode = searchParams?.code;
  
  // ✅ Newly registered via redirect (use URL state)
  if (status === 'REGISTERED' && qrCode) {
    return (
      <div className="max-w-xl mx-auto py-10 space-y-6 text-center">
        <h1 className="text-2xl font-bold">Registration successful!</h1>
        <p className="text-sm">Event: {event.name}</p>
        <p className="text-sm">QR Code</p>
        <div className="flex justify-center">
          <QrCode value={qrCode} />
        </div>
        <a
          href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.name)}&dates=${event.eventStartTime.toISOString().replace(/[-:]/g, '').split('.')[0]}/${event.eventEndTime.toISOString().replace(/[-:]/g, '').split('.')[0]}&location=${encodeURIComponent(event.location)}`}
          target="_blank"
          className="text-blue-600 underline"
        >
          Add to Google Calendar
        </a>
        <form action={cancelRegistrationAction}>
          <input type="hidden" name="eventId" value={event.id} />
          <input type="hidden" name="userId" value={user.id} />
          <Button variant="destructive" type="submit">Cancel Registration</Button>
        </form>
        <Button asChild>
          <a href="/dashboard">Return to Dashboard</a>
        </Button>
      </div>
    );
  }

  // ✅ Newly waitlisted via redirect
  if (status === 'WAITLISTED' && qrCode) {
    return (
      <div className="max-w-xl mx-auto py-10 space-y-6 text-center">
        <h1 className="text-2xl font-bold">You have been added to the waitlist!</h1>
        <p className="text-sm">Event: {event.name}</p>
        <p className="text-sm">QR Code</p>
        <div className="flex justify-center">
          <QrCode value={qrCode} />
        </div>
        <form action={cancelRegistrationAction}>
          <input type="hidden" name="eventId" value={event.id} />
          <input type="hidden" name="userId" value={user.id} />
          <Button variant="destructive" type="submit">Cancel Registration</Button>
        </form>
        <Button asChild>
          <a href="/dashboard">Return to Dashboard</a>
        </Button>
      </div>
    );
  }

  // Now check database for existing registration
  const registration = await getUserRegistration(event.id, user.id);

  // ✅ Already registered in DB
  if (registration?.status === 'REGISTERED') {
    return (
      <div className="max-w-xl mx-auto py-10 space-y-6 text-center">
        <h1 className="text-2xl font-bold">You have already registered for this event.</h1>
        <p className="text-sm">Event: {event.name}</p>
        <p className="text-sm">QR Code</p>
        <div className="flex justify-center">
          <QrCode value={registration.qrCode} />
        </div>
        <form action={cancelRegistrationAction}>
          <input type="hidden" name="eventId" value={event.id} />
          <input type="hidden" name="userId" value={user.id} />
          <Button variant="destructive" type="submit">Cancel Registration</Button>
        </form>
        <Button asChild>
          <a href="/dashboard">Go to Dashboard</a>
        </Button>
      </div>
    );
  }

  // ✅ Already in waitlist in DB
  if (registration?.status === 'WAITLISTED') {
    return (
      <div className="max-w-xl mx-auto py-10 space-y-6 text-center">
        <h1 className="text-2xl font-bold">You are already on the waitlist for this event.</h1>
        <p className="text-sm">Event: {event.name}</p>
        <p className="text-sm">QR Code</p>
        <div className="flex justify-center">
          <QrCode value={registration.qrCode} />
        </div>
        <form action={cancelRegistrationAction}>
          <input type="hidden" name="eventId" value={event.id} />
          <input type="hidden" name="userId" value={user.id} />
          <Button variant="destructive" type="submit">Cancel Registration</Button>
        </form>
        <Button asChild>
          <a href="/dashboard">Go to Dashboard</a>
        </Button>
      </div>
    );
  }

  // ✅ Default form (never registered)
  const customQuestions = event.customizedQuestion as Record<string, string> | null;

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Register for: {event.name}</h1>
      <form action={registerToEvent} className="space-y-4">
        <input type="hidden" name="eventId" value={event.id} />
        <input type="hidden" name="userId" value={user.id} />

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

        {customQuestions && Object.entries(customQuestions).map(([key, label]) => (
          <div key={key}>
            <Label>{label}</Label>
            {label.toLowerCase().includes('why') || label.toLowerCase().includes('goal') ? (
              <Textarea name={`custom_${key}`} />
            ) : (
              <Input name={`custom_${key}`} />
            )}
          </div>
        ))}

        <Button type="submit">Submit Registration</Button>
      </form>
    </div>
  );
}