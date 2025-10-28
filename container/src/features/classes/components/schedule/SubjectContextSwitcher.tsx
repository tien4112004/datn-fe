import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, User, Clock, Target, FileText, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ClassPeriod, LessonPlan } from '../../types';

interface SubjectContextSwitcherProps {
  classId: string;
  periods: ClassPeriod[];
  lessonPlans: LessonPlan[];
  currentSubject?: string;
  onSubjectChange: (subject: string, subjectCode: string) => void;
  onCreateLessonPlan?: (subject: string, subjectCode: string) => void;
  onManageSchedule?: (subject: string) => void;
}

interface SubjectContext {
  subject: string;
  subjectCode: string;
  totalPeriods: number;
  weeklyPeriods: number;
  nextPeriod?: ClassPeriod;
  recentLessonPlan?: LessonPlan;
  teacher: {
    id: string;
    fullName: string;
  };
  upcomingDeadlines: number;
}

const SubjectContextSwitcher = ({
  classId,
  periods,
  lessonPlans,
  currentSubject,
  onSubjectChange,
  onCreateLessonPlan,
  onManageSchedule,
}: SubjectContextSwitcherProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'schedule.subjectContext' });
  const [selectedSubject, setSelectedSubject] = useState<string>(currentSubject || '');

  // Group periods by subject to create subject contexts
  const subjectContexts = useMemo(() => {
    const subjectMap = new Map<string, SubjectContext>();

    periods.forEach((period) => {
      if (!subjectMap.has(period.subject)) {
        // Calculate weekly periods (assuming current week)
        const weeklyPeriods = periods.filter((p) => p.subject === period.subject && p.isActive).length;

        // Find next period for this subject
        const now = new Date();
        const nextPeriod = periods
          .filter((p) => p.subject === period.subject && p.isActive)
          .find((p) => {
            const periodTime = new Date();
            const [hours, minutes] = p.startTime.split(':').map(Number);
            periodTime.setHours(hours, minutes, 0, 0);
            return periodTime > now;
          });

        // Find recent lesson plan for this subject
        const recentLessonPlan = lessonPlans
          .filter((lp) => lp.subject === period.subject)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];

        // Count upcoming deadlines (lesson plans due soon)
        const upcomingDeadlines = lessonPlans.filter(
          (lp) =>
            lp.subject === period.subject &&
            lp.status === 'planned' &&
            new Date(lp.date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // next 7 days
        ).length;

        subjectMap.set(period.subject, {
          subject: period.subject,
          subjectCode: period.subjectCode,
          totalPeriods: periods.filter((p) => p.subject === period.subject).length,
          weeklyPeriods,
          nextPeriod,
          recentLessonPlan,
          teacher: period.teacher,
          upcomingDeadlines,
        });
      }
    });

    return Array.from(subjectMap.values()).sort((a, b) => a.subject.localeCompare(b.subject));
  }, [periods, lessonPlans]);

  const handleSubjectSelect = (subject: string) => {
    const context = subjectContexts.find((ctx) => ctx.subject === subject);
    if (context) {
      setSelectedSubject(subject);
      onSubjectChange(context.subject, context.subjectCode);
    }
  };

  const selectedContext = subjectContexts.find((ctx) => ctx.subject === selectedSubject);

  const formatNextClass = (period: ClassPeriod) => {
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return `${dayNames[period.dayOfWeek]} ${period.startTime}`;
  };

  return (
    <div className="space-y-4">
      {/* Subject Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <Select value={selectedSubject} onValueChange={handleSubjectSelect}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectSubject')} />
                </SelectTrigger>
                <SelectContent>
                  {subjectContexts.map((context) => (
                    <SelectItem key={context.subject} value={context.subject}>
                      <div className="flex w-full items-center justify-between">
                        <span>{context.subject}</span>
                        <Badge variant="outline" className="ml-2">
                          {context.weeklyPeriods} {t('periodsPerWeek')}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedContext && (
              <div className="flex gap-2">
                {onCreateLessonPlan && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCreateLessonPlan(selectedContext.subject, selectedContext.subjectCode)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {t('actions.createLesson')}
                  </Button>
                )}

                {onManageSchedule && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onManageSchedule(selectedContext.subject)}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    {t('actions.manageSchedule')}
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Subject Context Details */}
      {selectedContext && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{selectedContext.subject}</CardTitle>
              <Badge>{selectedContext.subjectCode}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Teacher Info */}
              <div className="space-y-2">
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <User className="h-4 w-4" />
                  {t('teacher')}
                </div>
                <p className="font-medium">{selectedContext.teacher.fullName}</p>
              </div>

              {/* Schedule Info */}
              <div className="space-y-2">
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  {t('schedule')}
                </div>
                <div>
                  <p className="font-medium">
                    {selectedContext.weeklyPeriods} {t('periodsPerWeek')}
                  </p>
                  {selectedContext.nextPeriod && (
                    <p className="text-muted-foreground text-sm">
                      {t('next')}: {formatNextClass(selectedContext.nextPeriod)}
                    </p>
                  )}
                </div>
              </div>

              {/* Lesson Planning Status */}
              <div className="space-y-2">
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4" />
                  {t('lessonPlanning')}
                </div>
                <div>
                  {selectedContext.recentLessonPlan ? (
                    <div>
                      <p className="font-medium text-green-600">{t('recentPlan')}</p>
                      <p className="text-muted-foreground text-sm">
                        {selectedContext.recentLessonPlan.title}
                      </p>
                    </div>
                  ) : (
                    <p className="font-medium text-orange-600">{t('noRecentPlan')}</p>
                  )}
                </div>
              </div>

              {/* Upcoming Deadlines */}
              <div className="space-y-2">
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4" />
                  {t('upcomingDeadlines')}
                </div>
                <div>
                  {selectedContext.upcomingDeadlines > 0 ? (
                    <Badge variant="destructive">
                      {selectedContext.upcomingDeadlines} {t('deadlines')}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-green-600">
                      {t('allCaught')}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 border-t pt-4">
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline">
                  {t('actions.viewAllLessons')}
                </Button>

                <Button size="sm" variant="outline">
                  {t('actions.viewSchedule')}
                </Button>

                {selectedContext.nextPeriod && <Button size="sm">{t('actions.prepareNext')}</Button>}

                {selectedContext.upcomingDeadlines > 0 && (
                  <Button size="sm" variant="destructive">
                    {t('actions.viewDeadlines')}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subject Overview Grid */}
      {!selectedSubject && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subjectContexts.map((context) => (
            <Card
              key={context.subject}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => handleSubjectSelect(context.subject)}
            >
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{context.subject}</h3>
                    <Badge variant="outline">{context.subjectCode}</Badge>
                  </div>

                  <div className="text-muted-foreground space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {context.teacher.fullName}
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {context.weeklyPeriods} {t('periodsPerWeek')}
                    </div>

                    {context.nextPeriod && (
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        {t('next')}: {formatNextClass(context.nextPeriod)}
                      </div>
                    )}
                  </div>

                  {context.upcomingDeadlines > 0 && (
                    <Badge variant="destructive" className="w-fit">
                      {context.upcomingDeadlines} {t('deadlines')}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubjectContextSwitcher;
