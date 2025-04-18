import { sendEmail } from "@/lib/email/sendEmail";
import { verificationEmailTemplate } from "@/lib/email/verificationEmailTemplate";
import { generateVerificationToken, getVerificationTokenExpiry } from "@/lib/utils/verificationToken";
import { prisma } from "@/prisma";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password, firstName, lastName } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        firstName: firstName,
        lastName: lastName,
        isActivated: false,
      },
    });

    // Generate and store verification token
    const token = generateVerificationToken();
    const expires = getVerificationTokenExpiry();
    
    await prisma.verificationToken.create({
      data: {
        identifier: user.id,
        token: token,
        expires: expires,
      },
    });

    // Send verification email
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    const verificationLink = `${baseUrl}/verifyEmail?token=${token}&id=${user.id}`;
    console.log('Sending verification email to:', user.email);
    const message = verificationEmailTemplate(verificationLink);
    const emailResult = await sendEmail(user.email, "Verify your email - Event Hub", message);
    
    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      // Delete the user if email sending fails
      await prisma.user.delete({ where: { id: user.id } });
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: "User created successfully. Please check your email to verify your account.",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        }
      },
      { status: 201 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}