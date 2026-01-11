import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link, Unlink, Clock, CheckCircle2, AlertCircle, MapPin, FileText, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/utils';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { SchedulePeriod, Lesson } from '../../../shared/types';
import { getSubjectByCode } from '@aiprimary/core';

interface ScheduleLessonLinkerProps {
  classId: string;
  periods: SchedulePeriod[];
  lessons: Lesson[];
  onLinkLesson: (periodId: string, lessonId: string) => Promise<void>;
  onUnlinkLesson: (periodId: string, lessonId: string) => Promise<void>;
  onCreateLessonForPeriod: (period: SchedulePeriod) => void;
  canEdit?: boolean;
}

interface LinkingStats {
  totalPeriods: number;
  linkedPeriods: number;
  unlinkedPeriods: number;
  totalLessons: number;
  linkedLessons: number;
  unlinkedLessons: number;
  linkingRate: number;
}

export const ScheduleLessonLinker = ({
  periods,
  lessons,
  onLinkLesson,
  onUnlinkLesson,
  onCreateLessonForPeriod,
  canEdit = true,
}: ScheduleLessonLinkerProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'integration.scheduleLesson' });
  const [selectedPeriod, setSelectedPeriod] = useState<SchedulePeriod | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isLinking, setIsLinking] = useState(false);

  const stats = useMemo((): LinkingStats => {
    const totalPeriods = periods.length;
    const linkedPeriods = periods.filter((p) => p.lessons.length > 0).length;
    const unlinkedPeriods = totalPeriods - linkedPeriods;

    const totalLessons = lessons.length;
    const linkedLessons = lessons.filter((lp) =>
      periods.some((p) => p.lessons.some((l) => l.id === lp.id))
    ).length;
    const unlinkedLessons = totalLessons - linkedLessons;

    const linkingRate = totalPeriods > 0 ? Math.round((linkedPeriods / totalPeriods) * 100) : 0;

    return {
      totalPeriods,
      linkedPeriods,
      unlinkedPeriods,
      totalLessons,
      linkedLessons,
      unlinkedLessons,
      linkingRate,
    };
  }, [periods, lessons]);

  const sortedPeriods = useMemo(() => {
    return [...periods].sort((a, b) => {
      // Sort by date only
      return a.date.localeCompare(b.date);
    });
  }, [periods]);

  const availableLessons = useMemo(() => {
    if (!selectedPeriod) return [];

    return lessons.filter((lesson) => {
      // Check if lesson is already linked to another period
      const isLinkedToOtherPeriod = periods.some(
        (p) => p.lessons.some((l) => l.id === lesson.id) && p.id !== selectedPeriod.id
      );

      // Check if lesson matches the period's subject
      const matchesSubject = lesson.subject === selectedPeriod.subject;

      return !isLinkedToOtherPeriod && matchesSubject;
    });
  }, [selectedPeriod, lessons, periods]);

  const getLinkedLesson = (period: SchedulePeriod): Lesson | undefined => {
    return period.lessons[0];
  };

  const handleLinkLesson = async () => {
    if (!selectedPeriod || !selectedLessonId) return;

    setIsLinking(true);
    try {
      await onLinkLesson(selectedPeriod.id, selectedLessonId);
      setIsLinkDialogOpen(false);
      setSelectedPeriod(null);
      setSelectedLessonId('');
    } catch (error) {
      console.error('Failed to link lesson:', error);
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlinkLesson = async (period: SchedulePeriod) => {
    try {
      // Unlink all lessons from this period
      for (const lesson of period.lessons) {
        await onUnlinkLesson(period.id, lesson.id);
      }
    } catch (error) {
      console.error('Failed to unlink lesson:', error);
    }
  };

  const openLinkDialog = (period: SchedulePeriod) => {
    setSelectedPeriod(period);
    setSelectedLessonId('');
    setIsLinkDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Linking Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Linking Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('linkingProgress')}</span>
                <span className="text-muted-foreground text-sm">
                  {stats.linkedPeriods}/{stats.totalPeriods} {t('periodsLinked')}
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-gray-200">
                <div
                  className="h-3 rounded-full bg-green-600 transition-all duration-300"
                  style={{ width: `${stats.linkingRate}%` }}
                />
              </div>
              <div className="text-center">
                <span className="text-2xl font-bold">{stats.linkingRate}%</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalPeriods}</div>
                <p className="text-muted-foreground text-xs">{t('stats.totalPeriods')}</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.linkedPeriods}</div>
                <p className="text-muted-foreground text-xs">{t('stats.linkedPeriods')}</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.unlinkedPeriods}</div>
                <p className="text-muted-foreground text-xs">{t('stats.unlinkedPeriods')}</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.unlinkedLessons}</div>
                <p className="text-muted-foreground text-xs">{t('stats.unlinkedLessons')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Period-Lesson Mapping */}
      <Card>
        <CardHeader>
          <CardTitle>{t('periodLessonMapping')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedPeriods.map((period) => {
              const linkedLesson = getLinkedLesson(period);
              const isLinked = !!linkedLesson;

              return (
                <div
                  key={period.id}
                  className={cn(
                    'rounded-lg border p-4 transition-all duration-200',
                    isLinked && 'border-green-200 bg-green-50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Period Info */}
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <h4 className="font-medium">{getSubjectByCode(period.subject)?.name}</h4>
                        <Badge variant="outline">
                          {format(new Date(period.date), 'EEEE', { locale: vi })} {period.startTime}-
                          {period.endTime}
                        </Badge>
                        {isLinked ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-orange-600" />
                        )}
                      </div>

                      <div className="text-muted-foreground mb-3 grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {period.startTime} - {period.endTime}
                        </div>
                        {period.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {period.location}
                          </div>
                        )}
                      </div>

                      {/* Linked Lesson Info */}
                      {linkedLesson ? (
                        <div className="rounded border bg-white p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium text-green-700">{linkedLesson.title}</h5>
                              <p className="text-muted-foreground text-sm">
                                {(linkedLesson.objectives || []).length} {t('objectives')} •
                                {(linkedLesson.resources || []).length} {t('resources')}
                              </p>
                              {linkedLesson.description && (
                                <p className="text-muted-foreground mt-1 text-sm">
                                  {linkedLesson.description}
                                </p>
                              )}
                            </div>
                            <Badge className="bg-green-100 text-green-800">{t('linked')}</Badge>
                          </div>
                        </div>
                      ) : (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{t('noLessonLinked')}</AlertDescription>
                        </Alert>
                      )}
                    </div>

                    {/* Actions */}
                    {canEdit && (
                      <div className="flex flex-col gap-2">
                        {isLinked ? (
                          <Button size="sm" variant="outline" onClick={() => handleUnlinkLesson(period)}>
                            <Unlink className="mr-2 h-4 w-4" />
                            {t('actions.unlink')}
                          </Button>
                        ) : (
                          <>
                            <Button size="sm" onClick={() => openLinkDialog(period)}>
                              <Link className="mr-2 h-4 w-4" />
                              {t('actions.link')}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onCreateLessonForPeriod(period)}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              {t('actions.create')}
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Unlinked Lessons */}
      {stats.unlinkedLessons > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('unlinkedLessons')} ({stats.unlinkedLessons})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lessons
                .filter((lesson) => !periods.some((p) => p.lessons.some((l) => l.id === lesson.id)))
                .map((lesson) => (
                  <div key={lesson.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium">{lesson.title}</h5>
                        <p className="text-muted-foreground text-sm">
                          {lesson.subject ? getSubjectByCode(lesson.subject)?.name : ''}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-orange-600">
                        {t('unlinked')}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Link Dialog */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('linkLessonToPeriod')} -{' '}
              {selectedPeriod ? getSubjectByCode(selectedPeriod.subject)?.name : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Period Details */}
            {selectedPeriod && (
              <div className="rounded bg-gray-50 p-3">
                <h4 className="mb-2 font-medium">{t('periodDetails')}</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    {t('subject')}: {getSubjectByCode(selectedPeriod.subject)?.name}
                  </div>
                  <div>
                    {t('time')}: {selectedPeriod.startTime}-{selectedPeriod.endTime}
                  </div>
                  <div className="col-span-2">
                    {format(new Date(selectedPeriod.date), 'EEEE, PPP', { locale: vi })}
                  </div>
                </div>
              </div>
            )}

            {/* Lesson Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('selectLesson')}</label>
              {availableLessons.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{t('noAvailableLessons')}</AlertDescription>
                </Alert>
              ) : (
                <Select value={selectedLessonId} onValueChange={setSelectedLessonId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('chooseLesson')} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLessons.map((lesson) => (
                      <SelectItem key={lesson.id} value={lesson.id}>
                        <div className="flex flex-col">
                          <span>{lesson.title}</span>
                          <span className="text-muted-foreground text-xs">
                            {lesson.subject ? getSubjectByCode(lesson.subject)?.name : ''}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsLinkDialogOpen(false)}>
                {t('actions.cancel')}
              </Button>
              <Button
                onClick={handleLinkLesson}
                disabled={!selectedLessonId || isLinking || availableLessons.length === 0}
              >
                <Link className="mr-2 h-4 w-4" />
                {isLinking ? t('actions.linking') : t('actions.linkLesson')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
