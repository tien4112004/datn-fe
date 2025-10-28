import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { LessonPlanCreator } from './components';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useClass } from '../shared/hooks';
import { useCreateLessonPlan } from './hooks';
import { usePeriod } from '../class-schedule';

export const LessonCreatorPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation('classes');
  const periodId = searchParams.get('periodId');

  if (!periodId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">{t('errors.invalidAccess')}</h2>
          <p className="text-muted-foreground">{t('errors.lessonPlansRequirePeriod')}</p>
          <Button onClick={() => navigate('/classes')} className="mt-4">
            {t('navigation.goToClasses')}
          </Button>
        </div>
      </div>
    );
  }

  const { data: period, isLoading: periodLoading, isError: periodError } = usePeriod(periodId);
  const { data: classData } = useClass(period?.classId || '');
  const createLessonPlanMutation = useCreateLessonPlan();

  const handleGoBack = () => {
    if (periodId) {
      navigate(`/periods/${periodId}`);
    } else {
      navigate('/classes');
    }
  };

  const handleSaveLessonPlan = async (lessonPlanData: any) => {
    try {
      await createLessonPlanMutation.mutateAsync(lessonPlanData);
      // Navigate back to the period after successful creation
      if (periodId) {
        navigate(`/periods/${periodId}`);
      } else {
        navigate('/classes');
      }
    } catch (error) {
      console.error('Failed to create lesson plan:', error);
      // Error handling could be improved here
    }
  };

  if (periodLoading) {
    return (
      <div className="p-8">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="mt-6 h-64 w-full" />
      </div>
    );
  }

  if (periodError || !period) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">{t('errors.general')}</h2>
          <p className="text-muted-foreground">{t('errors.failedToLoadPeriodDetails')}</p>
          <Button onClick={handleGoBack} className="mt-4">
            {t('navigation.goBack')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Breadcrumb Navigation */}
      {period && classData && (
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/classes">{t('navigation.classes', 'Classes')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/classes/${period.classId}`}>{classData.name}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/periods/${period.id}`}>{period.name}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Create Lesson Plan</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )}

      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={handleGoBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('navigation.backToPeriod')}
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{t('schedule.createLessonPlan.title')}</h1>
          <p className="text-muted-foreground">
            {t('schedule.createLessonPlan.subtitle', {
              periodName: period.name,
              periodDate: period.date,
            })}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl">
        <LessonPlanCreator
          classId={period.classId}
          period={period}
          onSave={handleSaveLessonPlan}
          onCancel={handleGoBack}
          isLoading={createLessonPlanMutation.isPending}
        />
      </div>
    </div>
  );
};
