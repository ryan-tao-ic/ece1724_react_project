// app/events/events-client.tsx

'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import t from '@/lib/i18n';
import { format } from 'date-fns';

interface Event {
  id: string;
  name: string;
  description?: string;
  location: string;
  eventStartTime: string;
  category: {
    name: string;
  };
}

interface EventsClientProps {
  events: Event[];
  categories: string[];
  userRole: "USER" | "LECTURER" | "STAFF" | "ADMIN" | null;
}

export default function EventsClient({ events, categories, userRole }: EventsClientProps) {
  const searchParams = useSearchParams();

  const categoryFilter = searchParams.get('category') || '';
  const dateFilter = searchParams.get('date') || '';
  const query = searchParams.get('query')?.toLowerCase() || '';

  const filteredEvents = events.filter((event) => {
    const categoryMatch = categoryFilter ? event.category.name === categoryFilter : true;
    const now = new Date();
    const eventDate = new Date(event.eventStartTime);

    let dateMatch = true;
    if (dateFilter === 'today') {
      dateMatch = eventDate.toDateString() === now.toDateString();
    } else if (dateFilter === 'week') {
      const weekFromNow = new Date();
      weekFromNow.setDate(now.getDate() + 7);
      dateMatch = eventDate >= now && eventDate <= weekFromNow;
    } else if (dateFilter === 'month') {
      const monthFromNow = new Date();
      monthFromNow.setMonth(now.getMonth() + 1);
      dateMatch = eventDate >= now && eventDate <= monthFromNow;
    }

    const queryMatch = query
      ? event.name.toLowerCase().includes(query) ||
        (event.description?.toLowerCase().includes(query) || false) ||
        event.location.toLowerCase().includes(query)
      : true;

    return categoryMatch && dateMatch && queryMatch;
  });

  return (
    <>
      {/* Filters */}
      <form method="GET" className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input placeholder={t('events.search')} type="search" name="query" defaultValue={query} />
        </div>
        <div className="flex flex-row gap-2">
          <select name="category" defaultValue={categoryFilter} className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:w-[200px]">
            {categories.map((category) => (
              <option key={category} value={category === t('events.filters.allCategories') ? '' : category}>
                {category}
              </option>
            ))}
          </select>
          <select name="date" defaultValue={dateFilter} className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:w-[150px]">
            <option value="">{t('events.filters.anyDate')}</option>
            <option value="today">{t('events.filters.today')}</option>
            <option value="week">{t('events.filters.thisWeek')}</option>
            <option value="month">{t('events.filters.thisMonth')}</option>
          </select>
          <Button type="submit">Filter</Button>
        </div>
      </form>

      {/* Event list */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEvents.map((event) => (
            <div key={event.id} className="border rounded-lg p-6 shadow-sm space-y-2">
              <h3 className="text-lg font-semibold">{event.name}</h3>
              <p className="text-sm text-muted-foreground">{event.description}</p>
              <p className="text-sm">📍 {event.location}</p>
              <p className="text-sm">🗓️ {format(new Date(event.eventStartTime), 'yyyy-MM-dd HH:mm')}</p>
              <Button asChild className="mt-2">
                <Link href={`/events/${event.id}`}>More Information</Link>
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <h3 className="text-lg font-medium">{t('events.empty.title')}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{t('events.empty.description')}</p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard">{t('events.empty.action')}</Link>
          </Button>
        </div>
      )}
    </>
  );
}
