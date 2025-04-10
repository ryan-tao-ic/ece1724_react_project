import { prisma } from "@/prisma";
 import { UserRole } from "@prisma/client";
 
 export async function getUserById(id: string) {
     const user = await prisma.user.findUnique({
         where: { id },
         select: {
         id: true,
         email: true,
         firstName: true,
         lastName: true,
         createdAt: true,
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
         // Add more fields as needed
         },
     });
     if (!users.length) {
         throw new Error("Users not found");
     }
     return users;
 }
 
 export async function assignStaff(id: string) {
     const user = await prisma.user.findUnique({
         where: { id }
     });
     if (!user) {
         throw new Error("User not found");
     }
     if (user.role === UserRole.STAFF) {
         throw new Error("User is already a staff member");
     }
 
     await prisma.user.update({
         where: { id },
         data: { role: UserRole.STAFF },
     });
     
     
     return user;
 }
 