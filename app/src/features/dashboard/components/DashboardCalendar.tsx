import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { getLocaleDateFns } from '@/shared/i18n/helper';
import { useState } from 'react';

export const DashboardCalendar = () => {
  const { t } = useTranslation('dashboard');
  const [currentDate, _] = useState(new Date(2024, 5, 1)); // June 2024

  const monthString = format(currentDate, 'MMMM yyyy', { locale: getLocaleDateFns() });

  const weekdays = [
    t('calendar.weekdays.sunday'),
    t('calendar.weekdays.monday'),
    t('calendar.weekdays.tuesday'),
    t('calendar.weekdays.wednesday'),
    t('calendar.weekdays.thursday'),
    t('calendar.weekdays.friday'),
    t('calendar.weekdays.saturday'),
  ];

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t('calendar.title')}</h3>
      </div>
      <div className="bg-card rounded-lg border p-4">
        {/* Custom Header */}
        <div className="mb-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">{monthString}</span>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-2">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {weekdays.map((day) => (
              <div key={day} className="text-muted-foreground text-xs font-medium">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {/* Previous month days */}
            {[26, 27, 28, 29, 30, 31].map((day) => (
              <button
                key={`prev-${day}`}
                className="text-muted-foreground/50 hover:bg-muted aspect-square rounded-md p-0 text-sm"
              >
                {day}
              </button>
            ))}

            {/* Current month - first row */}
            <button className="hover:bg-muted aspect-square rounded-md p-0 text-sm">1</button>

            {/* Week 2 */}
            {[2, 3, 4, 5].map((day) => (
              <button key={day} className="hover:bg-muted aspect-square rounded-md p-0 text-sm">
                {day}
              </button>
            ))}
            <button className="bg-primary text-primary-foreground aspect-square rounded-md p-0 text-sm font-medium">
              6
            </button>
            {[7, 8].map((day) => (
              <button key={day} className="hover:bg-muted aspect-square rounded-md p-0 text-sm">
                {day}
              </button>
            ))}

            {/* Week 3 */}
            {[9, 10, 11, 12, 13, 14, 15].map((day) => (
              <button key={day} className="hover:bg-muted aspect-square rounded-md p-0 text-sm">
                {day}
              </button>
            ))}

            {/* Week 4 */}
            {[16, 17, 18, 19, 20, 21, 22].map((day) => (
              <button key={day} className="hover:bg-muted aspect-square rounded-md p-0 text-sm">
                {day}
              </button>
            ))}

            {/* Week 5 */}
            {[23, 24, 25, 26, 27, 28, 29].map((day) => (
              <button key={day} className="hover:bg-muted aspect-square rounded-md p-0 text-sm">
                {day}
              </button>
            ))}

            {/* Week 6 */}
            <button className="hover:bg-muted aspect-square rounded-md p-0 text-sm">30</button>
            {[1].map((day) => (
              <button
                key={`next-${day}`}
                className="text-muted-foreground/50 hover:bg-muted aspect-square rounded-md p-0 text-sm"
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Next Up Section */}
        <div className="bg-muted/50 mt-6 rounded-md p-4">
          <h4 className="mb-1 text-sm font-semibold">{t('calendar.nextUp')}: Parent-Teacher Meeting</h4>
          <p className="text-muted-foreground text-xs">{t('calendar.today')} at 3:00 PM</p>
        </div>
      </div>
    </div>
  );
};
