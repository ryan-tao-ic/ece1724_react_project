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
      <Container className="py-12">
        <div className="flex flex-col gap-10">

          {/* Header section with Submit button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold leading-snug tracking-tight">
                {t('events.title')}
              </h1>
              <p className="text-muted-foreground text-base leading-relaxed tracking-wide">
                {t('events.description')}
              </p>
            </div>

            <div className="w-full sm:w-auto sm:text-right ml-auto space-y-2 sm:space-y-3">
              <h2 className="text-2xl font-bold text-gray-900">
                Is your event not listed?
              </h2>
              <Link
                href={
                  userRole === 'LECTURER' || userRole === 'STAFF'
                    ? '/events/create'
                    : '/not-authorized'
                }
              >
                <Button className="bg-primary text-white hover:bg-primary/90 px-6 py-2 text-base font-semibold shadow">
                  {t("home.cta.submitEvent")}
                </Button>
              </Link>
            </div>
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
