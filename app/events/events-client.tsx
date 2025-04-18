// app/events/events-client.tsx

'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import t from '@/lib/i18n';
import { format } from 'date-fns';
import { Calendar, MapPin, Search, Tag } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

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

  const categoryFilter = searchParams?.get('category') || '';
  const dateFilter = searchParams?.get('date') || '';
  const query = searchParams?.get('query')?.toLowerCase() || '';

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
      <div className="bg-gray-50 rounded-lg p-6 shadow-sm mb-8">
        <form method="GET" className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t('events.search')}
              type="search"
              name="query"
              defaultValue={query}
              className="pl-10"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                name="category"
                defaultValue={categoryFilter}
                className="h-10 w-full rounded-md border border-input pl-10 pr-3 py-2 text-sm bg-white sm:w-[200px]"
              >
                {categories.map((category) => (
                  <option key={category} value={category === t('events.filters.allCategories') ? '' : category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                name="date"
                defaultValue={dateFilter}
                className="h-10 w-full rounded-md border border-input pl-10 pr-3 py-2 text-sm bg-white sm:w-[150px]"
              >
                <option value="">{t('events.filters.anyDate')}</option>
                <option value="today">{t('events.filters.today')}</option>
                <option value="week">{t('events.filters.thisWeek')}</option>
                <option value="month">{t('events.filters.thisMonth')}</option>
              </select>
            </div>
            <Button type="submit" className="sm:self-start">
              Filter
            </Button>
          </div>
        </form>
      </div>

      {/* Event list */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEvents.map((event) => (
            <div key={event.id} className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="border-l-4 border-primary p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold text-gray-900 line-clamp-1">{event.name}</h3>
                  <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                    {event.category.name}
                  </span>
                </div>

                {event.description && (
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {event.description}
                  </p>
                )}

                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <span className="text-lg mr-2 flex-shrink-0" aria-hidden="true">📍</span>
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" />
                    <span className="text-sm truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="text-lg mr-2 flex-shrink-0" aria-hidden="true">🗓️</span>
                    <Calendar className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" />
                    <span className="text-sm">{format(new Date(event.eventStartTime), 'EEE, MMM d, yyyy • h:mm a')}</span>
                  </div>
                </div>

                <Button asChild variant="outline" className="mt-2 w-full">
                  <Link href={`/events/${event.id}`}>View Details</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">{t('events.empty.title')}</h3>
          <p className="mt-1 text-sm text-gray-500">{t('events.empty.description')}</p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard">{t('events.empty.action')}</Link>
          </Button>
        </div>
      )}
    </>
  );
}
