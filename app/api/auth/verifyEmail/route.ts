import { prisma } from "@/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const id = searchParams.get('id');

    if (!token || !id) {
      return NextResponse.json(
        { error: "Missing verification token or user ID" },
        { status: 400 }
      );
    }

    // Find verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier: id,
          token: token,
        },
      },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid verification token" },
        { status: 400 }
      );
    }

    const now = new Date();
    if (now > verificationToken.expires) {
      return NextResponse.json(
        { error: "Verification token has expired" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Email already verified" },
        { status: 200 }
      );
    }

    // Update user and delete token
    await prisma.$transaction([
      prisma.user.update({
        where: { id },
        data: {
          emailVerified: now,
          isActivated: true,
        },
      }),
      prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: id,
            token: token,
          },
        },
      }),
    ]);

    return NextResponse.json(
      { message: "Email verified successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 