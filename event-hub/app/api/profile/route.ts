// app/api/profile/route.ts
// This route handles the GET request to fetch the user's profile information.
// It retrieves the user's ID from the token header, queries the database for the user's information,
// and returns the profile data in JSON format. If the user is not found or if an error occurs, it returns an appropriate error message.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { getTokenHeader } from '@/lib/auth/auth';

export async function GET(req: NextRequest) {
  try {
    const {id} = getTokenHeader(req);
   
    const user = await prisma.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        affiliation: true,
        occupancy: true,
        expertise: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ profile: user }, { status: 200 });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}