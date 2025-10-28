/**
 * Period Details Dialog Component
 * Displays full period information in a modal dialog
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { Calendar, Clock, MapPin, Info } from 'lucide-react';
import { PERIOD_CATEGORY_STYLES } from '../../../shared/types';
import { formatTimeRange } from '../../utils/calendarHelpers';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import useScheduleStore from '../../stores/scheduleStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { getLocaleDateFns } from '@/shared/i18n/helper';

export function PeriodDetailsDialog() {
  const { t } = useTranslation('classes');

  const { selectedPeriod: period, closePeriodDetails: onClose } = useScheduleStore();
  const navigate = useNavigate();

  if (!period) return null;

  const categoryStyles =
    PERIOD_CATEGORY_STYLES[period.category as keyof typeof PERIOD_CATEGORY_STYLES] ??
    PERIOD_CATEGORY_STYLES.other;
  const timeRange = formatTimeRange(period.startTime, period.endTime);
  const formattedDate = format(new Date(period.date), 'PPPP', { locale: getLocaleDateFns() });

  return (
    <Dialog open={!!period} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{period.name}</DialogTitle>
          <DialogDescription />
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Category Badge */}
          <div>
            <Badge className={`${categoryStyles.bg} ${categoryStyles.text} ${categoryStyles.border} border`}>
              {t(`calendar.categories.${period.category}`, period.category)}
            </Badge>
          </div>

          {/* Date */}
          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-700">{t('calendar.fields.date')}</p>
              <p className="text-sm text-gray-600">{formattedDate}</p>
            </div>
          </div>

          {/* Time */}
          {timeRange && (
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">{t('calendar.fields.time')}</p>
                <p className="text-sm text-gray-600">{timeRange}</p>
              </div>
            </div>
          )}

          {/* Location */}
          {period.location && (
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">{t('calendar.fields.location')}</p>
                <p className="text-sm text-gray-600">{period.location}</p>
              </div>
            </div>
          )}

          {/* Description */}
          {period.description && (
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">{t('calendar.fields.description')}</p>
                <p className="text-sm text-gray-600">{period.description}</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            {t('form.close')}
          </Button>
          <Button onClick={() => navigate(`/periods/${period.id}`)}>{t('calendar.viewFullDetails')}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
