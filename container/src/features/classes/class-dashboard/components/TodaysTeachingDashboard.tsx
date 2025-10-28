import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Target,
  AlertTriangle,
  CheckCircle2,
  Play,
  Settings,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

import { CurrentNextPeriod } from './CurrentNextPeriod';
import { SubjectContextSwitcher } from './SubjectContextSwitcher';

import type {
  Class,
  LessonPlan,
  LearningObjective,
  LessonResource,
  DailySchedule,
  SchedulePeriod,
} from '../../shared/types';
import { getSubjectByCode } from '../../shared/types/constants/subjects';
import { LessonStatusTracker, ObjectiveTracker, ResourceManager } from '../../class-lesson';

interface TodaysTeachingDashboardProps {
  classData: Class;
  todaySchedule: DailySchedule;
  allPeriods: SchedulePeriod[];
  todayLessonPlans: LessonPlan[];
  allLessonPlans: LessonPlan[];
  onUpdateLessonStatus: (lessonPlanId: string, status: any, notes?: string) => Promise<void>;
  onUpdateObjective: (
    lessonPlanId: string,
    objectiveId: string,
    updates: Partial<LearningObjective>
  ) => Promise<void>;
  onAddObjectiveNote: (lessonPlanId: string, objectiveId: string, note: string) => Promise<void>;
  onAddResource: (
    lessonPlanId: string,
    resource: Omit<LessonResource, 'id' | 'lessonPlanId' | 'createdAt'>
  ) => Promise<void>;
  onUpdateResource: (
    lessonPlanId: string,
    resourceId: string,
    updates: Partial<LessonResource>
  ) => Promise<void>;
  onDeleteResource: (lessonPlanId: string, resourceId: string) => Promise<void>;
  onSubjectChange: (subject: string, subjectCode: string) => void;
  onCreateLessonPlan?: (subject: string, subjectCode: string) => void;
  onManageSchedule?: (subject: string) => void;
  currentSubject?: string;
}

interface DashboardStats {
  totalPeriodsToday: number;
  completedPeriodsToday: number;
  currentPeriod?: SchedulePeriod;
  nextPeriod?: SchedulePeriod;
  todayLessonsPlanned: number;
  todayLessonsCompleted: number;
  objectivesAchievedToday: number;
  totalObjectivesToday: number;
  resourcesPreparedToday: number;
  totalResourcesToday: number;
  urgentTasks: number;
}

export const TodaysTeachingDashboard = ({
  classData,
  todaySchedule,
  allPeriods,
  todayLessonPlans,
  allLessonPlans,
  onUpdateLessonStatus,
  onUpdateObjective,
  onAddObjectiveNote,
  onAddResource,
  onUpdateResource,
  onDeleteResource,
  onSubjectChange,
  onCreateLessonPlan,
  onManageSchedule,
  currentSubject,
}: TodaysTeachingDashboardProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'dashboard.today' });
  const [activeTab, setActiveTab] = useState('overview');

  const stats = useMemo((): DashboardStats => {
    const now = new Date();
    const currentTimeStr = now.toTimeString().slice(0, 5);
    const todayPeriods = todaySchedule.periods || [];

    // Current and next periods
    let currentPeriod: SchedulePeriod | undefined;
    let nextPeriod: SchedulePeriod | undefined;

    const sortedPeriods = [...todayPeriods].sort((a, b) =>
      (a.startTime || '').localeCompare(b.startTime || '')
    );

    for (const period of sortedPeriods) {
      if (
        period.startTime &&
        period.endTime &&
        currentTimeStr >= period.startTime &&
        currentTimeStr < period.endTime
      ) {
        currentPeriod = period;
      } else if (period.startTime && currentTimeStr < period.startTime && !nextPeriod) {
        nextPeriod = period;
      }
    }

    // Lesson stats
    const todayLessonsPlanned = todayLessonPlans.length;
    const todayLessonsCompleted = todayLessonPlans.filter((lp) => lp.status === 'completed').length;
    const completedPeriodsToday = todayPeriods.filter((p: SchedulePeriod) => {
      const linkedLesson = todayLessonPlans.find((lp) => lp.id === p.lessonPlanId);
      return linkedLesson?.status === 'completed';
    }).length;

    // Objectives stats (for today's lessons)
    const todayObjectives = todayLessonPlans.flatMap((lp) => lp.objectives || []);
    const objectivesAchievedToday = todayObjectives.filter((obj) => obj.isAchieved).length;

    // Resources stats (for today's lessons)
    const todayResources = todayLessonPlans.flatMap((lp) => lp.resources || []);
    const resourcesPreparedToday = todayResources.filter((res) => res.isPrepared).length;

    // Urgent tasks
    let urgentTasks = 0;
    // Unprepared resources for upcoming lessons
    urgentTasks += todayResources.filter((res) => res.isRequired && !res.isPrepared).length;
    // Unplanned periods (periods without lesson plans)
    urgentTasks += todayPeriods.filter((p: SchedulePeriod) => !p.lessonPlanId).length;
    // Note: Overdue lessons calculation removed since date/endTime fields were removed from LessonPlan

    return {
      totalPeriodsToday: todayPeriods.length,
      completedPeriodsToday,
      currentPeriod,
      nextPeriod,
      todayLessonsPlanned,
      todayLessonsCompleted,
      objectivesAchievedToday,
      totalObjectivesToday: todayObjectives.length,
      resourcesPreparedToday,
      totalResourcesToday: todayResources.length,
      urgentTasks,
    };
  }, [todaySchedule, todayLessonPlans]);

  const currentLessonPlan = useMemo(() => {
    if (!stats.currentPeriod?.lessonPlanId) return undefined;
    return todayLessonPlans.find((lp) => lp.id === stats.currentPeriod?.lessonPlanId);
  }, [stats.currentPeriod, todayLessonPlans]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="h-6 w-6" />
                {t('title')} - {classData.name}
              </CardTitle>
              <p className="text-muted-foreground mt-1">{format(new Date(), 'PPPP', { locale: vi })}</p>
            </div>

            {stats.urgentTasks > 0 && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                {stats.urgentTasks} {t('urgentTasks')}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalPeriodsToday}</div>
              <p className="text-muted-foreground text-xs">{t('stats.periodsToday')}</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.todayLessonsCompleted}/{stats.todayLessonsPlanned}
              </div>
              <p className="text-muted-foreground text-xs">{t('stats.lessonsCompleted')}</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.objectivesAchievedToday}/{stats.totalObjectivesToday}
              </div>
              <p className="text-muted-foreground text-xs">{t('stats.objectivesAchieved')}</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stats.resourcesPreparedToday}/{stats.totalResourcesToday}
              </div>
              <p className="text-muted-foreground text-xs">{t('stats.resourcesPrepared')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            {t('tabs.overview')}
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {t('tabs.schedule')}
          </TabsTrigger>
          <TabsTrigger value="lessons" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            {t('tabs.lessons')}
          </TabsTrigger>
          <TabsTrigger value="objectives" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            {t('tabs.objectives')}
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {t('tabs.resources')}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Current/Next Class */}
          <CurrentNextPeriod periods={todaySchedule.periods || []} />

          {/* Subject Context Switching */}
          <SubjectContextSwitcher
            periods={allPeriods}
            lessonPlans={allLessonPlans}
            currentSubject={currentSubject}
            onSubjectChange={onSubjectChange}
            onCreateLessonPlan={onCreateLessonPlan}
            onManageSchedule={onManageSchedule}
          />

          {/* Today's Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t('quickActions')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {stats.currentPeriod && (
                  <Button className="flex h-20 flex-col gap-2">
                    <Play className="h-6 w-6" />
                    {t('actions.startCurrentLesson')}
                  </Button>
                )}

                {stats.nextPeriod && (
                  <Button variant="outline" className="flex h-20 flex-col gap-2">
                    <BookOpen className="h-6 w-6" />
                    {t('actions.prepareNextLesson')}
                  </Button>
                )}

                <Button variant="outline" className="flex h-20 flex-col gap-2">
                  <Target className="h-6 w-6" />
                  {t('actions.reviewObjectives')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <CurrentNextPeriod periods={todaySchedule.periods || []} />

          <SubjectContextSwitcher
            periods={allPeriods}
            lessonPlans={allLessonPlans}
            currentSubject={currentSubject}
            onSubjectChange={onSubjectChange}
            onCreateLessonPlan={onCreateLessonPlan}
            onManageSchedule={onManageSchedule}
          />
        </TabsContent>

        {/* Lessons Tab */}
        <TabsContent value="lessons" className="space-y-6">
          <LessonStatusTracker lessonPlans={todayLessonPlans} onUpdateStatus={onUpdateLessonStatus} />
        </TabsContent>

        {/* Objectives Tab */}
        <TabsContent value="objectives" className="space-y-6">
          {currentLessonPlan ? (
            <ObjectiveTracker
              lessonPlan={currentLessonPlan}
              objectives={currentLessonPlan.objectives || []}
              onUpdateObjective={onUpdateObjective}
              onAddNote={onAddObjectiveNote}
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-muted-foreground py-8 text-center">
                  <Target className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p>{t('noCurrentLesson')}</p>
                  <p className="text-sm">{t('selectLessonToViewObjectives')}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Today's Objectives Summary */}
          {todayLessonPlans.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('todayObjectivesSummary')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todayLessonPlans.map((lesson) => {
                    const lessonObjectives = lesson.objectives || [];
                    const achievedCount = lessonObjectives.filter((obj) => obj.isAchieved).length;

                    return (
                      <div key={lesson.id} className="flex items-center justify-between rounded border p-3">
                        <div>
                          <h4 className="font-medium">{lesson.title}</h4>
                          <p className="text-muted-foreground text-sm">
                            {lesson.subject ? getSubjectByCode(lesson.subject)?.name : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {achievedCount}/{lessonObjectives.length} {t('achieved')}
                          </Badge>
                          {achievedCount === lessonObjectives.length && lessonObjectives.length > 0 && (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          {currentLessonPlan ? (
            <ResourceManager
              lessonPlan={currentLessonPlan}
              resources={currentLessonPlan.resources || []}
              onAddResource={onAddResource}
              onUpdateResource={onUpdateResource}
              onDeleteResource={onDeleteResource}
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-muted-foreground py-8 text-center">
                  <Settings className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p>{t('noCurrentLesson')}</p>
                  <p className="text-sm">{t('selectLessonToViewResources')}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Today's Resources Summary */}
          {todayLessonPlans.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('todayResourcesSummary')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todayLessonPlans.map((lesson) => {
                    const lessonResources = lesson.resources || [];
                    const preparedCount = lessonResources.filter((res) => res.isPrepared).length;
                    const requiredCount = lessonResources.filter((res) => res.isRequired).length;

                    return (
                      <div key={lesson.id} className="flex items-center justify-between rounded border p-3">
                        <div>
                          <h4 className="font-medium">{lesson.title}</h4>
                          <p className="text-muted-foreground text-sm">
                            {lesson.subject ? getSubjectByCode(lesson.subject)?.name : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {preparedCount}/{lessonResources.length} {t('prepared')}
                          </Badge>
                          {requiredCount > 0 && (
                            <Badge variant="outline" className="text-orange-600">
                              {requiredCount} {t('required')}
                            </Badge>
                          )}
                          {preparedCount === lessonResources.length && lessonResources.length > 0 && (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TodaysTeachingDashboard;
