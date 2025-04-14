import prisma from "./prisma";
import { cache } from "react";
import { getSignedUrl } from "../file-storage";

/**
 * Get all materials for an event with signed URLs
 */
export const getEventMaterials = cache(async (eventId: string) => {
  const materials = await prisma.eventMaterials.findMany({
    where: {
      eventId,
    },
    include: {
      uploader: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      uploadedAt: "desc",
    },
  });

  // Generate signed URLs for each material
  const materialsWithSignedUrls = await Promise.all(
    materials.map(async (material) => {
      try {
        const signedUrl = await getSignedUrl(material.filePath);
        return {
          ...material,
          signedUrl,
        };
      } catch (error) {
        console.error(`Error generating signed URL for material ${material.id}:`, error);
        return {
          ...material,
          signedUrl: null,
        };
      }
    })
  );

  return materialsWithSignedUrls;
});

/**
 * Create a new event material
 */
export async function createEventMaterial(
  eventId: string, 
  uploadedBy: string, 
  filePath: string, 
  fileName: string, 
  fileType: string
) {
  return await prisma.eventMaterials.create({
    data: {
      eventId,
      uploadedBy,
      filePath,
      fileName,
      fileType,
    },
  });
}

/**
 * Delete an event material
 */
export async function deleteEventMaterial(id: number) {
  return await prisma.eventMaterials.delete({
    where: {
      id,
    },
  });
} 