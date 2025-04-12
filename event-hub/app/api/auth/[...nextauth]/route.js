// app/api/auth/[...nextauth]/route.js
// This file is used to handle authentication using NextAuth.js and Prisma.
// It configures the authentication providers, including credentials provider,
// and sets up the Prisma adapter to interact with the database.
// It also includes a custom authorization function to validate user credentials.

import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/prisma";
import { authConfig } from "@/auth.config";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";

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
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await compare(
          credentials.password,
          user.passwordHash,
        );
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role, 
        };
      },
    }),
  ],
};

// export const { GET, POST } = NextAuth(fullAuth).handlers;
const handler = NextAuth(fullAuth);
export { handler as GET, handler as POST };

