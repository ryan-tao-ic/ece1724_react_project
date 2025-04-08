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
  status: string;
  qrCode: string;
}) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.email) return;

  const subject =
    status === 'WAITLISTED'
      ? `You're on the waitlist for ${event.name}`
      : `Registration confirmed for ${event.name}`;

  const calendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    event.name
  )}&dates=${event.eventStartTime.toISOString().replace(/[-:]/g, '').split('.')[0]}/${event.eventEndTime
    .toISOString()
    .replace(/[-:]/g, '')
    .split('.')[0]}&location=${encodeURIComponent(event.location)}`;

  const qrImageData = await QRCode.toDataURL(qrCode); // Base64 image

  const html = `
    <h2>${subject}</h2>
    <p>Hello ${user.firstName},</p>
    <p>You have successfully ${status === 'WAITLISTED' ? 'joined the waitlist' : 'registered'} for the event <strong>${event.name}</strong>.</p>
    <p><strong>Location:</strong> ${event.location}<br/>
       <strong>Time:</strong> ${new Date(event.eventStartTime).toLocaleString()} – ${new Date(event.eventEndTime).toLocaleString()}</p>
    <p>Your QR Code:</p>
    <img src="${qrImageData}" alt="QR Code" width="150" height="150" />
    <p><a href="${calendarLink}" target="_blank">➕ Add to Google Calendar</a></p>
  `;

  await resend.emails.send({
    from: 'noreply@youreventhub.com',
    to: user.email,
    subject,
    html,
  });
}
