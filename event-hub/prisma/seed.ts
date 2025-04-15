import { PrismaClient } from '@prisma/client';

// Initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');
  
  // Your seed code will go here - I'll wait for your instructions
  // on what data you want to populate
  
  console.log('Database seeding completed successfully!');
}

// Execute the main function
main()
  .catch((error) => {
    console.error('Error seeding database:', error);
    process.exit(1);
  })
  .finally(async () => {
    // Close database connections when done
    await prisma.$disconnect();
  }); 