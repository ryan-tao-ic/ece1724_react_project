# EventHub - Academic Event Management Platform

EventHub is a comprehensive web application for managing academic events such as Master's and PhD defenses, conferences, seminars, and guest lectures. It streamlines the registration and check-in processes, making event management easier for organizers and providing a better experience for attendees.

## Features

- User authentication and role-based access control
- Event creation, management, and browsing
- Registration and QR code-based check-in
- Real-time interaction through virtual lounges
- Secure document storage
- Waitlist management

## Tech Stack

- **Frontend**: React with Next.js 13+, styled using Tailwind CSS and shadcn/ui
- **Backend**: Next.js Server Components, API Routes, and Server Actions
- **Database**: PostgreSQL with Prisma ORM
- **Real-time Communication**: Socket.io
- **Authentication**: Custom auth system
- **Deployment**: Docker, Google Cloud Run, Google Cloud SQL
- **File Storage**: Google Cloud Storage (planned)

## Prerequisites

- Node.js 18.0.0 or later
- PostgreSQL 13 or later
- npm or yarn package manager
- Docker and Docker Compose (optional, for containerized deployment)
- Google Cloud account (optional, for cloud deployment)

## Getting Started

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
```bash
cp .env.example .env
```

4. Initialize the database:

Make sure your PostgreSQL database is running, and then:
```bash
createdb event_hub   
npx prisma migrate dev
```

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
event-hub/
├── app/                      # Next.js app router
│   ├── (auth)/               # Authentication routes (login, register)
│   ├── dashboard/            # User dashboard pages
│   ├── events/               # Event pages
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   └── providers.tsx         # React context providers
├── components/               # React components
│   ├── layout/               # Layout components
│   └── ui/                   # UI components from shadcn/ui
│       └── index.ts          # Barrel file for component exports
├── lib/                      # Utility functions and shared code
│   ├── auth/                 # Authentication utilities (simplified placeholders)
│   ├── db/                   # Database utilities
│   ├── i18n/                 # Internationalization utilities
│   └── theme.ts              # Theme tokens and styling utilities
├── locales/                  # Internationalization files
│   └── en/                   # English translations
├── prisma/                   # Prisma ORM schema and migrations
│   └── schema.prisma         # Database schema
├── public/                   # Static assets
├── Dockerfile                # Docker configuration
├── docker-compose.yml        # Docker Compose configuration
└── cloudbuild.yaml           # Google Cloud Build configuration
```

## Development Guidelines

### Code Style

This project uses ESLint and Prettier for code formatting. You can run the linter with:

```bash
npm run lint
```

For formatting, use:

```bash
npm run format
```

### .env changes

Change the .env.example file if you want to publish your .env to github

use this to copy the changes to .env.example to .env if it is updated by other teammates.

```bash
cp .env.example .env
```

### Database Schema Changes

After modifying the Prisma schema, run the following commands to update the database:

```bash
# Generate Prisma client (optional)
npm run prisma:generate

# Apply schema changes to the database
npm run prisma:migrate
```

### Component Development

- Use shadcn/ui components when possible for consistency
- Import components from the barrel file: `import { Button, Card } from '@/components/ui'`
- Use theme tokens from `@/lib/theme` for consistent styling
- Apply internationalization with the `t()` function
- Create reusable components in the `components` directory
- Use TypeScript for type safety

## Internationalization (i18n)

The project uses a simple i18n solution with JSON-based locale files:

### Structure

- Locale files are stored in the `locales/{language}` directory
- The main English locale file is at `locales/en/common.json`
- Text strings are organized in a nested structure by component/page

### Usage

To use translations in your components:

```tsx
import t from '@/lib/i18n';

// Simple text translation
<h1>{t('dashboard.title')}</h1>

// With parameters
<p>{t('footer.copyright', { year: 2023 })}</p>
```

### Adding New Translations

1. Add new strings to the `locales/en/common.json` file in the appropriate section
2. Use nested keys that reflect the component hierarchy
3. Use the `t()` function in your components to reference these keys

For supporting additional languages in the future, you would add new locale directories (e.g., `locales/fr`, `locales/es`) with the same structure.

## UI Component Organization

### Shadcn/UI Components

The project uses shadcn/ui as its component library, which provides a set of accessible, customizable components. These components are imported directly into the project, allowing for full customization.

### Barrel Exports

To simplify imports, UI components are re-exported from a central barrel file:

```tsx
// Import multiple components in a single import
import { Button, Card, Input, Form } from '@/components/ui';
```

### Theming

The application uses a consistent theming approach:

1. **Tailwind CSS** for styling with utility classes
2. **next-themes** for light/dark mode support
3. **Theme tokens** in `lib/theme.ts` for consistent spacing, typography, and colors

Example usage of theme tokens:

```tsx
import { text, spacing, radius } from '@/lib/theme';

// Using theme tokens in components
<div className={`${spacing.md} ${radius.lg}`}>
  <h2 className={text.xl}>Heading</h2>
</div>
```

This approach ensures visual consistency throughout the application.

## Data Fetching Architecture

The project follows Next.js 13+ App Router best practices for data management:

### Server Components (Recommended Approach)

For initial page loads and static/dynamic data that doesn't require user interaction:

```tsx
// In a Server Component (app/events/page.tsx)
import { getEvents } from '@/lib/db/events';

export default async function EventsPage() {
  // Fetch events using the cached data function
  const events = await getEvents();
  
  return <EventList events={events} />;
}
```

### Server Actions

For data mutations and form submissions:

```tsx
// Import the server action
import { createEvent } from '@/app/actions';

// Use in a client component form
<form action={createEvent}>
  <input name="name" />
  <input name="location" />
  <button type="submit">Create Event</button>
</form>
```

### Client Components

For client-side interactive features:

```tsx
'use client';

import { useState } from 'react';
import { createEvent } from '@/app/actions';

export function EventForm() {
  const [name, setName] = useState('');
  
  // Form with client-side validation
  return (
    <form action={async (formData) => {
      // Validate form data client-side
      if (!name) return;
      
      // Submit using server action
      const result = await createEvent(formData);
      
      // Handle result
      if (result.success) {
        // Success handling
      }
    }}>
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

This approach leverages the performance benefits of Server Components while providing a smooth user experience.

## Authentication (Simplified Placeholder)

This starter project includes a simplified placeholder authentication system:

```typescript
// Check if user is authenticated (always returns false in this starter)
const isLoggedIn = isAuthenticated();

// Attempt to login (always fails in this starter)
const result = await login(email, password);

// Placeholder for user registration
await register({
  email,
  password,
  firstName,
  lastName
});
```

In a real implementation, this would be replaced with a more robust authentication system like NextAuth.js or a custom JWT solution.

## Deployment

### Local Development Build

To build the application for production locally, run:

```bash
npm run build
# or
yarn build
```

You can then start the production server with:

```bash
npm start
# or
yarn start
```

## Docker Deployment

The application can be run using Docker and Docker Compose.

### Prerequisites

- Docker and Docker Compose installed on your system
- No other services running on ports 3000 (app) and 5432 (PostgreSQL)

### Running with Docker Compose

1. Start the application and database:

```bash
docker-compose up -d
```

This will:
- Build the Next.js application
- Pull and run PostgreSQL
- Set up the database with the correct schema
- Start the application on port 3000

2. Access the application at [http://localhost:3000](http://localhost:3000)

### Stopping the Application

To stop the application:

```bash
docker-compose down
```

To stop the application and remove all data (including the database volume):

```bash
docker-compose down -v
```

### Development with Docker

For development, you may want to use the normal development setup instead of Docker. However, you can use Docker just for the PostgreSQL database:

```bash
docker-compose up -d db
```

Then update your `.env.local` file to point to the Docker PostgreSQL instance:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/eventhub?schema=public"
```

## Google Cloud Deployment

The application is set up for deployment on Google Cloud Run with Cloud SQL for PostgreSQL.

### Prerequisites

- Google Cloud account with a project created
- Google Cloud SDK installed locally
- Cloud Run and Cloud SQL APIs enabled

### Setting Up Cloud SQL

1. Create a Cloud SQL instance:
   - Navigate to Cloud SQL in the Google Cloud Console
   - Create a PostgreSQL instance named "eventhub-dev"
   - Configure basic settings (region, machine type)
   - Create a database named "eventhub"

2. Set up credentials:
   - Create a user (e.g., "postgres") with a password

### Deploying with Cloud Build

The project includes a `cloudbuild.yaml` file for automating deployment:

1. Push your changes to GitHub:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push
   ```

2. Set up a Cloud Build trigger pointing to your GitHub repository:
   - Navigate to Cloud Build in the Google Cloud Console
   - Connect to your GitHub repository
   - Create a trigger that runs on push to your main branch

3. The build will:
   - Build a Docker container from your code
   - Deploy it to Cloud Run
   - Connect it to your Cloud SQL instance
   - Apply database migrations

### Configuring Access Control

By default, the Cloud Run service can be configured to:

1. Allow unauthenticated access (public):
   - In the Cloud Run console, go to your service
   - Under "Security", select "Allow unauthenticated invocations"

2. Require authentication:
   - In the Cloud Run console, go to your service
   - Under "Security", select "Require authentication"
   - Add users by their email address with the "Cloud Run Invoker" role

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Prisma](https://www.prisma.io/)
- [Socket.io](https://socket.io/)
- [Google Cloud Platform](https://cloud.google.com/)
