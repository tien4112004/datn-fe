import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Lesson, LessonStatus } from '../../types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LessonCard } from '../lesson/LessonCard';
import { LessonStatusUpdateDialog } from '../form/LessonStatusUpdateDialog';

interface LessonStatusTrackerProps {
  lessons: Lesson[];
  onUpdateStatus: (lessonId: string, status: LessonStatus, notes?: string) => Promise<void>;
  canEdit?: boolean;
}

interface StatusStats {
  total: number;
  planned: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  completionRate: number;
}

export const LessonStatusTracker = ({
  lessons,
  onUpdateStatus,
  canEdit = true,
}: LessonStatusTrackerProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'lesson.status' });
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

  const stats = useMemo((): StatusStats => {
    const total = lessons.length;
    const planned = lessons.filter((lp) => lp.status === 'planned').length;
    const inProgress = lessons.filter((lp) => lp.status === 'in_progress').length;
    const completed = lessons.filter((lp) => lp.status === 'completed').length;
    const cancelled = lessons.filter((lp) => lp.status === 'cancelled').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, planned, inProgress, completed, cancelled, completionRate };
  }, [lessons]);

  const sortedLessons = useMemo(() => {
    return [...lessons].sort((a, b) => {
      // Sort by title since date/startTime fields were removed
      return a.title.localeCompare(b.title);
    });
  }, [lessons]);

  const openUpdateDialog = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setIsUpdateDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-6">
        {/* Lesson List with Status */}
        <ScrollArea className="h-[400px] w-full rounded-xl border">
          <Card>
            <CardHeader>
              <CardTitle>{t('lessonList')}</CardTitle>
            </CardHeader>
            <CardContent>
              {sortedLessons.length === 0 ? (
                <div className="text-muted-foreground py-8 text-center">
                  <BookOpen className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p>{t('noLessons')}</p>
                </div>
              ) : (
                <div className="grid w-full grid-cols-1 gap-4 2xl:grid-cols-2">
                  {sortedLessons.map((lesson) => (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      canEdit={canEdit}
                      onUpdateStatus={onUpdateStatus}
                      onEditClick={openUpdateDialog}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </ScrollArea>

        {/* Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {t('title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 whitespace-nowrap">
              {/* Completion Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{t('completionRate')}</span>
                  <span className="text-muted-foreground text-sm">
                    {stats.completed}/{stats.total} {t('completed')}
                  </span>
                </div>
                <Progress value={stats.completionRate} className="h-3" />
              </div>

              {/* Status Distribution */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.planned}</div>
                  <p className="text-muted-foreground text-xs">{t('statuses.planned')}</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
                  <p className="text-muted-foreground text-xs">{t('statuses.inProgress')}</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                  <p className="text-muted-foreground text-xs">{t('statuses.completed')}</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
                  <p className="text-muted-foreground text-xs">{t('statuses.cancelled')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Update Dialog */}
      <LessonStatusUpdateDialog
        selectedLesson={selectedLesson}
        isOpen={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
        onUpdateStatus={onUpdateStatus}
      />
    </div>
  );
};
