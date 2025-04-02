// pages/api/auth/[...nextauth].ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/prisma";
import { authConfig } from "@/auth.config";

const fullAuth = {
  ...authConfig,
  adapter: PrismaAdapter(prisma),
};

export const { GET, POST } = NextAuth(fullAuth as any).handlers;

