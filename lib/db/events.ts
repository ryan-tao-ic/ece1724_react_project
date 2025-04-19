import prisma from "./prisma";
import { cache } from "react";

/**
 * Get all published events
 * This is cached and can be used in Server Components
 */
export const getEvents = cache(async () => {
  return await prisma.event.findMany({
    where: {
      status: {
        in: ['PUBLISHED', 'CANCELLED'], 
      },
    },
    include: {
      category: true,
    },
    orderBy: {
      eventStartTime: "asc",
    },
  });
});

export async function getCreatedEvents(userId: string) {
  return await prisma.event.findMany({
    where: { createdBy: userId },
    include: { category: true },
    orderBy: { createdAt: 'asc' },
  });
}

export async function getPendingReviewEvents() {
  return await prisma.event.findMany({
    where: {
      status: 'PENDING_REVIEW',
    },
    include: {
      category: true,
      creator: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getApprovedEventsByReviewer(staffId: string) {
  return await prisma.event.findMany({
    where: {
      status: 'APPROVED',
      reviewedBy: staffId,
      NOT: {
        reviewedBy: null    // This explicitly excludes events where reviewedBy is null
      }
    },
    include: {
      category: true,
      creator: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getPublishedEventsByReviewer(staffId: string) {
  return await prisma.event.findMany({
    where: {
      status: 'PUBLISHED',
      reviewedBy: staffId,
      NOT: {
        reviewedBy: null    // This explicitly excludes events where reviewedBy is null
      }
    },
    include: {
      category: true,
      creator: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getCancelledEventsByReviewer(staffId: string) {
  return await prisma.event.findMany({
    where: {
      status: 'CANCELLED',
      reviewedBy: staffId,
    },
    include: {
      category: true,
      creator: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}


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
          lecturer: true,
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


