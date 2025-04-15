// app/events/page.tsx
import { getEvents } from '@/lib/db/events';
import { MainLayout } from '@/components/layout/main-layout';
import { Container } from '@/components/ui/container';
import EventsClient from './events-client';
import t from '@/lib/i18n';
import { getTokenForServerComponent } from '@/lib/auth/auth';
import prisma from '@/lib/db/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function EventsPage() {
  const events = (await getEvents()).map((event) => ({
    ...event,
    description: event.description ?? undefined,
    eventStartTime: event.eventStartTime.toISOString(),
  }));

  const categories = [
    t('events.filters.allCategories'),
    ...Array.from(new Set(events.map((e) => e.category.name))),
  ];

  const token = await getTokenForServerComponent();
  const id = token.id;

  let userRole: "USER" | "LECTURER" | "STAFF" | "ADMIN" | null = null;
  if (id) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { role: true },
    });
    userRole = user?.role ?? null;
  }

  return (
    <MainLayout>
      <Container className="py-10">
        <div className="flex flex-col gap-8">
          
          {/* Header section with Submit button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t('events.title')}</h1>
              <p className="text-muted-foreground">{t('events.description')}</p>
            </div>
            <Link
              href={
                userRole === 'LECTURER' || userRole === 'STAFF'
                  ? '/events/create'
                  : '/not-authorized'
              }
            >
              <h2 className="text-lg font-semibold mb-1">Is your event not listed?</h2>
              <Button variant="outline">{t("home.cta.submitEvent")}</Button>
            </Link>
          </div>

          {/* Main content */}
          <EventsClient 
            events={events} 
            categories={categories} 
            userRole={userRole}
          />
        </div>
      </Container>
    </MainLayout>
  );
}
