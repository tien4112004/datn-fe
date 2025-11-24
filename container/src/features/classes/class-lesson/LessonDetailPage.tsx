import { useParams } from 'react-router-dom';
import { useLesson } from './hooks/useApi';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useClass } from '../shared/hooks/useApi';
import { useTranslation } from 'react-i18next';
import { LessonDetailView } from './components';

export const LessonDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation('classes');
  const { data: lesson, isLoading, isError } = useLesson(id!);
  const { data: classData } = useClass(lesson?.classId || '');

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">{t('errors.general')}</h2>
          <p className="text-muted-foreground">{t('errors.failedToLoadLessonDetails')}</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">{t('errors.lessonNotFound')}</h2>
          <p className="text-muted-foreground">{t('errors.lessonNotFoundDescription')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Breadcrumb Navigation */}
      {lesson && classData && (
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/classes">{t('navigation.classes')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/classes/${lesson.classId}`}>{classData.name}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{lesson.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )}
      <div className="mx-12">
        <LessonDetailView lesson={lesson} />
      </div>
    </div>
  );
};
