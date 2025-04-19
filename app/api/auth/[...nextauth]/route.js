// app/api/auth/[...nextauth]/route.js
// This file is used to handle authentication using NextAuth.js and Prisma.
// It configures the authentication providers, including credentials provider,
// and sets up the Prisma adapter to interact with the database.
// It also includes a custom authorization function to validate user credentials.

import { authConfig } from "@/auth.config";
import { prisma } from "@/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcrypt";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const fullAuth = {
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("No credentials provided");
          throw new Error("Email and password are required");
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            console.log(`User not found: ${credentials.email}`);
            throw new Error("Invalid email or password");
          }

          if (!user.passwordHash) {
            console.log(`User has no password hash: ${credentials.email}`);
            throw new Error("Invalid account configuration");
          }

          console.log(`Comparing password for: ${credentials.email}`);
          const isValid = await compare(
            credentials.password,
            user.passwordHash,
          );
          
          if (!isValid) {
            console.log(`Password invalid for: ${credentials.email}`);
            throw new Error("Invalid email or password");
          }

          // Check if account is activated
          if (!user.isActivated) {
            console.log(`Account not activated: ${credentials.email}`);
            throw new Error("Account not activated. Please check your email for activation link.");
          }

          console.log(`Authentication successful for: ${credentials.email}`);
          return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role, 
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw error;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  // Add any other settings from authConfig that are needed
  pages: authConfig.pages,
};



// export const { GET, POST } = NextAuth(fullAuth).handlers;
const handler = NextAuth(fullAuth);
export { handler as GET, handler as POST };

