import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, PlayCircle, CheckCircle2, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/utils';
import type { Lesson, LessonStatus } from '../../types';

interface LessonBadgeProps {
  lesson: Lesson;
  variant?: 'compact' | 'detailed';
  showObjectives?: boolean;
  className?: string;
}

export const LessonBadge = ({
  lesson,
  variant = 'compact',
  showObjectives = false,
  className,
}: LessonBadgeProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'lesson' });

  const getStatusIcon = (status: LessonStatus) => {
    switch (status) {
      case 'planned':
        return <Clock className="h-3 w-3" />;
      case 'in_progress':
        return <PlayCircle className="h-3 w-3" />;
      case 'completed':
        return <CheckCircle2 className="h-3 w-3" />;
      case 'cancelled':
        return <XCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: LessonStatus) => {
    switch (status) {
      case 'planned':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: LessonStatus) => {
    switch (status) {
      case 'planned':
        return t('status.statuses.planned');
      case 'in_progress':
        return t('status.statuses.inProgress');
      case 'completed':
        return t('status.statuses.completed');
      case 'cancelled':
        return t('status.statuses.cancelled');
      default:
        return status;
    }
  };

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <BookOpen className="h-4 w-4 flex-shrink-0 text-blue-500" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{lesson.title}</p>
          <Badge
            variant="outline"
            className={cn('flex w-fit items-center gap-1 text-xs', getStatusColor(lesson.status))}
          >
            {getStatusIcon(lesson.status)}
            {getStatusLabel(lesson.status)}
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-start gap-2">
        <BookOpen className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{lesson.title}</p>
          <div className="mt-1 flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn('flex items-center gap-1 text-xs', getStatusColor(lesson.status))}
            >
              {getStatusIcon(lesson.status)}
              {getStatusLabel(lesson.status)}
            </Badge>
            {showObjectives && lesson.objectives.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {lesson.objectives.filter((obj) => obj.isAchieved).length}/{lesson.objectives.length}{' '}
                {t('status.objectives')}
              </Badge>
            )}
          </div>
          {lesson.description && (
            <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">{lesson.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};
