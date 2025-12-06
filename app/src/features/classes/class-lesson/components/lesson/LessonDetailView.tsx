import { useState } from 'react';
import type { Lesson } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ColoredCard,
  ColoredCardHeader,
  ColoredCardTitle,
  ColoredCardContent,
} from '@/shared/components/common/ColoredCard';
import {
  Clock,
  BookOpen,
  Calendar,
  Target,
  FileText,
  CheckCircle2,
  Circle,
  PlayCircle,
  XCircle,
  Presentation,
  Brain,
  Video,
  Music,
  Image,
  PenTool,
  Wrench,
  Paperclip,
  Link,
  Edit,
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';
import { getLocaleDateFns } from '@/shared/i18n/helper';
import { formatTimeRange } from '../../../class-schedule/utils/calendarHelpers';
import { LessonCreator } from '../form/LessonCreator';
import { useUpdateLesson } from '../../hooks';
import { getSubjectByCode } from '../../../shared/types';

interface LessonDetailViewProps {
  lesson: Lesson;
}

export const LessonDetailView = ({ lesson }: LessonDetailViewProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation('classes', { keyPrefix: 'schedule.lessonDetail' });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const updateLesson = useUpdateLesson();

  const formattedDate =
    lesson.linkedPeriods.length > 0
      ? format(new Date(lesson.linkedPeriods[0].date), 'PPPP', { locale: getLocaleDateFns() })
      : format(new Date(lesson.createdAt), 'PPPP', { locale: getLocaleDateFns() });

  const timeRange =
    lesson.linkedPeriods.length > 0 && lesson.linkedPeriods[0].startTime && lesson.linkedPeriods[0].endTime
      ? formatTimeRange(lesson.linkedPeriods[0].startTime, lesson.linkedPeriods[0].endTime)
      : `${lesson.duration} minutes`;

  const getStatusIcon = (status: string) => {
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

  const getStatusColor = (status: string) => {
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

  const getObjectiveTypeColor = (type: string) => {
    switch (type) {
      case 'knowledge':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'skill':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'attitude':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'competency':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case 'presentation':
        return <Presentation className="h-5 w-5 text-blue-500" />;
      case 'mindmap':
        return <Brain className="h-5 w-5 text-purple-500" />;
      case 'document':
        return <FileText className="h-5 w-5 text-gray-500" />;
      case 'video':
        return <Video className="h-5 w-5 text-red-500" />;
      case 'audio':
        return <Music className="h-5 w-5 text-green-500" />;
      case 'image':
        return <Image className="h-5 w-5 text-orange-500" />;
      case 'worksheet':
        return <PenTool className="h-5 w-5 text-indigo-500" />;
      case 'equipment':
        return <Wrench className="h-5 w-5 text-yellow-500" />;
      default:
        return <Paperclip className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header Card */}
        <Card className="border-none bg-gradient-to-br from-blue-50 to-indigo-100 shadow-lg">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                  <div className="bg-primary/10 rounded-lg p-2">
                    <BookOpen className="text-primary h-5 w-5" />
                  </div>
                  {lesson.title}
                </CardTitle>
                <div className="mt-3 flex flex-col gap-2 text-sm">
                  <div className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">{formattedDate}</span>
                  </div>
                  <div className="text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {lesson.linkedPeriods.length > 0 &&
                      lesson.linkedPeriods[0].startTime &&
                      lesson.linkedPeriods[0].endTime
                        ? `${timeRange} (${lesson.duration} minutes)`
                        : `${lesson.duration} minutes`}
                    </span>
                  </div>
                </div>
              </div>
              <Badge className={`h-fit border ${getStatusColor(lesson.status)} font-semibold shadow-sm`}>
                {getStatusIcon(lesson.status)}
                <span className="ml-1 capitalize">{lesson.status.replace('_', ' ')}</span>
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                {t('edit')}
              </Button>
            </div>
          </CardHeader>
          <Separator />
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-white/60 p-3 backdrop-blur-sm">
                <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                  {t('class')}
                </p>
                <p className="mt-1 text-lg font-semibold">{lesson.className}</p>
              </div>
              <div className="rounded-lg bg-white/60 p-3 backdrop-blur-sm">
                <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                  {t('subject')}
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {lesson.subject ? getSubjectByCode(lesson.subject)?.name || lesson.subject : 'N/A'}
                </p>
              </div>
            </div>
            {lesson.description && (
              <div className="mt-4 rounded-lg bg-white/60 p-3 backdrop-blur-sm">
                <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                  {t('description')}
                </p>
                <p className="mt-1 text-sm">{lesson.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Binded Periods Information */}
        {lesson.linkedPeriods.length > 0 && (
          <div className="space-y-4">
            {lesson.linkedPeriods.map((period) => (
              <ColoredCard key={period.id} colorScheme="purple">
                <ColoredCardHeader>
                  <ColoredCardTitle>
                    <Link className="mr-2 h-5 w-5 text-purple-600" />
                    <span>{t('scheduleBinding')}</span>
                  </ColoredCardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/periods/${period.id}`)}
                    className="flex-shrink-0"
                  >
                    {t('viewPeriodDetails')}
                  </Button>
                </ColoredCardHeader>
                <ColoredCardContent>
                  <div className="rounded-lg bg-purple-50 p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 rounded-lg bg-purple-100 p-3">
                        <Calendar className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-purple-900">{period.name}</h4>
                          <Badge className="border-purple-300 bg-purple-200 text-purple-800">
                            {period.category}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                          <div>
                            <p className="font-medium text-purple-700">{t('date')}</p>
                            <p className="text-purple-600">
                              {format(new Date(period.date), 'PPPP', { locale: getLocaleDateFns() })}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-purple-700">{t('time')}</p>
                            <p className="text-purple-600">
                              {period.startTime && period.endTime
                                ? formatTimeRange(period.startTime, period.endTime)
                                : t('notSpecified')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </ColoredCardContent>
              </ColoredCard>
            ))}
          </div>
        )}

        {/* Learning Objectives Card */}
        <div className="flex gap-6">
          <ColoredCard colorScheme="blue" className="flex-1">
            <ColoredCardHeader>
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <Target className="text-primary h-5 w-5" />
                </div>
                <div className="flex-1">
                  <ColoredCardTitle>{t('learningObjectives')}</ColoredCardTitle>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {lesson.objectives.filter((obj) => obj.isAchieved).length} {t('of')}{' '}
                    {lesson.objectives.length} {t('completed')}
                  </p>
                </div>
              </div>
            </ColoredCardHeader>
            <ColoredCardContent>
              {lesson.objectives.length > 0 ? (
                <div className="space-y-3">
                  {lesson.objectives.map((objective) => (
                    <div
                      key={objective.id}
                      className="flex gap-3 rounded-lg bg-slate-50 p-4 transition-colors hover:bg-slate-100"
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {objective.isAchieved ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <Badge className={`text-xs ${getObjectiveTypeColor(objective.type)}`}>
                            {objective.type}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium">{objective.description}</p>
                        {objective.notes && (
                          <p className="text-muted-foreground mt-1 text-xs">{objective.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm italic">{t('noObjectives')}</p>
              )}
            </ColoredCardContent>
          </ColoredCard>

          {/* Resources Card */}
          <ColoredCard colorScheme="green" className="flex-1">
            <ColoredCardHeader>
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <FileText className="text-primary h-5 w-5" />
                </div>
                <div className="flex-1">
                  <ColoredCardTitle>{t('resources')}</ColoredCardTitle>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {lesson.resources.filter((res) => res.isPrepared).length} {t('of')}{' '}
                    {lesson.resources.length} {t('prepared')}
                  </p>
                </div>
              </div>
            </ColoredCardHeader>
            <ColoredCardContent>
              {lesson.resources.length > 0 ? (
                <div className="space-y-3">
                  {lesson.resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="flex gap-3 rounded-lg bg-slate-50 p-4 transition-colors hover:bg-slate-100"
                    >
                      <div className="flex-shrink-0">{getResourceTypeIcon(resource.type)}</div>
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <p className="text-sm font-medium">{resource.name}</p>
                          {resource.isRequired && (
                            <Badge variant="destructive" className="text-xs">
                              {t('required')}
                            </Badge>
                          )}
                          {resource.isPrepared ? (
                            <Badge className="border-green-200 bg-green-100 text-xs text-green-800">
                              {t('prepared')}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              {t('notPrepared')}
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-xs capitalize">{resource.type}</p>
                        {resource.description && (
                          <p className="text-muted-foreground mt-1 text-xs">{resource.description}</p>
                        )}
                        {resource.url && (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary mt-1 inline-block text-xs hover:underline"
                          >
                            {t('viewResource')}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm italic">{t('noResources')}</p>
              )}
            </ColoredCardContent>
          </ColoredCard>
        </div>

        {/* Additional Information Card */}
        {lesson.notes && (
          <ColoredCard colorScheme="amber">
            <ColoredCardHeader>
              <ColoredCardTitle>{t('additionalInformation')}</ColoredCardTitle>
            </ColoredCardHeader>
            <ColoredCardContent>
              {lesson.notes && (
                <div className="rounded-lg bg-amber-50 p-3">
                  <p className="text-sm font-medium text-amber-800">{t('notes')}</p>
                  <p className="whitespace-pre-wrap text-sm text-amber-700">{lesson.notes}</p>
                </div>
              )}
            </ColoredCardContent>
          </ColoredCard>
        )}
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-h-[90vh] !max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('editLesson')}</DialogTitle>
          </DialogHeader>
          <LessonCreator
            classId={lesson.classId}
            lessonId={lesson.id}
            existingData={lesson}
            operation="update"
            onSave={() => Promise.resolve()} // Not used in update mode
            onUpdate={async (lessonData) => {
              await updateLesson.mutateAsync(lessonData);
              setIsEditModalOpen(false);
            }}
            onCancel={() => setIsEditModalOpen(false)}
            isLoading={updateLesson.isPending}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
