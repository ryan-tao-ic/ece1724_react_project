const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function main() {
  console.log('Starting database seed...');
  
  // Seed categories with enum values
  const categories = [
    'CONFERENCE',
    'WORKSHOP',
    'SEMINAR',
    'LECTURE',
    'OTHER'
  ];
  
  console.log('Seeding categories...');
  for (const categoryName of categories) {
    try {
      const category = await db.eventCategory.upsert({
        where: { name: categoryName },
        update: {},
        create: { name: categoryName },
      });
      console.log(`Created category ${categoryName} with ID ${category.id}`);
    } catch (error) {
      console.error(`Error creating category ${categoryName}:`, error);
    }
  }
  
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
    await db.$disconnect();
  }); 