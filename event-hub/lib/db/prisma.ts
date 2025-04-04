import { PrismaClient } from "@prisma/client";

// This is to prevent multiple instances of Prisma Client in development
// eslint-disable-next-line
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Create a singleton Prisma client
const prismaClient = global.prisma || new PrismaClient();

// Assign to global to prevent multiple instances during hot reloading
if (process.env.NODE_ENV !== "production") {
  global.prisma = prismaClient;
}

export default prismaClient;
