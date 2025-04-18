const { PrismaClient, UserRole, CategoryType, EventStatus, RegistrationStatus } = require('@prisma/client');
const bcrypt = require('bcrypt'); // Using bcrypt to match the app's authentication

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // ----- Create Users -----
  console.log('Creating users...');
  
  // Create admin/staff user similar to the one created by init function
  const adminPassword = await bcrypt.hash('password123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      firstName: 'Super',
      lastName: 'User',
      passwordHash: adminPassword,
      role: UserRole.STAFF,
      isActivated: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });
  console.log(`Admin user created: ${adminUser.id}`);

  // Create a regular user
  const userPassword = await bcrypt.hash('password123', 10);
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      firstName: 'Regular',
      lastName: 'User',
      passwordHash: userPassword,
      role: UserRole.USER,
      isActivated: true,
      emailVerified: new Date(), // Mark as verified
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });
  console.log(`Regular user created: ${regularUser.id}`);

  // Create a lecturer user
  const lecturerPassword = await bcrypt.hash('password123', 10);
  const lecturerUser = await prisma.user.upsert({
    where: { email: 'lecturer@example.com' },
    update: {},
    create: {
      email: 'lecturer@example.com',
      firstName: 'Jane',
      lastName: 'Lecturer',
      passwordHash: lecturerPassword,
      role: UserRole.LECTURER,
      isActivated: true,
      emailVerified: new Date(),
      expertise: 'Computer Science',
      affiliation: 'Department of Computer Science',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });
  console.log(`Lecturer user created: ${lecturerUser.id}`);

  // ----- Create Event Categories -----
  console.log('Creating event categories...');
  
  const categories = {};
  for (const categoryType of Object.values(CategoryType)) {
    try {
      const category = await prisma.eventCategory.upsert({
        where: { name: categoryType },
        update: {},
        create: { name: categoryType }
      });
      categories[categoryType] = category;
      console.log(`Created category ${categoryType} with ID ${category.id}`);
    } catch (error) {
      console.error(`Error creating category ${categoryType}:`, error);
    }
  }

  // ----- Create Events -----
  console.log('Creating events...');
  
  // Create dates for events
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const nextMonth = new Date();
  nextMonth.setDate(nextMonth.getDate() + 30);

  // Event 1: Conference (Published)
  const event1 = await prisma.event.create({
    data: {
      name: 'Annual Research Conference',
      description: 'A showcase of cutting-edge research across multiple disciplines.',
      location: 'Main Auditorium',
      eventStartTime: new Date(tomorrow.setHours(9, 0, 0, 0)),
      eventEndTime: new Date(tomorrow.setHours(17, 0, 0, 0)),
      availableSeats: 200,
      categoryId: categories[CategoryType.CONFERENCE].id,
      status: EventStatus.PUBLISHED,
      waitlistCapacity: 20,
      createdBy: adminUser.id,
      reviewedBy: adminUser.id,
      customizedQuestion: {
        "research_interest": "What is your primary research interest?",
        "dietary_restrictions": "Do you have any dietary restrictions?"
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });
  console.log(`Created event (Conference): ${event1.id}`);

  // Event 2: Workshop (Published)
  const event2 = await prisma.event.create({
    data: {
      name: 'Machine Learning Workshop',
      description: 'Hands-on workshop introducing fundamental machine learning concepts and techniques.',
      location: 'Computer Lab 101',
      eventStartTime: new Date(nextWeek.setHours(13, 0, 0, 0)),
      eventEndTime: new Date(nextWeek.setHours(16, 0, 0, 0)),
      availableSeats: 30,
      categoryId: categories[CategoryType.WORKSHOP].id,
      status: EventStatus.PUBLISHED,
      waitlistCapacity: 5,
      createdBy: lecturerUser.id,
      reviewedBy: adminUser.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });
  console.log(`Created event (Workshop): ${event2.id}`);

  // Event 3: Lecture (Draft)
  const event3 = await prisma.event.create({
    data: {
      name: 'Guest Lecture on Quantum Computing',
      description: 'An introduction to quantum computing principles and their applications.',
      location: 'Lecture Hall B',
      eventStartTime: new Date(nextMonth.setHours(15, 0, 0, 0)),
      eventEndTime: new Date(nextMonth.setHours(17, 0, 0, 0)),
      availableSeats: 100,
      categoryId: categories[CategoryType.LECTURE].id,
      status: EventStatus.DRAFT,
      waitlistCapacity: 0,
      createdBy: lecturerUser.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });
  console.log(`Created event (Lecture - Draft): ${event3.id}`);

  // ----- Assign Lecturers to Events -----
  console.log('Assigning lecturers to events...');
  
  await prisma.eventLecturers.create({
    data: {
      eventId: event1.id,
      lecturerId: lecturerUser.id
    }
  });
  console.log(`Assigned lecturer to Conference`);
  
  await prisma.eventLecturers.create({
    data: {
      eventId: event2.id,
      lecturerId: lecturerUser.id
    }
  });
  console.log(`Assigned lecturer to Workshop`);

  // ----- Create Event Registrations -----
  console.log('Creating event registrations...');
  
  // Register regular user for Conference
  await prisma.eventUserRegistration.create({
    data: {
      eventId: event1.id,
      userId: regularUser.id,
      status: RegistrationStatus.REGISTERED,
      qrCode: `QR-${event1.id.substring(0, 8)}-${regularUser.id.substring(0, 8)}`,
      registrationTime: new Date(),
      customizedQuestionAnswer: {
        "research_interest": "Artificial Intelligence",
        "dietary_restrictions": "Vegetarian"
      }
    }
  });
  console.log(`Registered regular user for Conference`);
  
  // Register regular user for Workshop
  await prisma.eventUserRegistration.create({
    data: {
      eventId: event2.id,
      userId: regularUser.id,
      status: RegistrationStatus.REGISTERED,
      qrCode: `QR-${event2.id.substring(0, 8)}-${regularUser.id.substring(0, 8)}`,
      registrationTime: new Date()
    }
  });
  console.log(`Registered regular user for Workshop`);

  // Create a waitlisted user for Conference
  const waitlistedPassword = await bcrypt.hash('password123', 10);
  const waitlistedUser = await prisma.user.upsert({
    where: { email: 'waitlist@example.com' },
    update: {},
    create: {
      email: 'waitlist@example.com',
      firstName: 'Waitlist',
      lastName: 'User',
      passwordHash: waitlistedPassword,
      role: UserRole.USER,
      isActivated: true,
      emailVerified: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });
  
  await prisma.eventUserRegistration.create({
    data: {
      eventId: event1.id,
      userId: waitlistedUser.id,
      status: RegistrationStatus.WAITLISTED,
      qrCode: `QR-${event1.id.substring(0, 8)}-${waitlistedUser.id.substring(0, 8)}`,
      registrationTime: new Date(),
      waitlistPosition: 1,
      customizedQuestionAnswer: {
        "research_interest": "Data Science",
        "dietary_restrictions": "None"
      }
    }
  });
  console.log(`Added waitlisted user for Conference`);

  // ----- Create Event Materials -----
  console.log('Creating event materials...');
  
  await prisma.eventMaterials.create({
    data: {
      eventId: event2.id,
      filePath: '/uploads/materials/workshop_slides.pdf',
      fileName: 'ML Workshop Slides.pdf',
      fileType: 'application/pdf',
      uploadedBy: lecturerUser.id,
      uploadedAt: new Date()
    }
  });
  console.log(`Added materials for Workshop`);

  console.log('Database seeding completed successfully!');
}

// Execute main function
main()
  .catch((error) => {
    console.error('Error during seeding:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 