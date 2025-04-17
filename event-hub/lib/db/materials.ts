import prisma from "./prisma";
import { cache } from "react";
import { getSignedUrl } from "../file-storage";
import { EventMaterial } from "@/lib/types";

/**
 * Get all materials for an event
 */
export async function getEventMaterials(eventId: string): Promise<EventMaterial[]> {
  const materials = await prisma.eventMaterials.findMany({
    where: {
      eventId,
    },
    orderBy: {
      uploadedAt: 'desc',
    },
  });

  // Generate signed URLs for each material
  const materialsWithSignedUrls = await Promise.all(
    materials.map(async (material) => {
      const signedUrl = await getSignedUrl(material.filePath);
      return {
        ...material,
        signedUrl,
      };
    })
  );

  return materialsWithSignedUrls;
}

/**
 * Create a new event material
 */
export async function createEventMaterial(
  eventId: string,
  uploaderId: string,
  filePath: string,
  fileName: string,
  fileType: string
): Promise<EventMaterial> {
  const material = await prisma.eventMaterials.create({
    data: {
      eventId,
      uploadedBy: uploaderId,
      filePath,
      fileName,
      fileType,
      uploadedAt: new Date(),
    },
  });

  return material;
}

/**
 * Detach a material from an event (soft delete)
 */
export async function detachEventMaterial(materialId: number): Promise<boolean> {
  try {
    await prisma.eventMaterials.update({
      where: {
        id: materialId,
      },
      data: {
        eventId: null,
      },
    });
    
    console.log(`Successfully detached material ID ${materialId}`);
    return true;
  } catch (error) {
    console.error('Error detaching material:', error);
    return false;
  }
}

/**
 * Delete a material completely from the database
 */
export async function deleteEventMaterial(materialId: number): Promise<boolean> {
  try {
    await prisma.eventMaterials.delete({
      where: {
        id: materialId,
      },
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting material:', error);
    return false;
  }
} 