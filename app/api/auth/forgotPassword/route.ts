import { resetPasswordEmailTemplate } from "@/lib/email/resetPasswordEmailTemplate";
import { sendEmail } from "@/lib/email/sendEmail";
import { generateVerificationToken, getVerificationTokenExpiry } from "@/lib/utils/verificationToken";
import { prisma } from "@/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // For security reasons, don't reveal if the user exists
    if (!user) {
      return NextResponse.json(
        { message: "If an account exists with this email, you will receive a password reset link" },
        { status: 200 }
      );
    }

    // Generate reset token
    const token = generateVerificationToken();
    const expires = getVerificationTokenExpiry();
    
    // Store reset token in database
    await prisma.verificationToken.create({
      data: {
        identifier: user.id,
        token: token,
        expires: expires,
      },
    });

    // Create reset link
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    const resetLink = `${baseUrl}/resetPassword?token=${token}&id=${user.id}`;

    // Send email
    const message = resetPasswordEmailTemplate(resetLink);
    const emailResult = await sendEmail(user.email, "Reset Your Password - Event Hub", message);
    
    if (!emailResult.success) {
      console.error('Failed to send reset password email:', emailResult.error);
      return NextResponse.json(
        { error: "Failed to send reset password email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "If an account exists with this email, you will receive a password reset link" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
} 