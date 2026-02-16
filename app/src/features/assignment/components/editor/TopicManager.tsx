import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Info } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Badge } from '@/shared/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { useAssignmentFormStore } from '../../stores/useAssignmentFormStore';
import { useQuestionBankChapters } from '../../hooks/useQuestionBankApi';
import { generateId } from '@/shared/lib/utils';

export const TopicManager = () => {
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.matrixEditor' });

  // Get data and actions from store
  const topics = useAssignmentFormStore((state) => state.topics);
  const subject = useAssignmentFormStore((state) => state.subject);
  const grade = useAssignmentFormStore((state) => state.grade);
  const addTopic = useAssignmentFormStore((state) => state.addTopic);
  const removeTopic = useAssignmentFormStore((state) => state.removeTopic);
  const updateTopic = useAssignmentFormStore((state) => state.updateTopic);

  // Fetch chapters from API based on assignment's grade and subject
  const { data: availableChapters, isLoading: chaptersLoading } = useQuestionBankChapters(
    subject || undefined,
    grade || undefined
  );

  const handleAddTopic = () => {
    const newTopicId = generateId();
    // Store handles creating matrix cells atomically
    addTopic({ id: newTopicId, name: '', description: '' });
  };

  const handleRemoveTopic = (topicId: string) => {
    // Store handles removing topic and its matrix cells atomically
    removeTopic(topicId);
  };

  const handleTopicNameChange = (topicId: string, name: string) => {
    updateTopic(topicId, { name });
  };

  const handleTopicDescriptionChange = (topicId: string, description: string) => {
    updateTopic(topicId, { description });
  };

  const handleHasContextChange = (topicId: string, hasContext: boolean) => {
    updateTopic(topicId, { hasContext });
  };

  const handleChapterToggle = (topicId: string, chapterName: string, checked: boolean) => {
    const topic = topics.find((t) => t.id === topicId);
    if (!topic) return;
    const currentChapters = topic.chapters || [];
    const updatedChapters = checked
      ? [...currentChapters, chapterName]
      : currentChapters.filter((c) => c !== chapterName);
    updateTopic(topicId, { chapters: updatedChapters.length > 0 ? updatedChapters : undefined });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">{t('topicsLabel')}</Label>
        <Button type="button" size="sm" variant="outline" onClick={handleAddTopic}>
          <Plus className="mr-1 h-3 w-3" />
          {t('addTopic')}
        </Button>
      </div>

      <div className="space-y-2">
        {topics?.map((topic) => (
          <div key={topic.id} className="space-y-2 rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <Input
                value={topic.name}
                onChange={(e) => handleTopicNameChange(topic.id, e.target.value)}
                placeholder={t('topicPlaceholder')}
                className="text-sm"
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => handleRemoveTopic(topic.id)}
                className="text-red-500 hover:bg-red-50 hover:text-red-600"
                disabled={topics.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              value={topic.description || ''}
              onChange={(e) => handleTopicDescriptionChange(topic.id, e.target.value)}
              placeholder={t('descriptionPlaceholder')}
              rows={2}
              className="resize-none text-sm"
            />

            {/* Has Context Checkbox */}
            <div className="flex items-center gap-2 pt-2">
              <Checkbox
                id={`hasContext-${topic.id}`}
                checked={topic.hasContext || false}
                onCheckedChange={(checked) => handleHasContextChange(topic.id, checked as boolean)}
              />
              <label
                htmlFor={`hasContext-${topic.id}`}
                className="flex items-center gap-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t('useContextLabel', 'Use reading passages')}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      {t(
                        'useContextHint',
                        'When enabled, AI will use reading passages when generating questions for this topic through Fill Matrix Gaps'
                      )}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </label>
            </div>

            {/* Chapters Selection */}
            <div className="space-y-2 border-t pt-3">
              <Label className="text-xs font-semibold text-gray-600">
                {t('chapters', 'Chapters (Optional)')}
              </Label>
              <p className="text-xs text-gray-500">
                {t('chaptersHint', 'Select chapters from the curriculum. Used as informational metadata.')}
              </p>

              {/* Selected chapters as badges */}
              {topic.chapters && topic.chapters.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {topic.chapters.map((chapter, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {chapter}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Chapter checkbox list */}
              {!subject || !grade ? (
                <p className="text-xs italic text-gray-400">
                  {t('chaptersRequireGradeSubject', 'Set grade and subject to see available chapters')}
                </p>
              ) : chaptersLoading ? (
                <p className="text-xs italic text-gray-400">{t('chaptersLoading', 'Loading chapters...')}</p>
              ) : availableChapters && availableChapters.length > 0 ? (
                <div className="max-h-40 space-y-1 overflow-y-auto rounded border p-2">
                  {availableChapters.map((chapter) => (
                    <div key={chapter.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`chapter-${topic.id}-${chapter.id}`}
                        checked={(topic.chapters || []).includes(chapter.name)}
                        onCheckedChange={(checked) =>
                          handleChapterToggle(topic.id, chapter.name, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={`chapter-${topic.id}-${chapter.id}`}
                        className="text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {chapter.name}
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs italic text-gray-400">
                  {t('noChaptersAvailable', 'No chapters available for this grade and subject')}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
