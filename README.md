# EventHub - Academic Event Management Platform

![home page](public/docs/home.png)

## Team Information

- **Ruoming Ren** - Student Number: 1005889013 - Email: luke.ren@mail.utoronto.ca
- **Zhaoyi Cheng** - Student Number: 1005727411 - Email: zhaoyi.cheng@mail.utoronto.ca
- **Ruoxi Yu** - Student Number: 1010110201 - Email: ruoxi.yu@mail.utoronto.ca
- **Yige Tao** - Student Number: 1000741094 - Email: yige.tao@mail.utoronto.ca

## Video Demo

Below is the Video demo for our project: https://youtu.be/PDvRscMN_tI

## Motivation

Organizing academic events—like Master's and PhD defences, seminars, guest lectures, and conferences—can be surprisingly tedious. Most institutions still rely on email signups or generic forms, which quickly become hard to manage as events scale. There's often no unified way to track attendance, manage roles, or handle real-time changes, and that creates extra work for organizers and a disjointed experience for participants.

We built EventHub to solve this. It's a web application designed specifically for academic event management, with tools that simplify everything from registration to real-time check-in. With features like automated ticket generation, QR code-based entry, and role-based access control, our platform streamlines the entire workflow—saving organizers time and making the experience smoother for attendees.

What makes this project worth pursuing is the opportunity to bring all the scattered, manual processes into one cohesive system. It's tailored for the needs of academic staff, lecturers, and admin teams, while also improving the experience for students, faculty, and guests. Instead of juggling spreadsheets, inboxes, and last-minute updates, organizers can focus on what matters: hosting meaningful, well-run events.

While tools like Google Forms and email invites offer some basic support, they fall short when it comes to integrated event management. EventHub fills that gap—with features designed specifically for the academic environment, from real-time check-ins to archival tools for event records.

## Objectives

The primary objectives of EventHub are:

1. **Streamlined Event Management**

   - Create a unified platform for academic event organization
   - Implement role-based access control for different user types
   - Provide efficient event creation and management tools
   - Enable staff to review and approve event requests
   - Allow lecturers to submit activity requests and upload materials
   - Implement a comprehensive event cancellation workflow

2. **Enhanced User Experience**

   - Simplify the registration process for attendees
   - Implement a QR code-based check-in system
   - Enable real-time interaction through virtual lounges
   - Provide intuitive event browsing with filtering and search
   - Support calendar integration for event scheduling
   - Implement waitlist management with automatic notifications

3. **Improved Administrative Efficiency**

   - Automate attendance tracking via real-time check-ins
   - Implement waitlist management
   - Provide secure document storage for event materials
   - Enable real-time Q&A sessions during events
   - Track participant engagement and attendance
   - Automate email notifications for various events

4. **Technical Excellence**
   - Build a scalable and maintainable application
   - Ensure high performance and reliability
   - Implement modern web development best practices
   - Leverage WebSockets for real-time communication
   - Integrate with external services (ICS file support, Cloud Storage)
   - Ensure type safety and robust data handling
   - Design a secure and user-friendly authentication system using NextAuth.js

## Technical Stack

- **Frontend**: React with Next.js 15, styled using Tailwind CSS and shadcn/ui
- **Backend**: Next.js Server Components, API Routes, and Server Actions
- **Database**: PostgreSQL with Prisma ORM
- **Real-time Communication**: Socket.io
- **Authentication**: NextAuth.js with email verification
- **Email Service**: Resend API for transactional emails with custom templates
- **File Storage**: Google Cloud Storage
- **Calendar Integration**: ICS (iCalendar) standard support

## Features

EventHub offers a comprehensive set of features designed to streamline academic event management. Here's how they fulfill our course requirements and achieve our project objectives:

1. **User Authentication and Authorization**
   - Built on NextAuth.js for a secure and streamlined user experience
   - Standard email and password login flow with email verification
   - Role-based access control (Regular Users, Lecturers, Staff)
   - Password reset functionality with secure email links
   - Staff invitation system for privileged access

![login](public/docs/login.png)

2. **Event Management System**
   - Event creation and approval workflow
   - Detailed event information management
   - Registration settings and capacity control
   - Event cancellation workflow with automatic email notifications
   - Material upload and management
   - Calendar integration with iCalendar (ICS) standard, supporting multiple calendar systems

![eventManagement](public/docs/eventManagement.png)

3. **Registration and Check-in**
   - Customizable registration forms
   - Waitlist management
   - QR code-based check-in system
   - Automatic email confirmations
   - Calendar event integration

![eventDetail](public/docs/eventDetail.png)

4. **Virtual Lounge and Real-time Features**
   - WebSocket-based real-time communication
   - Live Q&A sessions
   - Real-time attendance visibility based on user check-ins
   - Automatic lounge closure

![lounge](public/docs/lounge.png)

5. **User Dashboard**
   - Centralized event management for organizers
   - Upcoming and past event registration tracking
   - Registration management
   - Material access
   - Event lounge access
   - Role-specific privileges

![userDash](public/docs/userDashboard.png)

6. **File Management**
   - Secure document storage
   - Material upload and download
   - PDF viewing capabilities
   - File type validation
   - Access control for materials

![fileManagement](public/docs/fileManagement.png)

## User Guide

### Authentication and Account Management

#### Registration Process

1. **Initial Sign Up**

   - Click the "Sign Up" button in the top right corner
   - Fill in your details:
     - Email address
     - Password (minimum 6 characters)
     - First and Last Name
   - Click "Create Account", and the system will send you an email verification.

2. **Email Verification**

   - Check your email for a verification link
   - Click the verification link to activate your account
   - You'll be redirected to the login page

3. **Login**

   - Enter your email and password
   - Click "Sign In"
   - Upon successful login, you'll be redirected to your dashboard
   - The navigation bar will update to display your name and role

4. **Password Reset**
   - If you forget your password, click "Forgot Password" on the login page
   - Enter your email address
   - Check your email for a password reset link
   - Follow the link to create a new password

### Dashboard Overview

The dashboard provides a centralized view of your events and activities based on your role:

1. **For Regular Users**

   - View upcoming events you've registered for
   - Access past event history
   - View event details and materials
   - Manage your registrations

2. **For Lecturers**

   - Create and manage your events
   - Track event status (Draft, Pending Review, Approved, Published)
   - Edit unpublished events
   - View event analytics
   - Manage your event materials

3. **For Staff Members**
   - Review pending events
   - Manage event approvals
   - Track published events
   - Access the QR scanner for check-ins
   - Manage user roles
   - View event analytics

### Profile Management

![profile](public/docs/profile.png)

1. **Accessing Your Profile**

   - Click your name in the top right corner
   - Select "Profile" from the dropdown menu
   - View and edit your personal information

2. **Profile Information**

   - Basic Information:
     - First Name
     - Last Name
     - Email (read-only)
   - Professional Details:
     - Affiliation
     - Occupation
     - Personal Bio (rich text editor)

3. **Updating Your Profile**
   - Click "Edit Profile" to make changes
   - Fill in the required fields
   - Use the rich text editor for your bio
   - AI Enhancement Features:
     - Click "Enhance Bio" to improve your bio with AI assistance
     - Click "Make Professional" to get a more professional tone
     - Both features are powered by Deepseek AI
     - The enhanced content will be automatically updated in the editor
   - Click "Update Profile" to save changes

### Event Management

#### For Event Organizers

1. **Event Creation**

   - `Lecturer` and `Staff` can create events.
   - Events can be saved as **DRAFT**. This will only show in the Creators' dashboard.

2. **Submission for Review**

   - Creator submits DRAFT → Status becomes **PENDING_REVIEW** and will show in `Staff`'s dashboard.

3. **Event Review (Staff Only)**

   - Staff can **approve** → Status becomes **APPROVED**.
   - Staff can **reject** → Event is sent back to **DRAFT** with comments.

4. **Pre-Publish Edits**

   - While in **DRAFT**, **PENDING_REVIEW**, or **APPROVED**, the Creators can:
     - Edit the event.
     - Delete the event (only if it's not published or cancelled).

5. **Publication**

   - Only `Staff` can **publish** → Status becomes **PUBLISHED**.
   - After publishing, event information is **read-only** and **cannot be deleted or edited**. The Creators can still upload materials.

6. **Cancellation**
   - After publishing, the event can only be **cancelled**.
   - Only the **assigned Staff or Lecturer** can cancel the event. The status becomes **CANCELLED**, and registered users will be notified via email.

#### For Attendees

1. **Event Registration**

   - Browse available events
   - Click "Register" on the desired event
   - Fill in the registration form
   - Receive a confirmation email with a QR Code ticket and an ics link for event reminder.
   - Add to calendar (optional)

2. **Pre-Event Preparation**
   - Check email for event updates
   - Download event materials
   - Save QR code ticket for check-in
   - Review event details

### Virtual Lounge System

1. **Accessing the Lounge**

   - Staff and lecturers could enter 1 hour before the start time via event management
   - Attendees can enter after QR code check-in

2. **Lounge Features**

   - Real-time list of checked-in participants
   - Role-based visibility
   - Q&A functionality
   - Chat system

3. **Check-in Process**
   - Present the QR code to the staff
   - Staff scans code using the app
   - Automatic lounge access granted
   - Check-in recorded in the system as a confirmation of attendance

### File Management

1. **Uploading Materials**

   - Navigate to event management
   - Click "Upload Materials"
   - Select files (PDF, DOC, PPT supported)
   - Add descriptions
   - Set access permissions

2. **Accessing Materials**
   - View in event details page
   - Download for offline access
   - Preview in browser (PDF)
   - Share with other attendees

### Calendar Integration

1. **Syncing with Calendar**

   - Click "Add to Calendar" on the event page
   - Confirm event details
   - Save to calendar

2. **Calendar Features**
   - Automatic updates for changes
   - Location details
   - Material links

### Role-Specific Features

#### For Staff Members

- Event approval workflow
- User role management
- Check-in system access

#### For Lecturers

- Material upload and management
- Q&A moderation
- Automate attendance tracking by recording check-ins
- Event feedback collection

## Development Guide

### 1. Project Structure

```
event-hub/
├── app/                      # Next.js app router
│   ├── (auth)/              # Authentication routes
│   │   ├── login/           # Login functionality
│   │   └── register/        # Registration functionality
│   ├── api/                 # API routes
│   ├── checkin/             # QR code check-in functionality
│   ├── contact/             # Contact page
│   ├── dashboard/           # User dashboard
│   ├── events/              # Event management
│   ├── lounge/              # Virtual lounge for events
│   ├── not-authorized/      # Access denied page
│   ├── profile/             # User profile management
│   ├── resetPassword/       # Password reset functionality
│   ├── roleManagement/      # Role management pages
│   ├── verifyEmail/         # Email verification
│   ├── actions.ts          # Server actions
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── providers.tsx       # React context providers
├── components/              # React components
│   ├── calendar/           # Calendar-related components
│   │   └── CalendarSubscription.tsx # Calendar subscription component
│   ├── layout/             # Layout components
│   │   ├── main-layout.tsx # Main layout wrapper
│   │   ├── navbar.tsx      # Navigation bar
│   │   └── footer.tsx      # Footer component
│   ├── ui/                 # UI components from shadcn/ui
│   │   ├── accordion.tsx   # Accordion component
│   │   ├── alert.tsx       # Alert component
│   │   ├── alert-dialog.tsx # Alert dialog component
│   │   ├── avatar.tsx      # Avatar component
│   │   ├── button.tsx      # Button component
│   │   ├── card.tsx        # Card component
│   │   ├── dropdown-menu.tsx # Dropdown menu
│   │   ├── form.tsx        # Form components
│   │   ├── input.tsx       # Input component
│   │   ├── label.tsx       # Label component
│   │   ├── pdf-viewer.tsx  # PDF viewer component
│   │   ├── popover.tsx     # Popover component
│   │   ├── radio-group.tsx # Radio group component
│   │   ├── rich-text-editor.tsx # Rich text editor
│   │   ├── scroll-area.tsx # Scroll area component
│   │   ├── sonner.tsx      # Toast notifications
│   │   └── textarea.tsx    # Textarea component
│   ├── events/             # Event-related components
│   │   └── lounge-access-button.tsx # Lounge access button component
│   ├── cancelled-redirect.tsx # Cancellation redirect
│   ├── event-materials-upload.tsx # Event materials upload
│   └── qr-code.tsx         # QR code generation
├── hooks/                   # Custom React hooks
│   └── useFileUpload.ts    # File upload hook
├── lib/                     # Utility functions and shared code
│   ├── auth/               # Authentication utilities
│   │   └── auth.ts         # Auth implementation
│   ├── db/                 # Database utilities
│   │   ├── registration.ts # Registration database operations
│   │   ├── users.ts        # User database operations
│   │   ├── materials.ts    # Material database operations
│   │   ├── prisma.ts       # Prisma client configuration
│   │   └── events.ts       # Event database operations
│   ├── email/              # Email functionality
│   │   ├── sendConfirmationEmail.ts # Event confirmation
│   │   ├── sendCancelNoticeEmails.ts # Cancellation notices
│   │   ├── sendEmail.ts    # Email sending utility
│   │   ├── sendUpgradeEmail.ts # Role upgrade notifications
│   │   ├── verificationEmailTemplate.ts # Email verification
│   │   └── resetPasswordEmailTemplate.ts # Password reset
│   ├── events/             # Event-related utilities
│   │   └── fetchEvent.ts   # Event fetching utility
│   ├── file-storage/       # File storage utilities
│   │   ├── errors.ts       # Storage error handling
│   │   ├── index.ts        # Storage interface
│   │   └── service.ts      # Storage service implementation
│   ├── i18n/               # Internationalization
│   │   └── index.ts        # i18n configuration
│   ├── profile/            # Profile management utilities
│   │   ├── profile.ts      # Profile operations
│   │   └── update.ts       # Profile update utilities
│   ├── users/              # User management utilities
│   │   └── users.ts        # User operations
│   ├── utils/              # General utilities
│   │   └── verificationToken.ts # Token management
│   ├── init.ts             # Application initialization
│   ├── socket.ts           # Socket.io configuration
│   ├── theme.ts            # Theme configuration
│   ├── types.ts            # Type definitions
│   └── utils.ts            # General utilities
├── locales/                # Internationalization files
│   └── en/                 # English translations
├── pages/
│   └── api/
│       └── socket.ts       # Socket.io API endpoint
├── prisma/                 # Prisma ORM configuration
│   └── schema.prisma       # Database schema
├── public/                 # Static assets
├── scripts/                # Utility scripts
│   └── seed-events.js      # Database seeding script
├── types/                  # TypeScript type definitions
│   ├── global.d.ts         # Global type declarations
│   ├── json.d.ts           # JSON type declarations
│   └── next-auth.d.ts      # NextAuth type declarations
├── .vscode/               # VS Code configuration
├── auth.config.ts         # Auth configuration
├── auth.ts                # Auth utilities
├── components.json        # shadcn/ui components configuration
├── docker-compose.yml     # Docker Compose configuration
├── Dockerfile             # Docker configuration
├── docker-entrypoint.sh   # Docker entrypoint script
├── eslint.config.mjs      # ESLint configuration
├── middleware.ts          # Next.js middleware
├── next.config.ts         # Next.js configuration
├── postcss.config.mjs     # PostCSS configuration
├── prisma.ts              # Prisma client configuration
├── server.js              # Server configuration
└── tsconfig.json          # TypeScript configuration
```

### 2. Environment Setup and Configuration

#### Prerequisites

- Node.js 18.0.0 or later
- PostgreSQL 13 or later
- npm or yarn package manager
- Google Cloud account (for cloud storage)

#### Installation Steps

1. Clone the repository:

```bash
git clone https://github.com/ryan-tao-ic/ece1724_react_project.git
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:

```bash
# Database Configuration
DATABASE_URL="postgresql://yourdatabase:yourpassword@localhost:5432/event_hub?schema=public"
```

### 3. Database Initialization

1. Create the database:

```bash
createdb event_hub
```

2. Run Prisma migrations:

```bash
npx prisma migrate dev
```

3. Seed the database with initial data:

```bash
npm run prisma:seed
```

### 4. Cloud Storage Configuration

1. Set up Google Cloud Storage:

   - Create a new project in Google Cloud Console
   - Enable Cloud Storage API
   - Create a new bucket
   - Create a service account with Storage Admin role
   - Download the service account key file

2. Configure the application:
   - Place the service account key file in a secure location
   - Update the environment variables with your Google Cloud credentials
   - Test file upload functionality

### 5. Local Development and Testing

1. Start the development server:

```bash
npm run dev
```

2. Access the application:

   - Open [http://localhost:3000](http://localhost:3000) in your browser
   - The application should be running in development mode

3. Development Workflow:

   - Use feature branches for development
   - Follow the project's code style guidelines
   - Write tests for new features
   - Update documentation as needed
   - Submit pull requests for review

4. Debugging:
   - Use browser developer tools for frontend debugging
   - Check server logs in the terminal
   - Use Prisma Studio for database inspection:
     ```bash
     npx prisma studio
     ```

### 6. Implementation Best Practices

#### Code Style

This project uses ESLint and Prettier for code formatting. You can run the linter with:

```bash
npm run lint
```

For formatting, use:

```bash
npm run format
```

#### Database Schema Changes

After modifying the Prisma schema, run the following commands to update the database:

```bash

# Apply schema changes to the database
npm run prisma:migrate

# Add seed to the database
npm run prisma:seed
```

#### Component Development

- Use shadcn/ui components when possible for consistency
- Import components from the barrel file: `import { Button, Card } from '@/components/ui'`
- Use theme tokens from `@/lib/theme` for consistent styling
- Apply internationalization with the `t()` function
- Create reusable components in the `components` directory
- Use TypeScript for type safety

### 7. Authentication System

The project implements a robust authentication system:

```typescript
// Check if user is authenticated
const isLoggedIn = isAuthenticated();

// Attempt to login
const result = await login(email, password);

// User registration
await register({
  email,
  password,
  firstName,
  lastName,
});
```

The authentication system includes:

- Email verification
- Password reset functionality
- Role-based access control
- Session management
- Secure token handling

## Individual Contributions

### Ruoming Ren

- Backend of the Authentication System
- Link Between QR Code Check-in and Virtual Lounge Room
- Virtual Lounge Room

### Zhaoyi Cheng

- Frontend of the Authentication System
- Email Verification
- User Role management
- User Profile and editing

### Ruoxi Yu

- Event Creation Workflow
- Event Review Workflow
- QR Code Check-In System
- Calendar Integration

### Yige Tao

- Page base layout setup
- File management in cloud and preview
- LLM Profile Enhancement

## Lessons Learned and Concluding Remarks

### Technical Journey

Building EventHub has been a crash course in modern web development. Next.js App Router unlocked powerful server components and streamlined data fetching. Server actions made form handling much smoother, and we saw real performance gains from these choices. Real-time features pushed us to level up. WebSocket implementation took work—especially managing concurrent connections—but it now powers live check-in-based attendance tracking and Q&A seamlessly. On the backend, Prisma and PostgreSQL taught us a lot about data modeling and optimization. Our schema evolved significantly as the project grew, and the lessons we learned will stick with us. We also got hands-on with Google Cloud, from secure file storage to resource management. It gave us a much clearer picture of how to build and maintain scalable cloud infrastructure.

### Team Experience

Teamwork was central to everything. We kept development smooth with Git workflows, regular code reviews, and open communication. These habits helped us ship features fast without sacrificing code quality. Documentation played a crucial role in our project's success. We created comprehensive documentation that helped new team members get up to speed quickly, established clear guidelines that maintained code consistency, and kept our documentation updated to reflect the project's evolution. This attention to documentation proved invaluable for both development and maintenance.

### Looking Ahead

We're proud of how far we've come, but there's still plenty of room to grow. Our next step is to deploy EventHub. While we didn't have enough time to complete deployment within the course timeline, it's something we're excited to explore further—it'll be a valuable opportunity to learn real-world deployment workflows. We're also looking into better caching, broader test coverage, and enhanced real-time features. On the UX side, more customization, deeper analytics, and improved mobile responsiveness are on our roadmap. Infrastructure-wise, we're considering better monitoring, autoscaling, and security enhancements to keep EventHub ready for the future.

### Final Thoughts

Building EventHub has been an intense but incredibly rewarding experience for all four of us. With only a short amount of time, we came together, learned fast, and built a fully functional platform from scratch using a modern, production-ready tech stack. It wasn't always easy—juggling real-time features, cloud integration, and a growing codebase—but every challenge pushed us to grow as developers and teammates.

This project gave us a chance to apply what we've learned in a real-world setting, and more importantly, to collaborate, adapt, and ship something we're genuinely proud of. It's been a great opportunity to explore cutting-edge tools like Next.js App Router, Prisma, PostgreSQL, and Google Cloud, all while learning how to build scalable, maintainable, and user-friendly software.

We're really grateful for the chance to work on this as a team. Even as this project is wrapping up, the lessons and memories we've gained will stay with us long after. And who knows? This might just be the beginning for EventHub.

## License

This project is licensed under the [MIT License](LICENSE) - see the [LICENSE](LICENSE) file for details.
