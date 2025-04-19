# EventHub - Academic Event Management Platform

## Team Information

- **Ruoming Ren** - Student Number: [To be filled] - Email: luke.ren@mail.utoronto.ca
- **Zhaoyi Cheng** - Student Number: 1005727411 - Email: zhaoyi.cheng@mail.utoronto.ca
- **Ruoxi Yu** - Student Number: [To be filled] - ruoxi.yu@mail.utoronto.ca
- **Yige Tao** - Student Number: [To be filled] - Email: yige.tao@mail.utoronto.ca

## Motivation

The main purpose of EventHub is to make academic event management easy and organized. The organizing of academic events envisaged as Master's and PhD defenses, conferences, seminars, and guest lectures, takes place using a cumbersome manual process. Most of the time, event organizers appeal to generic forms or email registrations, which do not have the functionalities of real-time attendance tracking, nor effective management tools. This leads to:

- Enhanced administrative workloads
- Inefficient management of participants' data
- Disrupted connectivity due to multiple systems used by organizers and attendees
- Ineffective organization of important event staff in dealing with case load
- Slow consideration of messages in real-time during events

Our platform addresses these pain points by providing a comprehensive solution that transforms fragmented manual processes into a seamless, automated workflow.

## Objectives

The primary objectives of EventHub are:

1. **Streamlined Event Management**
   - Create a unified platform for academic event organization
   - Implement role-based access control for different user types
   - Provide efficient event creation and management tools
   - Enable staff to review and approve event requests
   - Allow lecturers to submit activity requests and upload materials
   - Implement comprehensive event cancellation workflow

2. **Enhanced User Experience**
   - Simplify the registration process for attendees
   - Implement QR code-based check-in system
   - Enable real-time interaction through virtual lounges
   - Provide intuitive event browsing with filtering and search
   - Support calendar integration for event scheduling
   - Implement waitlist management with automatic notifications

3. **Improved Administrative Efficiency**
   - Automate attendance tracking
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
   - Integrate with external services (Google Calendar, Cloud Storage)
   - Ensure type safety and robust data handling

## Technical Stack

- **Frontend**: React with Next.js 13+, styled using Tailwind CSS and shadcn/ui
- **Backend**: Next.js Server Components, API Routes, and Server Actions
- **Database**: PostgreSQL with Prisma ORM
- **Real-time Communication**: Socket.io
- **Authentication**: Custom auth system
- **Deployment**: Docker, Google Cloud Run, Google Cloud SQL
- **File Storage**: Google Cloud Storage
- **Email Service**: Custom email templates and sending system
- **Calendar Integration**: Google Calendar API

## Features

1. **User Authentication and Authorization**
   - Secure user registration with email verification
   - Role-based access control (Regular Users, Lecturers, Staff)
   - Password reset functionality
   - Staff invitation system for privileged access

2. **Event Management System**
   - Event creation and approval workflow
   - Detailed event information management
   - Registration settings and capacity control
   - Event cancellation workflow
   - Material upload and management
   - Calendar integration

3. **Registration and Check-in**
   - Customizable registration forms
   - Waitlist management
   - QR code-based check-in system
   - Automatic email confirmations
   - Calendar event integration

4. **Virtual Lounge and Real-time Features**
   - WebSocket-based real-time communication
   - Live Q&A sessions
   - Real-time attendance monitoring
   - Participant tracking and logging
   - Automatic lounge closure

5. **User Dashboard**
   - Centralized event management
   - Upcoming and past event tracking
   - Registration management
   - Material access
   - Event lounge access
   - Role-specific privileges

6. **File Management**
   - Secure document storage
   - Material upload and download
   - PDF viewing capabilities
   - File type validation
   - Access control for materials

## User Guide

### Authentication and Account Management

#### Registration Process
1. **Initial Sign Up**
   - Click the "Sign Up" button in the top right corner
   - Fill in your details:
     - Email address
     - Password (minimum 6 characters)
     - First and Last Name
   - Click "Create Account", the system will send you an email verification.

2. **Email Verification**
   - Check your email for a verification link
   - Click the verification link to activate your account
   - You'll be redirected to the login page

3. **Login**
   - Enter your email and password
   - Click "Sign In"
   - Upon successful login, you'll be redirected to your dashboard

4. **Password Reset**
   - If forget your password, click "Forgot Password" on the login page
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
   - Access event materials

3. **For Staff Members**
   - Review pending events
   - Manage event approvals
   - Track published events
   - Access QR scanner for check-ins
   - Manage user roles
   - View event analytics

### Profile Management

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
   - Fill in required fields
   - Use the rich text editor for your bio
   - AI Enhancement Features:
     - Click "Enhance Bio" to improve your bio with AI assistance
     - Click "Make Professional" to get a more professional tone
     - Both features are powered by deepseek AI
     - The enhanced content will be automatically updated in the editor
   - Click "Update Profile" to save changes

### Event Management

#### For Event Organizers

1. **Creating an Event**
   - Navigate to Dashboard → "Create Event"
   - Fill in event details:
     - Event Title
     - Description
     - Date and Time
     - Location (Physical/Virtual)
     - Capacity
     - Registration Requirements
   - Upload any relevant materials
   - Set registration deadline
   - Submit for approval (if required)

2. **Managing Events**
   - View event dashboard for:
     - Registration statistics
     - Attendee list
     - Check-in status
     - Q&A sessions
   - Upload additional materials
   - Send notifications to attendees
   - Monitor real-time attendance

3. **Event Modifications**
   - Edit event details
   - Update capacity
   - Change registration requirements
   - Cancel event (with notification system)

#### For Attendees

1. **Event Registration**
   - Browse available events
   - Click "Register" on desired event
   - Fill in required information
   - Receive confirmation email
   - Add to calendar (optional)

2. **Pre-Event Preparation**
   - Check email for event updates
   - Download event materials
   - Save QR code for check-in
   - Review event details

### Virtual Lounge System

1. **Accessing the Lounge**
   - Staff can enter anytime via event management
   - Attendees can enter after QR code check-in
   - Lecturers can enter 30 minutes before start time

2. **Lounge Features**
   - Real-time participant list
   - Role-based visibility
   - Q&A functionality
   - Material access
   - Chat system

3. **Check-in Process**
   - Present QR code to staff
   - Staff scans code using the app
   - Automatic lounge access granted
   - Attendance recorded in system

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
   - Click "Add to Calendar" on event page
   - Choose calendar service (Google, Outlook, etc.)
   - Confirm event details
   - Save to calendar

2. **Calendar Features**
   - Automatic updates for changes
   - Reminder notifications
   - Location details
   - Material links

### Role-Specific Features

#### For Staff Members
- Event approval workflow
- Attendee management
- Check-in system access
- Analytics dashboard
- Report generation

#### For Lecturers
- Material upload and management
- Q&A moderation
- Presentation tools
- Attendance tracking
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
│   │   └── page.tsx         # Dashboard main page
│   ├── events/              # Event management
│   │   ├── create/          # Event creation
│   │   ├── [id]/           # Dynamic event routes
│   │   ├── page.tsx        # Events listing
│   │   └── events-client.tsx # Client-side event components
│   ├── lounge/              # Virtual lounge for events
│   ├── not-authorized/      # Access denied page
│   ├── profile/             # User profile management
│   ├── resetPassword/       # Password reset functionality
│   ├── roleManagement/      # Role management pages
│   ├── verifyEmail/         # Email verification
│   ├── actions.ts          # Server actions (496 lines)
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
│   ├── cancelled-redirect.tsx # Cancellation redirect
│   ├── event-materials-upload.tsx # Event materials upload
│   └── qr-code.tsx         # QR code generation
├── hooks/                   # Custom React hooks
│   └── useFileUpload.ts    # File upload hook
├── lib/                     # Utility functions and shared code
│   ├── auth/               # Authentication utilities
│   │   └── auth.ts         # Auth implementation
│   ├── db/                 # Database utilities
│   ├── email/              # Email functionality
│   │   ├── sendConfirmationEmail.ts # Event confirmation
│   │   ├── sendCancelNoticeEmails.ts # Cancellation notices
│   │   ├── sendEmail.ts    # Email sending utility
│   │   ├── sendUpgradeEmail.ts # Role upgrade notifications
│   │   ├── verificationEmailTemplate.ts # Email verification
│   │   └── resetPasswordEmailTemplate.ts # Password reset
│   ├── events/             # Event-related utilities
│   ├── file-storage/       # File storage utilities
│   ├── i18n/               # Internationalization
│   │   └── index.ts        # i18n configuration
│   ├── profile/            # Profile management utilities
│   ├── users/              # User management utilities
│   ├── utils/              # General utilities
│   │   └── verificationToken.ts # Token management
│   ├── init.ts             # Application initialization
│   ├── socket.ts           # Socket.io configuration
│   ├── theme.ts            # Theme configuration
│   ├── types.ts            # Type definitions
│   └── utils.ts            # General utilities
├── locales/                # Internationalization files
│   └── en/                 # English translations
├── pages/                  # Legacy pages directory
│   └── api/                # Legacy API routes
├── scripts/                # Utility scripts
│   └── seed-events.js      # Database seeding script
├── types/                  # TypeScript type definitions
│   ├── global.d.ts         # Global type declarations
│   ├── json.d.ts           # JSON type declarations
│   └── next-auth.d.ts      # NextAuth type declarations
├── prisma/                 # Prisma ORM configuration
│   └── schema.prisma       # Database schema
├── public/                 # Static assets
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Docker Compose configuration
└── cloudbuild.yaml         # Google Cloud Build configuration
```

### 2. Environment Setup and Configuration

#### Prerequisites
- Node.js 18.0.0 or later
- PostgreSQL 13 or later
- npm or yarn package manager
- Docker and Docker Compose (optional, for containerized deployment)
- Google Cloud account (for cloud storage and deployment)

#### Installation Steps

1. Clone the repository:
```bash
git clone https://github.com/ryan-tao-ic/ece1724_react_project.git
cd event-hub
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

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Email Configuration
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@example.com"
EMAIL_SERVER_PASSWORD="your-email-password"
EMAIL_FROM="noreply@example.com"

# Google Cloud Storage
GOOGLE_CLOUD_PROJECT_ID="your-project-id"
GOOGLE_CLOUD_BUCKET_NAME="your-bucket-name"
GOOGLE_CLOUD_CLIENT_EMAIL="your-service-account-email"
GOOGLE_CLOUD_PRIVATE_KEY="your-private-key"

# Google Calendar API
GOOGLE_CALENDAR_CLIENT_ID="your-client-id"
GOOGLE_CALENDAR_CLIENT_SECRET="your-client-secret"
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

3. Generate Prisma client:
```bash
npx prisma generate
```

4. Seed the database with initial data:
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

3. Run tests:
```bash
# Run unit tests
npm test

# Run end-to-end tests
npm run test:e2e

# Run linting
npm run lint

# Format code
npm run format
```

4. Development Workflow:
   - Use feature branches for development
   - Follow the project's code style guidelines
   - Write tests for new features
   - Update documentation as needed
   - Submit pull requests for review

5. Debugging:
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
# Generate Prisma client (optional)
npm run prisma:generate

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

### 7. Internationalization (i18n)

The project uses a simple i18n solution with JSON-based locale files:

#### Structure
- Locale files are stored in the `locales/{language}` directory
- The main English locale file is at `locales/en/common.json`
- Text strings are organized in a nested structure by component/page

#### Usage
To use translations in your components:
```tsx
import t from '@/lib/i18n';

// Simple text translation
<h1>{t('dashboard.title')}</h1>

// With parameters
<p>{t('footer.copyright', { year: 2023 })}</p>
```

#### Adding New Translations
1. Add new strings to the `locales/en/common.json` file in the appropriate section
2. Use nested keys that reflect the component hierarchy
3. Use the `t()` function in your components to reference these keys

### 8. UI Component Organization

#### Shadcn/UI Components
The project uses shadcn/ui as its component library, which provides a set of accessible, customizable components. These components are imported directly into the project, allowing for full customization.

#### Barrel Exports
To simplify imports, UI components are re-exported from a central barrel file:
```tsx
// Import multiple components in a single import
import { Button, Card, Input, Form } from "@/components/ui";
```

#### Theming
The application uses a consistent theming approach:
1. **Tailwind CSS** for styling with utility classes
2. **next-themes** for light/dark mode support
3. **Theme tokens** in `lib/theme.ts` for consistent spacing, typography, and colors

Example usage of theme tokens:
```tsx
import { text, spacing, radius } from "@/lib/theme";

// Using theme tokens in components
<div className={`${spacing.md} ${radius.lg}`}>
  <h2 className={text.xl}>Heading</h2>
</div>;
```

### 9. Data Fetching Architecture

The project follows Next.js 13+ App Router best practices for data management:

#### Server Components (Recommended Approach)
For initial page loads and static/dynamic data that doesn't require user interaction:
```tsx
// In a Server Component (app/events/page.tsx)
import { getEvents } from "@/lib/db/events";

export default async function EventsPage() {
  // Fetch events using the cached data function
  const events = await getEvents();

  return <EventList events={events} />;
}
```

#### Server Actions
For data mutations and form submissions:
```tsx
// Import the server action
import { createEvent } from "@/app/actions";

// Use in a client component form
<form action={createEvent}>
  <input name="name" />
  <input name="location" />
  <button type="submit">Create Event</button>
</form>;
```

#### Client Components
For client-side interactive features:
```tsx
"use client";

import { useState } from "react";
import { createEvent } from "@/app/actions";

export function EventForm() {
  const [name, setName] = useState("");

  // Form with client-side validation
  return (
    <form
      action={async (formData) => {
        // Validate form data client-side
        if (!name) return;

        // Submit using server action
        const result = await createEvent(formData);

        // Handle result
        if (result.success) {
          // Success handling
        }
      }}
    >
      <input
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button type="submit">Create Event</button>
    </form>
  );
}
```

### 10. Authentication System

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


### Zhaoyi Cheng


### Ruoxi Yu


### Yige Tao


## Lessons Learned and Concluding Remarks

### Technical Insights
1. **Next.js App Router**
   - Learned the benefits of server components for performance optimization
   - Gained experience with server actions for form handling
   - Implemented efficient data fetching strategies

2. **Real-time Features**
   - Successfully implemented WebSocket-based communication
   - Learned to handle concurrent connections efficiently
   - Developed strategies for real-time data synchronization

3. **Database Management**
   - Gained experience with Prisma ORM and PostgreSQL
   - Implemented efficient database schemas
   - Learned to handle complex relationships and queries

4. **Cloud Integration**
   - Successfully integrated multiple Google Cloud services
   - Learned to manage cloud resources efficiently
   - Implemented secure file storage solutions

### Project Management Lessons
1. **Team Collaboration**
   - Effective use of Git for version control
   - Regular code reviews improved code quality
   - Clear communication channels enhanced productivity

2. **Development Process**
   - Agile methodology proved effective for feature development
   - Continuous integration improved code stability
   - Regular testing prevented major issues

3. **Documentation**
   - Comprehensive documentation aided onboarding
   - Clear guidelines improved code consistency
   - Regular updates maintained documentation relevance

### Future Improvements
1. **Technical Enhancements**
   - Implement more advanced caching strategies
   - Add more comprehensive testing coverage
   - Enhance real-time features with additional functionality

2. **User Experience**
   - Add more customization options
   - Implement advanced analytics
   - Enhance mobile responsiveness

3. **Infrastructure**
   - Implement more robust monitoring
   - Add automated scaling capabilities
   - Enhance security measures

### Final Thoughts
The EventHub project has been a valuable learning experience, combining modern web technologies with practical event management solutions. The team successfully implemented a comprehensive platform that addresses the challenges of academic event management. The project demonstrates the effectiveness of using Next.js, Prisma, and modern web technologies to create scalable, maintainable applications. The lessons learned during development will continue to inform future projects and improvements to the platform.

