import { Resend } from 'resend';
import prisma from '@/lib/db/prisma';
import QRCode from 'qrcode';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendConfirmationEmail({
  event,
  userId,
  status,
  qrCode,
}: {
  event: any;
  userId: string;
  status: 'REGISTERED' | 'WAITLISTED';
  qrCode: string;
}) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.email) return;

  const subject =
    status === 'WAITLISTED'
      ? `You're on the waitlist for ${event.name}`
      : `Registration confirmed for ${event.name}`;

  const baseHtml = `
    <h2>${subject}</h2>
    <p>Hello ${user.firstName},</p>
    <p>You have successfully ${status === 'WAITLISTED' ? 'joined the waitlist' : 'registered'} for the event <strong>${event.name}</strong>.</p>
    <p><strong>Location:</strong> ${event.location}<br/>
       <strong>Time:</strong> ${new Date(event.eventStartTime).toLocaleString()} – ${new Date(event.eventEndTime).toLocaleString()}</p>
  `;

  if (status === 'WAITLISTED') {
    const html = `
      ${baseHtml}
      <p>You'll be notified if a spot becomes available. Thank you!</p>
    `;
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: user.email,
      subject,
      html,
    });
    return;
  }

  const qrImageData = await QRCode.toDataURL(qrCode);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
  const icsFileUrl = `${baseUrl}/api/calendar/events/${event.id}`;
  const icsSubscribeUrl = `${baseUrl}/calendar/subscribe?ics=${encodeURIComponent(icsFileUrl)}`;

  const html = `
    ${baseHtml}
    <p>Your QR Code:</p>
    <img src="${qrImageData}" alt="QR Code" width="150" height="150" />
    <p>You can <a href="${icsSubscribeUrl}">subscribe to this event calendar</a> to stay updated if the event is cancelled or changed.</p>
  `;

  const FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
  if (!FROM_EMAIL) {
    throw new Error('RESEND_FROM_EMAIL is not defined in environment variables');
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to: user.email,
    subject,
    html,
  });
}
