import type { SchedulePeriod } from '../../../shared/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, MapPin, BookOpen, Lightbulb, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { CreateLesson } from './CreateLesson';
import { format } from 'date-fns';
import { getLocaleDateFns } from '@/shared/i18n/helper';
import { useClassStore } from '@/features/classes/shared/stores';
import { formatTimeRange } from '@/features/classes/class-schedule/utils/calendarHelpers';

interface PeriodDetailViewProps {
  period: SchedulePeriod;
}

export const PeriodDetailView = ({ period }: PeriodDetailViewProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation('classes');

  const { selectedClass } = useClassStore();

  const timeRange = formatTimeRange(period.startTime, period.endTime);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      lecture: 'bg-blue-100 text-blue-800 border-blue-200',
      lab: 'bg-purple-100 text-purple-800 border-purple-200',
      seminar: 'bg-green-100 text-green-800 border-green-200',
      workshop: 'bg-orange-100 text-orange-800 border-orange-200',
      review: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-none bg-gradient-to-br from-slate-50 to-slate-100 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                <div className="bg-primary/10 rounded-lg p-2">
                  <BookOpen className="text-primary h-5 w-5" />
                </div>
                {period.name}
              </CardTitle>
              <div className="mt-3 flex flex-col gap-2 text-sm">
                <div className="text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">
                    {format(new Date(period.date), 'PPPP', { locale: getLocaleDateFns() })}
                  </span>
                </div>
                <div className="text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{timeRange}</span>
                </div>
              </div>
            </div>
            <Badge className={`h-fit border ${getCategoryColor(period.category)} font-semibold shadow-sm`}>
              {period.category}
            </Badge>
          </div>
        </CardHeader>
        <Separator className="mb-4" />
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-white/60 p-3 backdrop-blur-sm">
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                {t('schedule.periodDetail.class')}
              </p>
              <p className="mt-1 text-lg font-semibold">{selectedClass?.name}</p>
            </div>
            {period.location && (
              <div className="rounded-lg bg-white/60 p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="text-muted-foreground h-4 w-4" />
                  <div>
                    <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                      {t('schedule.periodDetail.room')}
                    </p>
                    <p className="mt-1 text-lg font-semibold">{period.location}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lessons Cards */}
      {period.lessons.length > 0 ? (
        <div className="space-y-4">
          {period.lessons.map((lesson) => (
            <Card key={lesson.id} className="gap-0 border pt-0 shadow-md">
              <CardHeader className="bg-slate-50 pb-4 pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-1 items-start gap-3">
                    <div className="bg-primary/10 rounded-lg p-2">
                      <FileText className="text-primary h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl">{lesson.title}</CardTitle>
                      <p className="text-muted-foreground mt-2 text-sm">{lesson.description}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/lessons/${lesson.id}`)}
                    className="flex-shrink-0"
                  >
                    {t('schedule.periodDetail.viewFullDetails')}
                  </Button>
                </div>
              </CardHeader>
              <Separator />

              <CardContent className="flex space-x-6 pt-6">
                {/* Objectives Section */}
                <div className="flex-1">
                  <div className="mb-3 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                    <h4 className="text-base font-bold">{t('schedule.periodDetail.learningObjectives')}</h4>
                  </div>
                  <Separator className="mb-4" />
                  {(lesson.objectives || lesson.learningObjectives || []).length > 0 ? (
                    <ul className="space-y-2">
                      {(lesson.objectives || lesson.learningObjectives || []).map((obj) => (
                        <li
                          key={obj.id}
                          className="flex gap-3 rounded-lg bg-amber-50 p-3 transition-colors hover:bg-amber-100"
                        >
                          <span className="flex-shrink-0 rounded-full bg-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-800">
                            ✓
                          </span>
                          <span className="text-sm">{obj.description}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground text-sm italic">No objectives defined</p>
                  )}
                </div>

                {/* Resources Section */}
                <div className="flex-1">
                  <div className="mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <h4 className="text-base font-bold">{t('schedule.lessonDetail.resources')}</h4>
                  </div>
                  <Separator className="mb-4" />
                  {(lesson.resources || []).length > 0 ? (
                    <ul className="space-y-2">
                      {(lesson.resources || []).map((res) => (
                        <li
                          key={res.id}
                          className="flex gap-3 rounded-lg bg-blue-50 p-3 transition-colors hover:bg-blue-100"
                        >
                          <span className="flex-shrink-0 text-blue-500">📎</span>
                          <span className="text-sm font-medium">{res.name}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground text-sm italic">No resources attached</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <CreateLesson period={period} />
      )}
    </div>
  );
};
