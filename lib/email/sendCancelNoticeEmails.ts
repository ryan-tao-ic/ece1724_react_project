import { Resend } from 'resend';
import prisma from '@/lib/db/prisma';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendCancelNoticeEmails(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      registrations: {
        where: {
          status: { in: ['REGISTERED', 'WAITLISTED'] },
        },
        include: {
          user: true,
        },
      },
    },
  });

  if (!event) return;

  const subject = `[EventHub] Event Cancelled: ${event.name}`;
  const eventTime = `${new Date(event.eventStartTime).toLocaleString()} – ${new Date(event.eventEndTime).toLocaleString()}`;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
  const icsFileUrl = `${baseUrl}/api/calendar/events/${event.id}`;
  const icsSubscribeUrl = `${baseUrl}/calendar/subscribe?ics=${encodeURIComponent(icsFileUrl)}`;

  const htmlTemplate = (name: string) => `
    <h2>${subject}</h2>
    <p>Hello ${name},</p>
    <p>We regret to inform you that the event <strong>${event.name}</strong> has been <strong>cancelled</strong>.</p>
    <p><strong>Location:</strong> ${event.location}<br/>
       <strong>Time:</strong> ${eventTime}</p>
    <p>We apologize for the inconvenience. Please stay tuned for other upcoming events.</p>
    <p>If you added this event to your calendar, you can <a href="${icsSubscribeUrl}">subscribe or update it here</a> to reflect the cancellation.</p>
  `;

  const FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
  if (!FROM_EMAIL) {
    throw new Error('RESEND_FROM_EMAIL is not defined in environment variables');
  }

  for (const reg of event.registrations) {
    const email = reg.user.email;
    const name = reg.user.firstName || 'there';

    if (!email) continue;

    await resend.emails.send({
      from: FROM_EMAIL, 
      to: email,
      subject,
      html: htmlTemplate(name),
    });
  }
}
