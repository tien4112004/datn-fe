import { useParams, useLoaderData } from 'react-router-dom';
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
import { useClass } from '../hooks';
import { useClassStore } from '../stores';
import { getGradeLabel } from '../utils';
import type { Class } from '../types';

interface LoaderData {
  class: Class;
}

const ClassDetailPage = () => {
  const { t } = useTranslation('classes', { keyPrefix: 'detail' });
  const { t: tPage } = useTranslation('page');
  const { id } = useParams<{ id: string }>();
  const loaderData = useLoaderData() as LoaderData;

  // Use React Query for real-time updates, fallback to loader data
  const { data: classData, isLoading } = useClass(id!);
  const currentClass = classData || loaderData.class;

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
                  <CardTitle className="text-sm font-medium">{t('stats.subjectTeachers')}</CardTitle>
                  <Settings className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentClass.subjectTeachers.length}</div>
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
                  todaySchedule={{
                    date: new Date().toISOString().split('T')[0],
                    classId: currentClass.id,
                    periods: [], // TODO: Replace with actual today's periods
                  }}
                  allPeriods={[]} // TODO: Replace with actual periods
                  todayLessonPlans={[]} // TODO: Replace with actual today's lesson plans
                  allLessonPlans={[]} // TODO: Replace with actual lesson plans
                  objectives={[]} // TODO: Replace with actual objectives
                  resources={[]} // TODO: Replace with actual resources
                  onUpdateLessonStatus={async (id, status, notes) => {
                    // TODO: Implement lesson status update
                    console.log('Update lesson status:', id, status, notes);
                  }}
                  onUpdateObjective={async (id, updates) => {
                    // TODO: Implement objective update
                    console.log('Update objective:', id, updates);
                  }}
                  onAddObjectiveNote={async (id, note) => {
                    // TODO: Implement add objective note
                    console.log('Add objective note:', id, note);
                  }}
                  onAddResource={async (resource) => {
                    // TODO: Implement add resource
                    console.log('Add resource:', resource);
                  }}
                  onUpdateResource={async (id, updates) => {
                    // TODO: Implement update resource
                    console.log('Update resource:', id, updates);
                  }}
                  onDeleteResource={async (id) => {
                    // TODO: Implement delete resource
                    console.log('Delete resource:', id);
                  }}
                  onSubjectChange={(subject, subjectCode) => {
                    // TODO: Implement subject change
                    console.log('Subject change:', subject, subjectCode);
                  }}
                  onCreateLessonPlan={(subject, subjectCode) => {
                    // TODO: Implement create lesson plan
                    console.log('Create lesson plan:', subject, subjectCode);
                  }}
                  onManageSchedule={(subject) => {
                    // TODO: Implement manage schedule
                    console.log('Manage schedule:', subject);
                  }}
                />
              </TabsContent>

              <TabsContent value="schedule" className="space-y-4">
                <DailyScheduleView
                  classId={currentClass.id}
                  schedules={[]} // TODO: Replace with actual schedules
                  onAddPeriod={(date) => {
                    // TODO: Implement add period
                    console.log('Add period for date:', date);
                  }}
                  onEditPeriod={(period) => {
                    // TODO: Implement edit period
                    console.log('Edit period:', period);
                  }}
                />
              </TabsContent>

              <TabsContent value="lessons" className="space-y-4">
                <div className="space-y-6">
                  <LessonStatusTracker
                    lessonPlans={[]} // TODO: Replace with actual lesson plans
                    onUpdateStatus={async (id, status, notes) => {
                      // TODO: Implement status update
                      console.log('Update status:', id, status, notes);
                    }}
                    classId={currentClass.id}
                  />

                  <ScheduleLessonLinker
                    classId={currentClass.id}
                    periods={[]} // TODO: Replace with actual periods
                    lessonPlans={[]} // TODO: Replace with actual lesson plans
                    onLinkLesson={async (periodId, lessonPlanId) => {
                      // TODO: Implement link lesson
                      console.log('Link lesson:', periodId, lessonPlanId);
                    }}
                    onUnlinkLesson={async (periodId) => {
                      // TODO: Implement unlink lesson
                      console.log('Unlink lesson:', periodId);
                    }}
                    onCreateLessonForPeriod={(period) => {
                      // TODO: Implement create lesson for period
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
