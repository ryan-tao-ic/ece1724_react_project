// app/api/checkin/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function POST(req) {
  const { qrCode } = await req.json();

  if (!qrCode || typeof qrCode !== "string") {
    return NextResponse.json({ error: "Missing QR code" }, { status: 400 });
  }

  let data;
  try {
    data = JSON.parse(qrCode);
  } catch (err) {
    return NextResponse.json({ error: "Invalid QR code format" }, { status: 400 });
  }

  const { eventId, userId } = data;

  if (!eventId || !userId) {
    return NextResponse.json({ error: "QR code missing event or user info" }, { status: 400 });
  }

  const registration = await prisma.eventUserRegistration.findUnique({
    where: {
      eventId_userId: {
        eventId,
        userId,
      },
    },
    include: {
      event: true,
    },
  });

  if (!registration) {
    return NextResponse.json({ error: "Registration not found" }, { status: 404 });
  }

  const now = new Date();
  const start = new Date(registration.event.eventStartTime);
  const end = new Date(registration.event.eventEndTime);

  if (now < start || now > end) {
    return NextResponse.json({ error: "QR code not valid at this time" }, { status: 400 });
  }

  if (registration.checkInTime) {
    return NextResponse.json({ error: "User already checked in" }, { status: 400 });
  }

  await prisma.eventUserRegistration.update({
    where: { id: registration.id },
    data: { checkInTime: now },
  });

  return NextResponse.json({ success: true });
}
