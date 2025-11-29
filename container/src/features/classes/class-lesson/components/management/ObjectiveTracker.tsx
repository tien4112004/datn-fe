import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Target, ChevronDown, ChevronRight, CheckCircle2, AlertCircle, Edit, Save, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { LearningObjective, Lesson, ObjectiveType } from '../../types';
import { cn } from '@/shared/lib/utils';

interface ObjectiveTrackerProps {
  lesson: Lesson;
  objectives: LearningObjective[];
  onUpdateObjective: (
    lessonId: string,
    objectiveId: string,
    updates: Partial<LearningObjective>
  ) => Promise<void>;
  onAddNote: (lessonId: string, objectiveId: string, note: string) => Promise<void>;
  canEdit?: boolean;
}

interface ObjectiveProgress {
  total: number;
  achieved: number;
  percentage: number;
  byType: Record<ObjectiveType, { total: number; achieved: number }>;
}

export const ObjectiveTracker = ({
  lesson,
  objectives,
  onUpdateObjective,
  onAddNote,
  canEdit = true,
}: ObjectiveTrackerProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'lesson.objectives' });
  const [expandedObjectives, setExpandedObjectives] = useState<Set<string>>(new Set());
  const [editingNotes, setEditingNotes] = useState<Map<string, string>>(new Map());
  const [isUpdating, setIsUpdating] = useState<Set<string>>(new Set());

  const progress = useMemo((): ObjectiveProgress => {
    const total = objectives.length;
    const achieved = objectives.filter((obj) => obj.isAchieved).length;
    const percentage = total > 0 ? Math.round((achieved / total) * 100) : 0;

    const byType: Record<ObjectiveType, { total: number; achieved: number }> = {
      knowledge: { total: 0, achieved: 0 },
      skill: { total: 0, achieved: 0 },
      attitude: { total: 0, achieved: 0 },
      competency: { total: 0, achieved: 0 },
    };

    objectives.forEach((obj) => {
      byType[obj.type].total++;
      if (obj.isAchieved) {
        byType[obj.type].achieved++;
      }
    });

    return { total, achieved, percentage, byType };
  }, [objectives]);

  const handleToggleAchieved = async (objectiveId: string, isAchieved: boolean) => {
    if (!canEdit) return;

    setIsUpdating((prev) => new Set(prev).add(objectiveId));
    try {
      await onUpdateObjective(lesson.id, objectiveId, { isAchieved });
    } finally {
      setIsUpdating((prev) => {
        const newSet = new Set(prev);
        newSet.delete(objectiveId);
        return newSet;
      });
    }
  };

  const handleToggleExpanded = (objectiveId: string) => {
    setExpandedObjectives((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(objectiveId)) {
        newSet.delete(objectiveId);
      } else {
        newSet.add(objectiveId);
      }
      return newSet;
    });
  };

  const handleStartEditNote = (objectiveId: string, currentNote?: string) => {
    setEditingNotes((prev) => new Map(prev).set(objectiveId, currentNote || ''));
  };

  const handleSaveNote = async (objectiveId: string) => {
    const note = editingNotes.get(objectiveId);
    if (note === undefined) return;

    setIsUpdating((prev) => new Set(prev).add(objectiveId));
    try {
      await onAddNote(lesson.id, objectiveId, note);
      setEditingNotes((prev) => {
        const newMap = new Map(prev);
        newMap.delete(objectiveId);
        return newMap;
      });
    } finally {
      setIsUpdating((prev) => {
        const newSet = new Set(prev);
        newSet.delete(objectiveId);
        return newSet;
      });
    }
  };

  const handleCancelEditNote = (objectiveId: string) => {
    setEditingNotes((prev) => {
      const newMap = new Map(prev);
      newMap.delete(objectiveId);
      return newMap;
    });
  };

  const getObjectiveTypeLabel = (type: ObjectiveType) => {
    switch (type) {
      case 'knowledge':
        return t('types.knowledge');
      case 'skill':
        return t('types.skill');
      case 'attitude':
        return t('types.attitude');
      case 'competency':
        return t('types.competency');
      default:
        return type;
    }
  };

  const getObjectiveTypeColor = (type: ObjectiveType) => {
    switch (type) {
      case 'knowledge':
        return 'bg-blue-100 text-blue-800';
      case 'skill':
        return 'bg-green-100 text-green-800';
      case 'attitude':
        return 'bg-purple-100 text-purple-800';
      case 'competency':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {t('title')} - {lesson.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('overallProgress')}</span>
                <span className="text-muted-foreground text-sm">
                  {progress.achieved}/{progress.total} {t('achieved')}
                </span>
              </div>
              <Progress value={progress.percentage} className="h-3" />
              <div className="text-center">
                <span className="text-2xl font-bold">{progress.percentage}%</span>
              </div>
            </div>

            {/* Progress by Type */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {Object.entries(progress.byType).map(([type, data]) => (
                <div key={type} className="text-center">
                  <div
                    className={cn(
                      'mb-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
                      getObjectiveTypeColor(type as ObjectiveType)
                    )}
                  >
                    {getObjectiveTypeLabel(type as ObjectiveType)}
                  </div>
                  <div className="text-lg font-semibold">
                    {data.achieved}/{data.total}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {data.total > 0 ? Math.round((data.achieved / data.total) * 100) : 0}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Objectives */}
      <Card>
        <CardHeader>
          <CardTitle>{t('individualObjectives')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {objectives.map((objective) => {
              const isExpanded = expandedObjectives.has(objective.id || '');
              const isEditingNote = editingNotes.has(objective.id || '');
              const isUpdatingThis = isUpdating.has(objective.id || '');

              return (
                <div
                  key={objective.id}
                  className={cn(
                    'rounded-lg border transition-all duration-200',
                    objective.isAchieved && 'border-green-200 bg-green-50'
                  )}
                >
                  <Collapsible>
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <div className="pt-1">
                          <Checkbox
                            checked={objective.isAchieved}
                            onCheckedChange={(checked) =>
                              handleToggleAchieved(objective.id || '', checked as boolean)
                            }
                            disabled={!canEdit || isUpdatingThis}
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p
                                className={cn(
                                  'font-medium',
                                  objective.isAchieved && 'text-muted-foreground line-through'
                                )}
                              >
                                {objective.description}
                              </p>
                              <div className="mt-1 flex items-center gap-2">
                                <Badge className={cn('text-xs', getObjectiveTypeColor(objective.type))}>
                                  {getObjectiveTypeLabel(objective.type)}
                                </Badge>
                                {objective.isAchieved ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 text-orange-600" />
                                )}
                              </div>
                            </div>

                            {/* Expand/Collapse */}
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleExpanded(objective.id || '')}
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                          </div>
                        </div>
                      </div>
                    </div>

                    <CollapsibleContent>
                      <div className="border-t bg-gray-50 px-4 pb-4">
                        <div className="space-y-3 pt-4">
                          {/* Notes Section */}
                          <div>
                            <div className="mb-2 flex items-center justify-between">
                              <h4 className="text-sm font-medium">{t('notes')}</h4>
                              {!isEditingNote && canEdit && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleStartEditNote(objective.id || '', objective.notes)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                            </div>

                            {isEditingNote ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={editingNotes.get(objective.id) || ''}
                                  onChange={(e) =>
                                    setEditingNotes((prev) =>
                                      new Map(prev).set(objective.id || '', e.target.value)
                                    )
                                  }
                                  placeholder={t('addNote')}
                                  rows={3}
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleSaveNote(objective.id || '')}
                                    disabled={isUpdatingThis}
                                  >
                                    <Save className="mr-2 h-4 w-4" />
                                    {t('save')}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleCancelEditNote(objective.id || '')}
                                  >
                                    <X className="mr-2 h-4 w-4" />
                                    {t('cancel')}
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-muted-foreground text-sm">
                                {objective.notes || t('noNotes')}
                              </div>
                            )}
                          </div>

                          {/* Metadata */}
                          <div className="text-muted-foreground text-xs">ID: {objective.id || 'New'}</div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              );
            })}
          </div>

          {objectives.length === 0 && (
            <div className="text-muted-foreground py-8 text-center">
              <Target className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>{t('noObjectives')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {objectives.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{progress.achieved}</div>
                <p className="text-muted-foreground text-xs">{t('stats.achieved')}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{progress.total - progress.achieved}</div>
                <p className="text-muted-foreground text-xs">{t('stats.remaining')}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{progress.percentage}%</div>
                <p className="text-muted-foreground text-xs">{t('stats.completion')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
