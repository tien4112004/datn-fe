/**
 * Event Details Dialog Component
 * Displays full event information in a modal dialog
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { Calendar, Clock, MapPin, Info } from 'lucide-react';
import type { CalendarEvent } from '../../types/entities/calendarEvent';
import { EVENT_CATEGORY_STYLES } from '../../types/constants/eventCategories';
import { formatTimeRange } from '../../utils/calendarHelpers';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface EventDetailsDialogProps {
  /** Event to display (null = dialog closed) */
  event: CalendarEvent | null;

  /** Whether dialog is open */
  open: boolean;

  /** Callback to close dialog */
  onClose: () => void;
}

export function EventDetailsDialog({ event, open, onClose }: EventDetailsDialogProps) {
  const { t } = useTranslation('classes');

  if (!event) return null;

  const categoryStyles =
    EVENT_CATEGORY_STYLES[event.category as keyof typeof EVENT_CATEGORY_STYLES] ??
    EVENT_CATEGORY_STYLES.other;
  const timeRange = formatTimeRange(event.startTime, event.endTime);
  const formattedDate = format(new Date(event.date), 'EEEE, MMMM d, yyyy');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{event.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Category Badge */}
          <div>
            <Badge className={`${categoryStyles.bg} ${categoryStyles.text} ${categoryStyles.border} border`}>
              {t(`calendar.categories.${event.category}`, event.category)}
            </Badge>
          </div>

          {/* Date */}
          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-700">{t('calendar.fields.date', 'Date')}</p>
              <p className="text-sm text-gray-600">{formattedDate}</p>
            </div>
          </div>

          {/* Time */}
          {timeRange && (
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">{t('calendar.fields.time', 'Time')}</p>
                <p className="text-sm text-gray-600">{timeRange}</p>
              </div>
            </div>
          )}

          {/* Location */}
          {event.location && (
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {t('calendar.fields.location', 'Location')}
                </p>
                <p className="text-sm text-gray-600">{event.location}</p>
              </div>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {t('calendar.fields.description', 'Description')}
                </p>
                <p className="text-sm text-gray-600">{event.description}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
