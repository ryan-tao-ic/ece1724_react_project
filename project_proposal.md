# ECE1724 Project Proposal
## Academic Event Ticketing and Check-in System


## Motivation
Organizing academic events such as Master’s and PhD defenses, conferences, seminars, and guest lectures often involves cumbersome manual processes. Event organizers rely on generic forms or email registrations, which lack real-time attendance tracking and efficient management tools. This leads to increased administrative workload, inefficiencies in handling attendee information, and a fragmented experience for organizers and participants.

Our project aims to develop a comprehensive web application to manage academic events. The application will enable online registration and attendance management. By integrating automated ticket generation and QR code-based check-in systems, the platform will streamline registration and check-in processes, enhance management efficiency, and reduce administrative burdens.

This project is worth pursuing because it creates a unified event management ecosystem that transforms fragmented manual processes into a seamless, automated workflow. It offers a tailored solution that improves attendance tracking accuracy, optimizes resource allocation, and enhances the overall experience for attendees and organizers.

Academic event organizers are the target users, such as staff members and lecturers who plan and manage events within academic institutions. A streamlined registration and check-in process will benefit attendees, including undergraduate and graduate students, faculty, and external guests.

Existing solutions, such as generic form builders and email-based registrations, provide basic functionality but lack integration and efficiency for comprehensive event management. Our platform overcomes these limitations by offering features such as user authentication, role-based access control, event creation and management tools, automated ticketing, QR code check-ins, and records archive, positioning it as a valuable tool for enhancing academic event management.


## Objective and Key Features
### Objective
Our project aims to develop a web-based platform specifically designed to streamline academic event management. The objectives include:
- Creating a role-based system to manage different user types and permissions.
- Implementing automated processes for event creation, registration, and attendance tracking.
- Developing a QR code-based check-in system.
- Enabling real-time interaction between participants during events via WebSockets.
- Ensuring secure file storage for event materials.

These objectives address the critical pain points identified in our motivation section while leveraging modern web technologies to create a cohesive solution for academic event management and ticket processing.


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


## Core Feature Implementation
### User Registration and Login
The User Registration and Login feature enables users to create an account, verify their email, and securely log in. Users sign up with their name, email, and password, receiving a verification email to activate their account within 24 hours. Staff users follow the same process but can invite others to gain staff privileges. Staff members can also assign lecturers to events. The login system verifies user credentials, allowing access if correct. If a user forgets their password, they can reset it via an email link. This feature ensures a smooth and secure authentication process for all types of users.

### User Dashboard & Profile Editing
The User Dashboard conveniently enables users to manage their event engagement from a single page. Here, they can review upcoming and past events, cancel registrations if they can no longer attend, and download event materials when available. Each event listing also includes links to add it to a personal calendar or join the event lounge. Lecturers and staff gain additional privileges, such as editing event details and viewing event records. This centralized dashboard ensures a streamlined experience for every user role.

### Event Browsing
The Event Browsing feature allows users to discover and explore events on our platform quickly. Users can easily find events that match their interests by filtering and searching based on date, category, lecturer, and keywords. Detailed event pages display essential information like name, description, schedule, lecturer, and capacity. Once they find an event they like, users can click the “Register” button to open the standard registration form—if the event is full, they’ll be placed on a waitlist and notified by email when a spot opens up.

### Event Management
The Event Management feature enables users to create and manage events through a structured permission system. Regular Users can apply to become Lecturers who can submit activity requests with detailed information, which Staff must review and approve. Once approved, the Staff finalizes all event details, including scheduling, location, registration settings, and ticketing configuration before publishing events for user registration. After publication, Lecturers can only upload supporting materials while the Staff maintains full editing capabilities. The system also includes a cancellation workflow requiring Staff approval, with automatic notifications sent to all registered participants upon cancellation. 

### Event Registration
The Event Registration feature allows users to easily sign up for events on our platform. Users can find the “Register” button when browsing events and click it to open a registration form. This form will ask for details like full name, email address, and role in the event (e.g., Undergraduate Student, Graduate Student, Faculty/Staff, General Public). A phone number and affiliation can also be provided, and event organizers can add custom questions to the form. After submitting the form, users will be told if they are registered or on the waitlist if the event is full. Registered users get a confirmation email with a QR code for check-in and a link to add the event to their Google Calendar. If a spot opens up, users on the waitlist are notified by email.

### Virtual Lounge and Attendance Monitoring
The Virtual Lounge and Attendance Monitoring feature allows staff and lecturers to oversee real-time attendance and Q&A sessions. Before an event starts, it appears on staff and registered users’ dashboards, enabling any participant to open the lounge and initiate a WebSocket connection. Staff can join via their events page and scan QR codes on user tickets to grant access. Once inside, users’ names appear on staff and lecturer screens, allowing them to participate in Q&A sessions. Users can leave anytime, with all join and leave actions tracked in real time. Q&A messages are logged for reference, and the lounge closes manually or automatically two hours after the event.



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
  eventId                   Int
  userEmail                 String
  status                     String
  registrationTime          DateTime
  checkInTime              DateTime  @db.Timestamptz
  checkOutTime             DateTime  @db.Timestamptz
  qrCode                    String
  waitlistPosition          Int?
  customizedQuestionAnswer Json?

  event                      Event     @relation(fields: [eventId], references: [id])
  user                       User      @relation(fields: [userEmail], references: [email])

  @@id([eventId, userEmail])
  @@index([status])
  @@index([registrationTime])
  @@index([qrCode])
  @@map("eventUserRegistration")
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
  userEmail String
  content   String
  timestamp DateTime @default(now())

  event     Event @relation(fields: [eventId], references: [id], onDelete: Cascade)
  user      User  @relation(fields: [userEmail], references: [email], onDelete: Cascade)
}
```

### **Event Model**
```prisma
model Event {
  id                   Int      @id @default(autoincrement())
  name                 String
  description          String?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  location             String
  eventStartTime     DateTime
  eventEndTime       DateTime
  availableSeats      Int
  ticketSaleRequired Boolean
  categoryId          Int
  status              String
  isArchived         Boolean
  waitlistCapacity   Int
  reviewComment      String?
  reviewedBy         String?
  customizedQuestion Json

  category            EventCategory @relation(fields: [categoryId], references: [id])
  reviewedByUser      User?         @relation(fields: [reviewedBy], references: [email])
}
```

### **Event Lecturers Model**
```prisma
model EventLecturers {
  id              Int    @id @default(autoincrement())
  eventId        Int
  lecturerEmail  String

  event           Event  @relation(fields: [eventId], references: [id])
  user            User   @relation(fields: [lecturerEmail], references: [email])
}
```

### **Event Category Model**
```prisma
model EventCategory {
  id    Int    @id @default(autoincrement())
  name  String
}
```

### **Event Materials Model**
```prisma
model EventMaterials {
  id           Int      @id @default(autoincrement())
  eventId     Int
  filePath    String
  fileName    String
  fileType    String
  uploadedBy  String
  uploadedAt  DateTime

  event        Event  @relation(fields: [eventId], references: [id])
  user         User   @relation(fields: [uploadedBy], references: [email])
}
```


## Project Scope and Feasibility
With four team members and a 1-2 month timeframe, we have carefully scoped the project to prioritize core functionality. Our implementation will focus first on essential features (user management, event management, and QR code check-in) before progressing to advanced capabilities.



## Tentative Plan
Since we are using a non-separated front-end and back-end architecture, we will divide our team based on features:

| Team Member | Main Features | Advanced Feature |
|-------------|--------------|------------------|
| Ruoming Ren | User Registration and Login, Virtual Lounge, Attendance Monitoring | Real-time functionality |
| Zhaoyi Cheng | User Registration and Login, User Dashboard System and Profile Editing | User Authentication and Authorization |
| Ruoxi Yu | Event Registration | Google Calendar API Integration |
| Yige Tao | Event Browser and Event Management | File Storage |

This approach allows each member to take full ownership of specific product functionalities.

