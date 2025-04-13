import { prisma } from "@/prisma";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getUserById(id: string) {
    const user = await prisma.user.findUnique({
        where: { id },
        select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        role: true,
        // Add more fields as needed
        },
    });
    
    if (!user) {
        throw new Error("User not found");
    }
    
    return user;
}

export async function getUsersByRole(role: UserRole) {   
    const users = await prisma.user.findMany({
        where: { role },
        select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        role: true,
        // Add more fields as needed
        },
    });

    // Check if there are any users at all in the database
    const allUsers = await prisma.user.findMany({
        select: { id: true }
    });
    
    if (!allUsers.length) {
        throw new Error("No users found in the database");
    }
    
    return users;
}

export async function assignStaffRole(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        
        if (!user) {
            throw new Error("User not found");
        }
        
        if (user.role === UserRole.STAFF) {
            throw new Error("User is already a staff member");
        }

        await prisma.user.update({
            where: { id: userId },
            data: { role: UserRole.STAFF },
        });

        revalidatePath('/roleManagement');
        return { success: true };
    } catch (error) {
        console.error('Error assigning staff role:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

export async function unassignStaffRole(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        
        if (!user) {
            throw new Error("User not found");
        }
        
        if (user.role !== UserRole.STAFF) {
            throw new Error("User is not a staff member");
        }

        await prisma.user.update({
            where: { id: userId },
            data: { role: UserRole.USER },
        });

        revalidatePath('/roleManagement');
        return { success: true };
    } catch (error) {
        console.error('Error unassigning staff role:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

