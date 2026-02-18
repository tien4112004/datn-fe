import { useTranslation } from 'react-i18next';
import { Trash2, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@ui/dialog';
import { Button } from '@ui/button';
import { Input } from '@ui/input';
import { Textarea } from '@ui/textarea';
import { Label } from '@ui/label';
import { Checkbox } from '@ui/checkbox';
import { Badge } from '@ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/tooltip';
import { useAssignmentFormStore } from '../../stores/useAssignmentFormStore';
import { useQuestionBankChapters } from '../../hooks/useQuestionBankApi';

interface TopicEditModalProps {
  topicId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TopicEditModal = ({ topicId, open, onOpenChange }: TopicEditModalProps) => {
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.matrixEditor' });

  const topics = useAssignmentFormStore((state) => state.topics);
  const subject = useAssignmentFormStore((state) => state.subject);
  const grade = useAssignmentFormStore((state) => state.grade);
  const updateTopic = useAssignmentFormStore((state) => state.updateTopic);
  const removeTopic = useAssignmentFormStore((state) => state.removeTopic);

  const topic = topics?.find((t) => t.id === topicId);

  const [name, setName] = useState(topic?.name || '');
  const [description, setDescription] = useState(topic?.description || '');
  const [chapters, setChapters] = useState<string[]>(topic?.chapters || []);
  const [hasContext, setHasContext] = useState<boolean>(topic?.hasContext || false);

  // Fetch chapters from API
  const { data: availableChapters, isLoading: chaptersLoading } = useQuestionBankChapters(
    subject || undefined,
    grade || undefined
  );

  // Update local state when topic changes
  useEffect(() => {
    if (topic) {
      setName(topic.name);
      setDescription(topic.description || '');
      setChapters(topic.chapters || []);
      setHasContext(topic.hasContext || false);
    }
  }, [topic]);

  const handleSave = () => {
    if (topicId && topic) {
      updateTopic(topicId, {
        name,
        description,
        chapters: chapters.length > 0 ? chapters : undefined,
        hasContext: hasContext || undefined,
      });
      onOpenChange(false);
    }
  };

  const handleDelete = () => {
    if (topicId && topics && topics.length > 0) {
      removeTopic(topicId);
      onOpenChange(false);
    }
  };

  const handleChapterToggle = (chapterName: string, checked: boolean) => {
    setChapters((prev) => (checked ? [...prev, chapterName] : prev.filter((c) => c !== chapterName)));
  };

  if (!topic) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('editTopic')}</DialogTitle>
          <DialogDescription>{t('editTopicDescription')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="topic-name">{t('topicName')}</Label>
            <Input
              id="topic-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('topicPlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic-description">{t('topicDescription')}</Label>
            <Textarea
              id="topic-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('descriptionPlaceholder')}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Has Context Section */}
          <div className="space-y-2 border-t pt-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="hasContext"
                checked={hasContext}
                onCheckedChange={(checked) => setHasContext(checked as boolean)}
              />
              <label
                htmlFor="hasContext"
                className="flex items-center gap-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t('useContextLabel', 'Use reading passages')}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
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
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t(
                'useContextDescription',
                'This setting is used when generating questions with Fill Matrix Gaps'
              )}
            </p>
          </div>

          {/* Chapters Section */}
          <div className="space-y-2 border-t pt-3">
            <Label className="text-sm font-semibold">{t('chapters', 'Chapters (Optional)')}</Label>
            <p className="text-xs text-gray-500">
              {t('chaptersHint', 'Select chapters from the curriculum. Used as informational metadata.')}
            </p>

            {/* Selected chapters as badges */}
            {chapters.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {chapters.map((chapter, idx) => (
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
              <div className="max-h-48 space-y-1 overflow-y-auto rounded border p-2">
                {availableChapters.map((ch) => (
                  <div key={ch.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`modal-chapter-${ch.id}`}
                      checked={chapters.includes(ch.name)}
                      onCheckedChange={(checked) => handleChapterToggle(ch.name, checked as boolean)}
                    />
                    <label
                      htmlFor={`modal-chapter-${ch.id}`}
                      className="text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {ch.name}
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

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button type="button" variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            {t('deleteTopic')}
          </Button>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('cancel')}
            </Button>
            <Button type="button" onClick={handleSave}>
              {t('save')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
