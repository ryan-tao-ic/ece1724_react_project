# ECE1724 Project Proposal
## Academic Event Ticketing and QR Code Check-in System

---

## Motivation
Organizing academic events such as Master’s and PhD defenses, conferences, seminars, and guest lectures often involves cumbersome manual processes. Event organizers rely on generic forms or email registrations, which lack real-time attendance tracking and efficient management tools. This leads to increased administrative workload, inefficiencies in handling attendee information, and a fragmented experience for organizers and participants.

Our project aims to develop a comprehensive web application to manage academic events. The application will enable online registration and attendance management. By integrating automated ticket generation and QR code-based check-in systems, the platform will streamline registration and check-in processes, enhance management efficiency, and reduce administrative burdens.

This project is worth pursuing because it creates a unified event management ecosystem that transforms fragmented manual processes into a seamless, automated workflow. It offers a tailored solution that improves attendance tracking accuracy, optimizes resource allocation, and enhances the overall experience for attendees and organizers.

Academic event organizers are the target users, such as staff members and lecturers who plan and manage events within academic institutions. A streamlined registration and check-in process will benefit attendees, including undergraduate and graduate students, faculty, and external guests.

Existing solutions, such as generic form builders and email-based registrations, provide basic functionality but lack integration and efficiency for comprehensive event management. Our platform overcomes these limitations by offering features such as user authentication, role-based access control, event creation and management tools, automated ticketing, QR code check-ins, and records archive, positioning it as a valuable tool for enhancing academic event management.

---

## Objective and Key Features
### Objective
Our project aims to develop a web-based platform specifically designed to streamline academic event management. The objectives include:
- Creating a role-based system to manage different user types and permissions.
- Implementing automated processes for event creation, registration, and attendance tracking.
- Developing a QR code-based check-in system.
- Enabling real-time interaction between participants during events via WebSockets.
- Ensuring secure file storage for event materials.

These objectives address the critical pain points identified in our motivation section while leveraging modern web technologies to create a cohesive solution for academic event management and ticket processing.

---

## Technical Implementation Approach
We will implement a comprehensive technology stack that meets all course requirements:

- **Frontend:** React with Next.js 13+, styled using Tailwind CSS and shadcn/ui component library.
- **Backend:** Next.js Server Components, API Routes, and Server Actions for robust data handling.
- **Database:** PostgreSQL relational database using Prisma ORM for type safety and efficient database operations.

### Advanced Features
- **User Authentication and Authorization:** Implementation of a role-based access control system.
- **File Storage:** Google Cloud Storage for secure document management.
- **Real-time Functionality:** Socket.io integrated with Next.js for WebSocket-based interactions.
- **External Integration:** Google Calendar API for calendar synchronization.

---

## Core Feature Implementation
### User Registration and Login
- Secure account creation with email verification.
- Role-based access for staff and lecturers.
- Password reset functionality.

### User Dashboard & Profile Editing
- Centralized dashboard for event management.
- Personalized user roles and event tracking.

### Event Browsing
- Event discovery with filtering and search functionality.
- Detailed event pages with descriptions and schedules.

### Event Management
- Role-based event creation and approval workflows.
- Cancellation workflows with automated notifications.

### Event Registration
- Easy registration and waitlist management.
- Automatic ticket generation with QR codes.

### Virtual Lounge and Attendance Monitoring
- Real-time attendance tracking.
- Interactive Q&A sessions via WebSockets.

---

## Database Schema
We will use Prisma ORM to interface with our PostgreSQL database, ensuring type-safe queries and efficient data management.

### **User Model**
```prisma
model User {
  email            String  @id
  isActivated      Boolean
  registrationDate DateTime @default(now())
  firstName        String
  lastName         String
  passwordHash     String
  role             String
  activatedAt      DateTime?
  updatedAt        DateTime  @updatedAt
  phoneNumber      String?
  affiliation      String?
  occupancy        String?
  expertise        String?
}
```

### **Event User Registration Model**
```prisma
model EventUserRegistration {
  event_id                   Int
  user_email                 String
  status                     String
  registration_time          DateTime
  check_in_time              DateTime  @db.Timestamptz
  check_out_time             DateTime  @db.Timestamptz
  qr_code                    String
  waitlist_position          Int
  customized_question_answer Json?

  event                      Event     @relation(fields: [event_id], references: [id])
  user                       User      @relation(fields: [user_email], references: [email])

  @@id([event_id, user_email])
  @@index([status])
  @@index([registration_time])
  @@index([qr_code])
  @@map("event_user_registration")
}
```

### **Lounge Model**
```prisma
model Lounge {
  id       Int      @id @default(autoincrement())
  eventId  Int      
  openedAt DateTime
  closedAt DateTime?
  isActive Boolean

  event    Event @relation(fields: [eventId], references: [id], onDelete: Cascade)
}
```

### **QAMessages Model**
```prisma
model QAMessages {
  id        Int      @id @default(autoincrement())
  eventId   Int
  userId    Int
  content   String
  timestamp DateTime @default(now())

  event     Event @relation(fields: [eventId], references: [id], onDelete: Cascade)
  user      User  @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### **QAMessages Model**
```prisma
model Event {
  id                   Int      @id @default(autoincrement())
  name                 String
  description          String?
  created_at           DateTime @default(now())
  updated_at           DateTime @updatedAt
  location             String
  event_start_time     DateTime
  event_end_time       DateTime
  available_seats      Int
  ticket_sale_required Boolean
  category_id          Int
  status              String
  is_archived         Boolean
  waitlist_capacity   Int
  review_comment      String?
  reviewed_by         String?
  customized_question Json

  category            EventCategory @relation(fields: [category_id], references: [id])
  reviewedByUser      User?         @relation(fields: [reviewed_by], references: [email])
}
```

### **Event Table**
```prisma
model Event {
  id                   Int      @id @default(autoincrement())
  name                 String
  description          String?
  created_at           DateTime @default(now())
  updated_at           DateTime @updatedAt
  location             String
  event_start_time     DateTime
  event_end_time       DateTime
  available_seats      Int
  ticket_sale_required Boolean
  category_id          Int
  status              String
  is_archived         Boolean
  waitlist_capacity   Int
  review_comment      String?
  reviewed_by         String?
  customized_question Json

  category            EventCategory @relation(fields: [category_id], references: [id])
  reviewedByUser      User?         @relation(fields: [reviewed_by], references: [email])
}
```

### **Event Lecturers Table**
```prisma
model EventLecturers {
  id              Int    @id @default(autoincrement())
  event_id        Int
  lecturer_email  String

  event           Event  @relation(fields: [event_id], references: [id])
  user            User   @relation(fields: [lecturer_email], references: [email])
}
```

### **Event Category Table**
```prisma
model EventCategory {
  id    Int    @id @default(autoincrement())
  name  String
}
```

### **Event Materials Table**
```prisma
model EventMaterials {
  id           Int      @id @default(autoincrement())
  event_id     Int
  file_path    String
  file_name    String
  file_type    String
  uploaded_by  String
  uploaded_at  DateTime

  event        Event  @relation(fields: [event_id], references: [id])
  user         User   @relation(fields: [uploaded_by], references: [email])
}
```

---

## Project Scope and Feasibility
With four team members and a 1-2 month timeframe, we have carefully scoped the project to prioritize core functionality. Our implementation will focus first on essential features (user management, event management, and QR code check-in) before progressing to advanced capabilities.

---


## Tentative Plan
Since we are using a non-separated front-end and back-end architecture, we will divide our team based on features:

| Team Member | Main Features | Advanced Feature |
|-------------|--------------|------------------|
| Ruoming Ren | User Registration and Login, Virtual Lounge, Attendance Monitoring | Real-time functionality |
| Zhaoyi Cheng | User Registration and Login, User Dashboard System and Profile Editing | User Authentication and Authorization |
| Ruoxi Yu | Event Registration | Google Calendar API Integration |
| Yige Tao | Event Browser and Event Management | File Storage |

This approach allows each member to take full ownership of specific product functionalities.

