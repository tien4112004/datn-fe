import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, Calendar, BookOpen, Target, Users, Settings } from 'lucide-react';

import { ClassOverview } from './ClassOverview';
import { ClassStudentView } from '../../class-student';
import { ClassSettings } from './ClassSettings';
import TodaysTeachingDashboard from '../../class-dashboard/components/TodaysTeachingDashboard';
import {
  LessonTab,
  useClassLessonPlans,
  useLessonPlanOperations,
  useUpdateLessonPlan,
  useUpdateLessonStatus,
} from '../../class-lesson';
import { useScheduleHelpers } from '../../class-schedule';
import type { Class } from '../../shared/types';
import { ScheduleTab, useClassSchedules, useClassPeriods } from '../../class-schedule';
import type { ClassTabs } from '../../shared';

interface ClassDetailTabsProps {
  classId: string;
  currentClass: Class;
  onEditClick: (classData: Class) => void;
}

export const ClassDetailTabs = ({ classId, currentClass, onEditClick }: ClassDetailTabsProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'detail' });

  // Get today's date
  const today = new Date().toISOString().split('T')[0];

  // ============= MANAGER: Call the Fetcher =============
  // Get raw schedules from the API (fetch just today's schedule)
  const { data: schedulesData } = useClassSchedules(classId, { startDate: today, endDate: today });
  const schedules = schedulesData?.data || [];

  // ============= MANAGER: Use the Toolbox =============
  // Get today's schedule from the raw list
  const { findScheduleForDate } = useScheduleHelpers();

  const todaySchedule = useMemo(() => {
    return findScheduleForDate(schedules, today, classId);
  }, [schedules, today, classId]);

  // Fetch periods and lesson plans
  const { data: periodsData } = useClassPeriods(classId, { date: today });
  const { data: lessonPlansData } = useClassLessonPlans(classId, {});

  const allPeriods = periodsData?.data || [];
  const allLessonPlans = lessonPlansData?.data || [];

  const todayLessonPlans = allLessonPlans.filter((lp) => lp.linkedPeriod?.date === today);

  // Mutation hooks
  const updateLessonStatus = useUpdateLessonStatus();
  const updateLessonPlan = useUpdateLessonPlan();
  const lessonPlanOperations = useLessonPlanOperations();

  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'teaching';

  const handleTabChange = (tab: ClassTabs) => {
    setSearchParams({ tab }, { replace: true });
  };

  return (
    <div className="space-y-6 px-8">
      {/* Detailed Tabs */}
      <Tabs
        defaultValue="teaching"
        className="mx-12 space-y-4"
        value={currentTab}
        onValueChange={(value) => handleTabChange(value as ClassTabs)}
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="teaching" className="flex cursor-pointer items-center gap-1">
            <LayoutDashboard className="h-4 w-4" />
            {t('tabs.teaching')}
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex cursor-pointer items-center gap-1">
            <Calendar className="h-4 w-4" />
            {t('tabs.schedule')}
          </TabsTrigger>
          <TabsTrigger value="lessons" className="flex cursor-pointer items-center gap-1">
            <BookOpen className="h-4 w-4" />
            {t('tabs.lessons')}
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex cursor-pointer items-center gap-1">
            <Target className="h-4 w-4" />
            {t('tabs.overview')}
          </TabsTrigger>
          <TabsTrigger value="students" className="flex cursor-pointer items-center gap-1">
            <Users className="h-4 w-4" />
            {t('tabs.students')}
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex cursor-pointer items-center gap-1">
            <Settings className="h-4 w-4" />
            {t('tabs.settings')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="teaching" className="space-y-4">
          <TodaysTeachingDashboard
            classData={currentClass}
            todaySchedule={todaySchedule}
            allPeriods={allPeriods}
            todayLessonPlans={todayLessonPlans}
            allLessonPlans={allLessonPlans}
            onUpdateLessonStatus={async (id, status, notes) => {
              await updateLessonStatus.mutateAsync({ id, status, notes });
            }}
            onUpdateObjective={async (lessonPlanId, objectiveId, updates) => {
              // Find the lesson plan
              const lessonPlan = todayLessonPlans.find((lp) => lp.id === lessonPlanId);
              if (!lessonPlan) return;

              // Use lesson plan operations to update the objective
              const updatedLessonPlan = lessonPlanOperations.updateObjectiveInLesson(
                lessonPlan,
                objectiveId,
                updates
              );

              // Persist the changes
              await updateLessonPlan.mutateAsync(updatedLessonPlan);
            }}
            onAddObjectiveNote={async (lessonPlanId, objectiveId, note) => {
              // Find the lesson plan
              const lessonPlan = todayLessonPlans.find((lp) => lp.id === lessonPlanId);
              if (!lessonPlan) return;

              // Use lesson plan operations to update the objective
              const updatedLessonPlan = lessonPlanOperations.updateObjectiveInLesson(
                lessonPlan,
                objectiveId,
                { notes: note }
              );

              // Persist the changes
              await updateLessonPlan.mutateAsync(updatedLessonPlan);
            }}
            onAddResource={async (lessonPlanId, resource) => {
              // Find the lesson plan
              const lessonPlan = todayLessonPlans.find((lp) => lp.id === lessonPlanId);
              if (!lessonPlan) return;

              // Use lesson plan operations to add the resource
              const updatedLessonPlan = lessonPlanOperations.addResourceToLesson(lessonPlan, resource);

              // Persist the changes
              await updateLessonPlan.mutateAsync(updatedLessonPlan);
            }}
            onUpdateResource={async (lessonPlanId, resourceId, updates) => {
              // Find the lesson plan
              const lessonPlan = todayLessonPlans.find((lp) => lp.id === lessonPlanId);
              if (!lessonPlan) return;

              // Use lesson plan operations to update the resource
              const updatedLessonPlan = lessonPlanOperations.updateResourceInLesson(
                lessonPlan,
                resourceId,
                updates
              );

              // Persist the changes
              await updateLessonPlan.mutateAsync(updatedLessonPlan);
            }}
            onDeleteResource={async (lessonPlanId, resourceId) => {
              // Find the lesson plan
              const lessonPlan = todayLessonPlans.find((lp) => lp.id === lessonPlanId);
              if (!lessonPlan) return;

              // Use lesson plan operations to remove the resource
              const updatedLessonPlan = lessonPlanOperations.removeResourceFromLesson(lessonPlan, resourceId);

              // Persist the changes
              await updateLessonPlan.mutateAsync(updatedLessonPlan);
            }}
            onSubjectChange={(subject, subjectCode) => {
              // TODO: Implement subject change filtering
              console.log('Subject change:', subject, subjectCode);
            }}
            onCreateLessonPlan={(subject, subjectCode) => {
              // TODO: Open lesson plan creation modal/form
              console.log('Create lesson plan:', subject, subjectCode);
            }}
            onManageSchedule={(subject) => {
              // TODO: Navigate to schedule management
              console.log('Manage schedule:', subject);
            }}
          />
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <ScheduleTab classId={currentClass.id} />
        </TabsContent>

        <TabsContent value="lessons" className="space-y-4">
          <LessonTab classId={classId} currentClass={currentClass} />
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <ClassOverview classData={currentClass} onEditClick={onEditClick} />
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <ClassStudentView classData={currentClass} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <ClassSettings classData={currentClass} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
