import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MainLayout } from '@/components/layout/main-layout';
import { Container } from '@/components/ui/container';
import t from '@/lib/i18n';

// Categories would come from the database in a real implementation
const categories = [
  t('events.filters.allCategories'),
  'Workshop',
  'PhD Defense',
  'Guest Lecture',
  'Conference',
  'Seminar'
];

export default function EventsPage() {
  return (
    <MainLayout>
      <Container className="py-10">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('events.title')}</h1>
            <p className="text-muted-foreground">
              {t('events.description')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input placeholder={t('events.search')} type="search" />
            </div>
            <div className="flex flex-row gap-2">
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-[200px]">
                {categories.map((category) => (
                  <option 
                    key={category} 
                    value={category === t('events.filters.allCategories') ? '' : category}
                  >
                    {category}
                  </option>
                ))}
              </select>
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-[150px]">
                <option value="">{t('events.filters.anyDate')}</option>
                <option value="today">{t('events.filters.today')}</option>
                <option value="week">{t('events.filters.thisWeek')}</option>
                <option value="month">{t('events.filters.thisMonth')}</option>
              </select>
            </div>
          </div>

          <div className="rounded-lg border border-dashed p-8 text-center">
            <h3 className="text-lg font-medium">{t('events.empty.title')}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('events.empty.description')}
            </p>
            <Button className="mt-4" asChild>
              <Link href="/dashboard">{t('events.empty.action')}</Link>
            </Button>
          </div>
        </div>
      </Container>
    </MainLayout>
  );
} 