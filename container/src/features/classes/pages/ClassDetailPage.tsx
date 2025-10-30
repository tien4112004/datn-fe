import { useParams, useLoaderData, useNavigate } from 'react-router-dom';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Users, UserCheck, Settings, LayoutDashboard, Calendar, BookOpen, Target } from 'lucide-react';

import ClassOverview from '../components/detail/ClassOverview';
import ClassStudentList from '../components/detail/ClassStudentList';
import ClassTeacherList from '../components/detail/ClassTeacherList';
import ClassSettings from '../components/detail/ClassSettings';
import TodaysTeachingDashboard from '../components/dashboard/TodaysTeachingDashboard';
import DailyScheduleView from '../components/schedule/DailyScheduleView';
import LessonStatusTracker from '../components/lesson/LessonStatusTracker';
import ScheduleLessonLinker from '../components/integration/ScheduleLessonLinker';
import {
  useClass,
  useClassSchedules,
  useClassPeriods,
  useClassLessonPlans,
  useUpdateLessonStatus,
  useUpdateObjective,
  useAddObjectiveNote,
  useAddResource,
  useUpdateResource,
  useDeleteResource,
  useCreateLessonPlan,
  useAddPeriod,
  useUpdatePeriod,
  useLinkLessonToPeriod,
  useUnlinkLessonFromPeriod,
} from '../hooks';
import { useClassStore } from '../stores';
import { getGradeLabel } from '../utils';
import type { Class } from '../types';

interface LoaderData {
  class: Class;
}

const ClassDetailPage = () => {
  const { t } = useTranslation('classes', { keyPrefix: 'detail' });
  const { t: tPage } = useTranslation('common', { keyPrefix: 'pages' });
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const loaderData = useLoaderData() as LoaderData;

  // Use React Query for real-time updates, fallback to loader data
  const { data: classData, isLoading } = useClass(id!);
  const currentClass = classData || loaderData.class;

  // Fetch schedules, periods, and lesson plans
  const today = new Date().toISOString().split('T')[0];
  const { data: schedulesData } = useClassSchedules(id!, {
    startDate: today,
    endDate: today,
  });
  const { data: periodsData } = useClassPeriods(id!, { date: today });
  const { data: lessonPlansData } = useClassLessonPlans(id!, {});

  const schedules = schedulesData?.data || [];
  const allPeriods = periodsData?.data || [];
  const allLessonPlans = lessonPlansData?.data || [];

  // Get today's specific data
  const todaySchedule = schedules.find((s) => s.date === today) || {
    date: today,
    classId: id!,
    periods: [],
  };
  const todayLessonPlans = allLessonPlans.filter((lp) => lp.date === today);

  // Mutation hooks
  const updateLessonStatus = useUpdateLessonStatus();
  const updateObjective = useUpdateObjective();
  const addObjectiveNote = useAddObjectiveNote();
  const addResource = useAddResource();
  const updateResource = useUpdateResource();
  const deleteResource = useDeleteResource();
  const createLessonPlan = useCreateLessonPlan();
  const addPeriod = useAddPeriod();
  const updatePeriod = useUpdatePeriod();
  const linkLessonToPeriod = useLinkLessonToPeriod();
  const unlinkLessonFromPeriod = useUnlinkLessonFromPeriod();

  const { openEditModal } = useClassStore();

  if (!currentClass && !isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">{t('notFound')}</h2>
          <p className="text-muted-foreground">{t('notFoundDescription')}</p>
        </div>
      </div>
    );
  }

  const handleEditClass = () => {
    if (currentClass) {
      openEditModal(currentClass);
    }
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/classes">{tPage('classes')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{currentClass ? currentClass.name : t('loading')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="space-y-6 px-8 py-6">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
          </div>
        ) : currentClass ? (
          <>
            {/* Class Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">{currentClass.name}</h1>
                  <Badge variant={currentClass.isActive ? 'default' : 'secondary'}>
                    {currentClass.isActive ? t('status.active') : t('status.inactive')}
                  </Badge>
                </div>
                <div className="text-muted-foreground flex items-center gap-4">
                  <span>{getGradeLabel(currentClass.grade)}</span>
                  <span>•</span>
                  <span>
                    {t('academicYear')}: {currentClass.academicYear}
                  </span>
                  {currentClass.classroom && (
                    <>
                      <span>•</span>
                      <span>
                        {t('classroom')}: {currentClass.classroom}
                      </span>
                    </>
                  )}
                </div>
                {currentClass.description && (
                  <p className="text-muted-foreground max-w-2xl">{currentClass.description}</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={() => navigate(`/classes/${id}/calendar`)} variant="outline" size="sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  {t('actions.calendar', 'Calendar')}
                </Button>
                <Button onClick={handleEditClass} variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  {t('actions.edit')}
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('stats.students')}</CardTitle>
                  <Users className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {currentClass.currentEnrollment}/{currentClass.capacity}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {currentClass.capacity - currentClass.currentEnrollment} {t('stats.available')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('stats.homeroomTeacher')}</CardTitle>
                  <UserCheck className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentClass.homeroomTeacher ? '1' : '0'}</div>
                  <p className="text-muted-foreground text-xs">
                    {currentClass.homeroomTeacher
                      ? currentClass.homeroomTeacher.fullName
                      : t('stats.noHomeroomTeacher')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('stats.subjects')}</CardTitle>
                  <Settings className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentClass.subjects.length}</div>
                  <p className="text-muted-foreground text-xs">{t('stats.subjects')}</p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Tabs */}
            <Tabs defaultValue="teaching" className="space-y-4">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="teaching" className="flex items-center gap-1">
                  <LayoutDashboard className="h-4 w-4" />
                  {t('tabs.teaching')}
                </TabsTrigger>
                <TabsTrigger value="schedule" className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {t('tabs.schedule')}
                </TabsTrigger>
                <TabsTrigger value="lessons" className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {t('tabs.lessons')}
                </TabsTrigger>
                <TabsTrigger value="overview" className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  {t('tabs.overview')}
                </TabsTrigger>
                <TabsTrigger value="students" className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {t('tabs.students')}
                </TabsTrigger>
                <TabsTrigger value="teachers" className="flex items-center gap-1">
                  <UserCheck className="h-4 w-4" />
                  {t('tabs.teachers')}
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-1">
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
                  objectives={[]} // TODO: Fetch objectives for all lesson plans
                  resources={[]} // TODO: Fetch resources for all lesson plans
                  onUpdateLessonStatus={async (id, status, notes) => {
                    await updateLessonStatus.mutateAsync({ id, status, notes });
                  }}
                  onUpdateObjective={async (id, updates) => {
                    await updateObjective.mutateAsync({ id, updates });
                  }}
                  onAddObjectiveNote={async (id, note) => {
                    await addObjectiveNote.mutateAsync({ id, note });
                  }}
                  onAddResource={async (resource) => {
                    await addResource.mutateAsync(resource);
                  }}
                  onUpdateResource={async (id, updates) => {
                    await updateResource.mutateAsync({ id, updates });
                  }}
                  onDeleteResource={async (id) => {
                    await deleteResource.mutateAsync(id);
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
                <DailyScheduleView
                  classId={currentClass.id}
                  schedules={schedules}
                  onAddPeriod={async (date) => {
                    // TODO: Open period creation modal/form with pre-filled date
                    console.log('Add period for date:', date);
                  }}
                  onEditPeriod={async (period) => {
                    await updatePeriod.mutateAsync({ id: period.id, updates: period });
                  }}
                />
              </TabsContent>

              <TabsContent value="lessons" className="space-y-4">
                <div className="space-y-6">
                  <LessonStatusTracker
                    lessonPlans={allLessonPlans}
                    onUpdateStatus={async (id, status, notes) => {
                      await updateLessonStatus.mutateAsync({ id, status, notes });
                    }}
                    classId={currentClass.id}
                  />

                  <ScheduleLessonLinker
                    classId={currentClass.id}
                    periods={allPeriods}
                    lessonPlans={allLessonPlans}
                    onLinkLesson={async (periodId, lessonPlanId) => {
                      await linkLessonToPeriod.mutateAsync({ periodId, lessonPlanId });
                    }}
                    onUnlinkLesson={async (periodId) => {
                      await unlinkLessonFromPeriod.mutateAsync(periodId);
                    }}
                    onCreateLessonForPeriod={(period) => {
                      // TODO: Open lesson plan creation modal with period pre-filled
                      console.log('Create lesson for period:', period);
                    }}
                  />
                </div>
              </TabsContent>

              <TabsContent value="overview" className="space-y-4">
                <ClassOverview classData={currentClass} />
              </TabsContent>

              <TabsContent value="students" className="space-y-4">
                <ClassStudentList classData={currentClass} />
              </TabsContent>

              <TabsContent value="teachers" className="space-y-4">
                <ClassTeacherList classData={currentClass} />
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <ClassSettings classData={currentClass} />
              </TabsContent>
            </Tabs>
          </>
        ) : null}
      </div>
    </>
  );
};

export default ClassDetailPage;
