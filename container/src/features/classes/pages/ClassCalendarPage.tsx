/**
 * Class Calendar Page
 * Main page component for viewing class calendar
 */

import { useParams } from 'react-router-dom';
import { useCalendarStore } from '../stores/calendarStore';
import { CalendarHeader, CalendarGrid, EventDetailsDialog } from '../components/calendar';
import { Loader2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@radix-ui/react-separator';
import { useClass, useCalendarEvents } from '../hooks';

export function ClassCalendarPage() {
  const { t } = useTranslation('classes');
  const { t: tPage } = useTranslation('common', { keyPrefix: 'pages' });
  const { id: classId } = useParams<{ id: string }>();
  const { selectedDate, selectedEventId, openEventDetails, closeEventDetails } = useCalendarStore();

  // Fetch class data for breadcrumb
  const { data: classData } = useClass(classId!);

  const { events, isLoading, error } = useCalendarEvents(classId!, selectedDate);

  // Find selected event for details dialog
  const selectedEvent = events.find((e) => e.id === selectedEventId) ?? null;

  if (!classId) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-2 text-sm text-gray-600">
            {t('calendar.errors.invalidClassId', 'Invalid class ID')}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-2 text-sm text-gray-600">
            {t('calendar.errors.loadFailed', 'Failed to load calendar events')}
          </p>
          <p className="mt-1 text-xs text-gray-500">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Breadcrumb Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/classes">{tPage('classes')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href={`/classes/${classId}`}>
                {classData?.name || t('detail.loading')}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('calendar.title', 'Calendar')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <CalendarHeader goBackLink={`/classes/${classId}`} />

      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex h-[50vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <CalendarGrid events={events} onEventClick={(event) => openEventDetails(event.id)} />
        )}
      </div>

      <EventDetailsDialog event={selectedEvent} open={!!selectedEventId} onClose={closeEventDetails} />
    </div>
  );
}
