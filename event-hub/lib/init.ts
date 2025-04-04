import { prisma } from '@/prisma';
import { hash } from "bcryptjs";

export const init = async () => {
    

    const userCount = await prisma.user.count();
  
    if (userCount === 0) {
      console.log('⚠️ No users found. Creating initial superuser...');
  
      const hashedPassword = await hash('123456', 10);
  
      await prisma.user.create({
        data: {
          email: 'admin@example.com',
          firstName: 'Super',
            lastName: 'User',
          passwordHash: hashedPassword,
          role: 'STAFF', // if you have a 'role' field
          isActivated: true
        },
      });
  
      console.log('✅ Superuser created successfully!');
    }
};

