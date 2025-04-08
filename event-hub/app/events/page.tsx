// app/events/page.tsx
import { getEvents } from '@/lib/db/events';
import { MainLayout } from '@/components/layout/main-layout';
import { Container } from '@/components/ui/container';
import EventsClient from './events-client';
import t from '@/lib/i18n';

// Keep this as a simple server component with minimal logic
export default async function EventsPage() {
  // Just fetch the data
  const events = (await getEvents()).map((event) => ({
    ...event,
    description: event.description ?? undefined,
    eventStartTime: event.eventStartTime.toISOString(), // Convert Date to string
  }));
  const categories = [
    t('events.filters.allCategories'),
    ...Array.from(new Set(events.map((e) => e.category.name)))
  ];

  return (
    <MainLayout>
      <Container className="py-10">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('events.title')}</h1>
            <p className="text-muted-foreground">{t('events.description')}</p>
          </div>
          
          {/* Pass data to client component */}
          <EventsClient 
            events={events} 
            categories={categories} 
          />
        </div>
      </Container>
    </MainLayout>
  );
}