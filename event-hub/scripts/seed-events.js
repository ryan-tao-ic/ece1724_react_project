// scripts/seed-events.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting to seed events...');

    // 1. First, check if we have an admin user
    let adminUser = await prisma.user.findFirst({
      where: { role: 'STAFF' }
    });

    if (!adminUser) {
      console.log('No admin user found. Creating one...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('123456', 10);
      
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          passwordHash: hashedPassword,
          role: 'STAFF',
          isActivated: true
        }
      });
      console.log('Admin user created');
    }

    // 2. Create event categories if they don't exist
    const categories = [
      { name: 'Conference' },
      { name: 'Seminar' },
      { name: 'Workshop' },
      { name: 'PhD Defense' }
    ];

    for (const category of categories) {
      await prisma.eventCategory.upsert({
        where: { name: category.name },
        update: {},
        create: { name: category.name }
      });
    }
    console.log('Event categories created or updated');

    // 3. Create some sample events
    const now = new Date();
    
    // Event 1 - Upcoming event
    const tomorrowStart = new Date(now);
    tomorrowStart.setDate(now.getDate() + 1);
    tomorrowStart.setHours(10, 0, 0, 0);
    
    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setHours(tomorrowStart.getHours() + 2);

    const conferenceCategory = await prisma.eventCategory.findFirst({
      where: { name: 'Conference' }
    });

    await prisma.event.upsert({
      where: { 
        id: '00000000-0000-0000-0000-000000000001' 
      },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Machine Learning Applications in Healthcare',
        description: 'This conference explores cutting-edge machine learning techniques being applied in healthcare settings, from diagnostic imaging to predictive analytics for patient outcomes.',
        location: 'Room 203, Engineering Building',
        eventStartTime: tomorrowStart,
        eventEndTime: tomorrowEnd,
        availableSeats: 50,
        categoryId: conferenceCategory.id,
        status: 'PUBLISHED',
        createdBy: adminUser.id
      }
    });

    // Event 2 - Event next week
    const nextWeekStart = new Date(now);
    nextWeekStart.setDate(now.getDate() + 7);
    nextWeekStart.setHours(14, 0, 0, 0);
    
    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setHours(nextWeekStart.getHours() + 3);

    const seminarCategory = await prisma.eventCategory.findFirst({
      where: { name: 'Seminar' }
    });

    await prisma.event.upsert({
      where: { 
        id: '00000000-0000-0000-0000-000000000002' 
      },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000002',
        name: 'Web Development with Next.js 14',
        description: 'Learn about the latest features in Next.js 14 including Server Components, Server Actions, and optimized rendering strategies for modern web applications.',
        location: 'Virtual - Zoom',
        eventStartTime: nextWeekStart,
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

    console.log('Sample events created successfully!');

  } catch (error) {
    console.error('Error seeding events:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 