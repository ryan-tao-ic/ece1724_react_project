// app/events/page.tsx
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { getTokenForServerComponent } from '@/lib/auth/auth';
import { getEvents } from '@/lib/db/events';
import prisma from '@/lib/db/prisma';
import t from '@/lib/i18n';
import Link from 'next/link';
import EventsClient from './events-client';

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
          <div className="bg-white rounded-lg border p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                  {t('events.title')}
                </h1>
                <p className="text-gray-600 max-w-2xl">
                  {t('events.description')}
                </p>
              </div>

              <div className="w-full sm:w-auto flex flex-col items-start sm:items-end space-y-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  Is your event not listed?
                </h2>
                <Link
                  href={
                    userRole === 'LECTURER' || userRole === 'STAFF'
                      ? '/events/create'
                      : '/not-authorized'
                  }
                >
                  <Button className="px-6 py-2 text-sm font-semibold">
                    {t("home.cta.submitEvent")}
                  </Button>
                </Link>
              </div>
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
