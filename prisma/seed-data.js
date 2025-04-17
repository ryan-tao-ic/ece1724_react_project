const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://ryantao:@localhost:5432/eventhub?schema=public"
    }
  }
});

async function main() {
  console.log('Adding test data...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  let adminUser;
  try {
    adminUser = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        passwordHash: hashedPassword,
        role: 'STAFF',
        isActivated: true
      }
    });
    console.log('Admin user created:', adminUser.id);
  } catch (e) {
    console.error('Error creating admin:', e);
    return;
  }

  // Create categories
  const categories = ['Conference', 'Seminar', 'Workshop', 'PhD Defense'];
  
  for (const catName of categories) {
    try {
      const cat = await prisma.eventCategory.upsert({
        where: { name: catName },
        update: {},
        create: { name: catName }
      });
      console.log(`Created category ${catName} with ID ${cat.id}`);
    } catch (e) {
      console.error(`Error creating category ${catName}:`, e);
    }
  }

  // Get conference category
  const confCategory = await prisma.eventCategory.findFirst({
    where: { name: 'Conference' }
  });

  // Get seminar category
  const seminarCategory = await prisma.eventCategory.findFirst({
    where: { name: 'Seminar' }
  });

  if (!confCategory || !seminarCategory) {
    console.error('Categories not found');
    return;
  }

  // Create event 1
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(12, 0, 0, 0);

  try {
    const event1 = await prisma.event.create({
      data: {
        name: 'Machine Learning Applications in Healthcare',
        description: 'This conference explores cutting-edge machine learning techniques being applied in healthcare settings, from diagnostic imaging to predictive analytics for patient outcomes.',
        location: 'Room 203, Engineering Building',
        eventStartTime: tomorrow,
        eventEndTime: tomorrowEnd,
        availableSeats: 50,
        categoryId: confCategory.id,
        status: 'PUBLISHED',
        createdBy: adminUser.id
      }
    });
    console.log('Created event 1:', event1.id);
  } catch (e) {
    console.error('Error creating event 1:', e);
  }

  // Create event 2
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(14, 0, 0, 0);
  
  const nextWeekEnd = new Date(nextWeek);
  nextWeekEnd.setHours(17, 0, 0, 0);

  try {
    const event2 = await prisma.event.create({
      data: {
        name: 'Web Development with Next.js 14',
        description: 'Learn about the latest features in Next.js 14 including Server Components, Server Actions, and optimized rendering strategies for modern web applications.',
        location: 'Virtual - Zoom',
        eventStartTime: nextWeek,
        eventEndTime: nextWeekEnd,
        availableSeats: 100,
        categoryId: seminarCategory.id,
        status: 'PUBLISHED',
        createdBy: adminUser.id,
        customizedQuestion: {
          "experience": "What is your experience level with React?",
          "interest": "What specific topics are you most interested in learning about?"
        }
      }
    });
    console.log('Created event 2:', event2.id);
  } catch (e) {
    console.error('Error creating event 2:', e);
  }

  console.log('Done adding test data');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }); 