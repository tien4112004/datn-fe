import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  PlayCircle,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Calendar,
  FileText,
  Edit,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/utils';
import type { Lesson, LessonStatus, LearningObjective, LessonResource } from '../../types';
import { getSubjectByCode } from '../../../shared/types';

interface LessonCardProps {
  lesson: Lesson;
  canEdit?: boolean;
  onUpdateStatus: (lessonId: string, status: LessonStatus) => Promise<void>;
  onEditClick: (lesson: Lesson) => void;
}

export const LessonCard = ({ lesson, canEdit = true, onUpdateStatus, onEditClick }: LessonCardProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'lesson.status' });

  const getStatusIcon = (status: LessonStatus) => {
    switch (status) {
      case 'planned':
        return <Clock className="h-4 w-4" />;
      case 'in_progress':
        return <PlayCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: LessonStatus) => {
    switch (status) {
      case 'planned':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: LessonStatus) => {
    switch (status) {
      case 'planned':
        return t('statuses.planned');
      case 'in_progress':
        return t('statuses.inProgress');
      case 'completed':
        return t('statuses.completed');
      case 'cancelled':
        return t('statuses.cancelled');
      default:
        return status;
    }
  };

  const getNextPossibleStatus = (currentStatus: LessonStatus): LessonStatus[] => {
    switch (currentStatus) {
      case 'planned':
        return ['in_progress', 'cancelled'];
      case 'in_progress':
        return ['completed', 'cancelled'];
      case 'completed':
        return ['planned']; // Allow re-planning if needed
      case 'cancelled':
        return ['planned']; // Allow re-planning
      default:
        return ['planned', 'in_progress', 'completed', 'cancelled'];
    }
  };

  const isOverdue = (_lesson: Lesson) => {
    // Since date/endTime fields were removed from Lesson, we can't determine if a lesson is overdue
    return false;
  };

  const overdue = isOverdue(lesson);
  const nextStatuses = getNextPossibleStatus(lesson.status);

  return (
    <div
      className={cn(
        'rounded-lg border p-4 transition-all duration-200',
        lesson.status === 'completed' && 'border-green-200 bg-green-50',
        lesson.status === 'in_progress' && 'border-yellow-200 bg-yellow-50',
        lesson.status === 'cancelled' && 'border-red-200 bg-red-50',
        overdue && 'border-red-500 bg-red-50'
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start">
        {/* Status Icon */}
        <div className="pt-1 md:flex-shrink-0">{getStatusIcon(lesson.status)}</div>

        {/* Content */}
        <div className="flex-1 space-y-2">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <h4 className="font-medium">{lesson.title}</h4>
              <p className="text-muted-foreground text-sm">
                {lesson.subject ? getSubjectByCode(lesson.subject)?.name : ''}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge className={cn('flex items-center gap-1', getStatusColor(lesson.status))}>
                {getStatusIcon(lesson.status)}
                {getStatusLabel(lesson.status)}
              </Badge>
              {overdue && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {t('overdue')}
                </Badge>
              )}
            </div>
          </div>

          {/* Lesson Details */}
          <div className="text-muted-foreground grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>
                {lesson.duration} {t('minutes')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 flex-shrink-0" />
              <span>
                {lesson.objectives.length} {t('objectives')}
              </span>
            </div>
          </div>

          {/* Notes */}
          {lesson.notes && (
            <div className="rounded bg-gray-50 p-2 text-sm">
              <strong>{t('notes')}:</strong> {lesson.notes}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {lesson.objectives.length > 0 && (
                <Badge variant="outline" className="text-xs md:text-sm">
                  {lesson.objectives.filter((obj: LearningObjective) => obj.isAchieved).length}/
                  {lesson.objectives.length} {t('objectivesAchieved')}
                </Badge>
              )}
              {lesson.resources.length > 0 && (
                <Badge variant="outline" className="text-xs md:text-sm">
                  {lesson.resources.filter((res: LessonResource) => res.isPrepared).length}/
                  {lesson.resources.length} {t('resourcesPrepared')}
                </Badge>
              )}
            </div>

            {canEdit && (
              <div className="flex flex-wrap items-center gap-2">
                {/* Quick Status Updates */}
                {nextStatuses.map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant="outline"
                    onClick={() => onUpdateStatus(lesson.id, status)}
                    className="whitespace-nowrap text-xs"
                  >
                    {getStatusIcon(status)}
                    <span className="ml-1 hidden sm:inline">{getStatusLabel(status)}</span>
                  </Button>
                ))}

                <Button size="sm" variant="ghost" onClick={() => onEditClick(lesson)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
