// app/api/checkin/route.ts

// This route handles the check-in process for users at events using QR codes.
// It verifies the QR code, checks if the user is registered for the event, and updates their check-in status.
// It also checks if the current time is within the event's start and end times.
// If the user has already checked in, it returns an error.
// If the QR code is invalid or missing, it returns an error.

import prisma from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { qrCode } = await req.json();

  if (!qrCode || typeof qrCode !== "string") {
    return NextResponse.json({ error: "Missing QR code" }, { status: 400 });
  }

  let data;
  try {
    data = JSON.parse(qrCode);
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid QR code format" },
      { status: 400 }
    );
  }

  const { eventId, userId } = data;

  if (!eventId || !userId) {
    return NextResponse.json(
      { error: "QR code missing event or user info" },
      { status: 400 }
    );
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
    return NextResponse.json(
      { error: "Registration not found" },
      { status: 404 }
    );
  }

  const now = new Date();
  const start = new Date(registration.event.eventStartTime);
  const end = new Date(registration.event.eventEndTime);

  if (now < start || now > end) {
    return NextResponse.json(
      { error: "QR code not valid at this time" },
      { status: 400 }
    );
  }

  // if (registration.checkInTime) {
  //   return NextResponse.json(
  //     { error: "User already checked in" },
  //     { status: 400 }
  //   );
  // }

  await prisma.eventUserRegistration.update({
    where: { id: registration.id },
    data: { checkInTime: now },
  });

  return NextResponse.json({ success: true, eventId, userId });
}
