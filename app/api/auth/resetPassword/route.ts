import { prisma } from "@/prisma";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password, token } = await req.json();

    if (!email || !password || !token) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid request" },
        { status: 400 }
      );
    }

    // Find verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier: user.id,
          token: token,
        },
      },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 400 }
      );
    }

    const now = new Date();
    if (now > verificationToken.expires) {
      return NextResponse.json(
        { message: "Token has expired" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hash(password, 10);

    // Update password and delete token in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: hashedPassword },
      }),
      prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: user.id,
            token: token,
          },
        },
      }),
    ]);

    return NextResponse.json(
      { message: "Password reset successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
} 