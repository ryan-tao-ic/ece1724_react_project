import prisma from "./prisma";
import { cache } from "react";

/**
 * Get all published events
 * This is cached and can be used in Server Components
 */
export const getEvents = cache(async () => {
  return await prisma.event.findMany({
    where: {
      status: "PUBLISHED",
    },
    include: {
      category: true,
    },
    orderBy: {
      eventStartTime: "asc",
    },
  });
});

/**
 * Get event by ID
 * This is cached and can be used in Server Components
 */
export const getEventById = cache(async (id: string) => {
  return await prisma.event.findUnique({
    where: { id },
    include: {
      category: true,
      lecturers: {
        include: {
          lecturer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });
});

/**
 * Search events
 * This is not cached and can be used in Server Actions or Route Handlers
 */
export async function searchEvents(query: string) {
  return await prisma.event.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    },
    include: {
      category: true,
    },
  });
}
