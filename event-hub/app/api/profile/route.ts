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
        // Add more fields as needed
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