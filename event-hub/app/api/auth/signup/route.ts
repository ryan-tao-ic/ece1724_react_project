// /app/api/auth/signup/route.ts
// This file is responsible for handling the signup process.
// It receives a POST request with user details, checks if the user already exists,
// hashes the password, and creates a new user in the database.
// It returns a JSON response indicating success or failure.

import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { hash } from "bcryptjs";

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
        isActivated: true,
      },
    });

    return NextResponse.json(
      { message: "User created", user },
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