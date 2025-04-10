import { Resend } from 'resend';
import prisma from '@/lib/db/prisma';
import QRCode from 'qrcode';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendUpgradeEmail({
  event,
  userId,
  qrCode,
}: {
  event: any;
  userId: string;
  qrCode: string;
}) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.email) return;

  const subject = `You're now registered for ${event.name}!`;

  const qrImageData = await QRCode.toDataURL(qrCode);

  const calendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    event.name
  )}&dates=${event.eventStartTime.toISOString().replace(/[-:]/g, '').split('.')[0]}/${event.eventEndTime
    .toISOString()
    .replace(/[-:]/g, '')
    .split('.')[0]}&location=${encodeURIComponent(event.location)}`;

  const html = `
    <h2>${subject}</h2>
    <p>Hello ${user.firstName},</p>
    <p>Great news! You have been moved from the waitlist and are now <strong>registered</strong> for the event <strong>${event.name}</strong>.</p>
    <p><strong>Location:</strong> ${event.location}<br/>
       <strong>Time:</strong> ${new Date(event.eventStartTime).toLocaleString()} – ${new Date(event.eventEndTime).toLocaleString()}</p>
    <p>Your QR Code:</p>
    <img src="${qrImageData}" alt="QR Code" width="150" height="150" />
    <p><a href="${calendarLink}" target="_blank">➕ Add to Google Calendar</a></p>
    <p>We look forward to seeing you!</p>
  `;

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: user.email,
    subject,
    html,
  });
}
