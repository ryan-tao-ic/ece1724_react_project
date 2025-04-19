// app/api/profile/update/route.ts

// This route handles the update of user profile information.
import { NextRequest, NextResponse } from "next/server";
import { getTokenHeader } from '@/lib/auth/auth';
import prisma from "@/lib/db/prisma";
import { z } from "zod";

const updateProfileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  affiliation: z.string().min(1),
  occupation: z.string().min(1),
  bio: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const { id } = getTokenHeader(req);
  if (!id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = updateProfileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({
    where: { id },
    select: { role: true },
  });

  if (!existingUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const isComplete =
    parsed.data.affiliation.trim() &&
    parsed.data.occupation.trim() &&
    parsed.data.bio.trim();

  const newRole =
    existingUser.role === "USER" && isComplete
      ? "LECTURER" // Change role to LECTURER if the user has completed their profile
      : existingUser.role;

  await prisma.user.update({
    where: { id },
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      affiliation: parsed.data.affiliation,
      occupancy: parsed.data.occupation,
      expertise: parsed.data.bio,
      role: newRole,
    },
  });

  return NextResponse.json({ success: true });
}
