import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import {
  PlayCircle,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  AlertTriangle,
  Calendar,
  User,
  FileText,
  Edit,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/utils';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { LessonPlan, LessonStatus } from '../../types';

interface LessonStatusTrackerProps {
  lessonPlans: LessonPlan[];
  onUpdateStatus: (lessonPlanId: string, status: LessonStatus, notes?: string) => Promise<void>;
  canEdit?: boolean;
  classId: string;
}

interface StatusStats {
  total: number;
  planned: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  completionRate: number;
}

const LessonStatusTracker = ({
  lessonPlans,
  onUpdateStatus,
  canEdit = true,
  classId,
}: LessonStatusTrackerProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'lessonPlan.status' });
  const [selectedLesson, setSelectedLesson] = useState<LessonPlan | null>(null);
  const [newStatus, setNewStatus] = useState<LessonStatus>('planned');
  const [statusNotes, setStatusNotes] = useState('');
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

  const stats = useMemo((): StatusStats => {
    const total = lessonPlans.length;
    const planned = lessonPlans.filter((lp) => lp.status === 'planned').length;
    const inProgress = lessonPlans.filter((lp) => lp.status === 'in_progress').length;
    const completed = lessonPlans.filter((lp) => lp.status === 'completed').length;
    const cancelled = lessonPlans.filter((lp) => lp.status === 'cancelled').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, planned, inProgress, completed, cancelled, completionRate };
  }, [lessonPlans]);

  const sortedLessons = useMemo(() => {
    return [...lessonPlans].sort((a, b) => {
      // Sort by date first
      const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateComparison !== 0) return dateComparison;

      // Then by start time
      return a.startTime.localeCompare(b.startTime);
    });
  }, [lessonPlans]);

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

  const handleStatusUpdate = async () => {
    if (!selectedLesson) return;

    try {
      await onUpdateStatus(selectedLesson.id, newStatus, statusNotes);
      setIsUpdateDialogOpen(false);
      setSelectedLesson(null);
      setStatusNotes('');
    } catch (error) {
      console.error('Failed to update lesson status:', error);
    }
  };

  const openUpdateDialog = (lesson: LessonPlan) => {
    setSelectedLesson(lesson);
    setNewStatus(lesson.status);
    setStatusNotes(lesson.notes || '');
    setIsUpdateDialogOpen(true);
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

  const isOverdue = (lesson: LessonPlan) => {
    const now = new Date();
    const lessonDateTime = new Date(`${lesson.date}T${lesson.endTime}`);
    return lessonDateTime < now && lesson.status === 'planned';
  };

  const statusOptions = [
    { value: 'planned', label: t('statuses.planned') },
    { value: 'in_progress', label: t('statuses.inProgress') },
    { value: 'completed', label: t('statuses.completed') },
    { value: 'cancelled', label: t('statuses.cancelled') },
  ];

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Completion Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('completionRate')}</span>
                <span className="text-muted-foreground text-sm">
                  {stats.completed}/{stats.total} {t('completed')}
                </span>
              </div>
              <Progress value={stats.completionRate} className="h-3" />
            </div>

            {/* Status Distribution */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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

      {/* Lesson List with Status */}
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
            <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
              {sortedLessons.map((lesson) => {
                const overdue = isOverdue(lesson);
                const nextStatuses = getNextPossibleStatus(lesson.status);

                return (
                  <div
                    key={lesson.id}
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
                              {lesson.subject} • {format(new Date(lesson.date), 'PPPP', { locale: vi })}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              {lesson.startTime} - {lesson.endTime}
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
                        <div className="text-muted-foreground grid grid-cols-1 gap-2 text-sm md:grid-cols-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{lesson.teacher.fullName}</span>
                          </div>
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
                                {lesson.objectives.filter((obj) => obj.isAchieved).length}/
                                {lesson.objectives.length} {t('objectivesAchieved')}
                              </Badge>
                            )}
                            {lesson.resources.length > 0 && (
                              <Badge variant="outline" className="text-xs md:text-sm">
                                {lesson.resources.filter((res) => res.isPrepared).length}/
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

                              <Button size="sm" variant="ghost" onClick={() => openUpdateDialog(lesson)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Update Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('updateStatus')} - {selectedLesson?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('newStatus')}</label>
              <Select value={newStatus} onValueChange={(value) => setNewStatus(value as LessonStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(status.value as LessonStatus)}
                        {status.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('notes')}</label>
              <Textarea
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder={t('addStatusNotes')}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                {t('cancel')}
              </Button>
              <Button onClick={handleStatusUpdate}>{t('updateStatus')}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Status Timeline for Current Week */}
      <Card>
        <CardHeader>
          <CardTitle>{t('weeklyOverview')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sortedLessons
              .filter((lesson) => {
                const lessonDate = new Date(lesson.date);
                const now = new Date();
                const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                return lessonDate >= weekStart && lessonDate <= weekEnd;
              })
              .map((lesson) => (
                <div key={lesson.id} className="flex items-center gap-3 rounded border p-2">
                  <div className="text-muted-foreground w-20 text-xs">
                    {format(new Date(lesson.date), 'EEE d/M', { locale: vi })}
                  </div>
                  <div className="flex-1 text-sm">{lesson.title}</div>
                  <Badge className={cn('text-xs', getStatusColor(lesson.status))}>
                    {getStatusLabel(lesson.status)}
                  </Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LessonStatusTracker;
