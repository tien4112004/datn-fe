import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { AutosizeTextarea } from '@/shared/components/ui/autosize-textarea';
import { useTranslation } from 'react-i18next';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import useAssessmentMatrixStore from '@/features/assessment-matrix/stores/assessmentMatrixStore';
import { useTopicsBySubject } from '@/features/assessment-matrix/hooks/useAssessmentMatrixApi';
import type { Topic } from '@/features/assessment-matrix/types';
import { generateId } from '@/shared/lib/utils';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

interface TopicManagementDialogProps {
  open: boolean;
  onClose: () => void;
}

export const TopicManagementDialog = ({ open, onClose }: TopicManagementDialogProps) => {
  const { t } = useTranslation(I18N_NAMESPACES.EXAM_MATRIX);
  const { currentMatrix, addTopic, removeTopic } = useAssessmentMatrixStore();

  // Fetch existing topics for the current subject
  const { data: availableTopics = [] } = useTopicsBySubject(currentMatrix?.subjectCode || 'T');

  // Local state for inline topic creation
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicDescription, setNewTopicDescription] = useState('');

  useEffect(() => {
    if (!open) {
      setNewTopicName('');
      setNewTopicDescription('');
    }
  }, [open]);

  const handleAddExistingTopic = (topic: Topic) => {
    if (!currentMatrix) return;

    // Check if topic is already added
    if (currentMatrix.topics.some((t) => t.id === topic.id)) {
      toast.warning(t('topic.validation.alreadyAdded'));
      return;
    }

    addTopic(topic);
    toast.success(t('messages.topicCreated'));
  };

  const handleCreateNewTopic = () => {
    if (!currentMatrix) return;

    if (!newTopicName.trim()) {
      toast.error(t('topic.validation.nameRequired'));
      return;
    }

    // Check for duplicate in current matrix
    const duplicate = currentMatrix.topics.find(
      (t) => t.name.trim().toLowerCase() === newTopicName.trim().toLowerCase()
    );

    if (duplicate) {
      toast.error(t('topic.validation.alreadyInMatrix'));
      return;
    }

    const newTopic: Topic = {
      id: generateId(),
      name: newTopicName.trim(),
      description: newTopicDescription.trim() || undefined,
      subjectCode: currentMatrix.subjectCode,
    };

    addTopic(newTopic);
    toast.success(t('messages.topicCreated'));

    // Clear form
    setNewTopicName('');
    setNewTopicDescription('');
  };

  const handleRemoveTopic = (topicId: string) => {
    removeTopic(topicId);
    toast.success(t('messages.topicDeleted'));
  };

  if (!currentMatrix) return null;

  // Filter out topics already added to the matrix
  const addedTopicIds = new Set(currentMatrix.topics.map((t) => t.id));
  const previousTopics = availableTopics.filter((t) => !addedTopicIds.has(t.id));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[80vh] !max-w-3xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>{t('topic.dialogTitle')}</DialogTitle>
          <p className="text-muted-foreground text-sm">{t('topic.dialogSubtitle')}</p>
        </DialogHeader>

        <div className="flex-1 space-y-6 overflow-auto p-1">
          {/* SECTION 1: Inline Creation Form - Always Visible */}
          <div className="bg-muted/20 rounded-lg border p-4">
            <h3 className="mb-3 text-sm font-semibold">{t('topic.sections.addNew')}</h3>
            <div className="space-y-3">
              <Input
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                placeholder={t('topic.namePlaceholder')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleCreateNewTopic();
                  }
                }}
              />

              <AutosizeTextarea
                value={newTopicDescription}
                onChange={(e) => setNewTopicDescription(e.target.value)}
                placeholder={t('topic.descriptionPlaceholder')}
                minHeight={60}
              />

              <Button onClick={handleCreateNewTopic} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                {t('topic.addButton')}
              </Button>
            </div>
          </div>

          {/* SECTION 2: Current Topics in Matrix */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">
              {t('topic.sections.currentCount', { count: currentMatrix.topics.length })}
            </h3>
            {currentMatrix.topics.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center">
                <p className="text-muted-foreground text-sm">{t('topic.emptyState.noTopics')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {currentMatrix.topics.map((topic) => (
                  <div
                    key={topic.id}
                    className="bg-card flex items-start justify-between rounded-lg border p-3"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{topic.name}</div>
                      {topic.description && (
                        <p className="text-muted-foreground mt-1 text-sm">{topic.description}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveTopic(topic.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 3: Previously Created Topics (Reusable) */}
          {previousTopics.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold">
                {t('topic.sections.previousCount', { count: previousTopics.length })}
              </h3>
              <p className="text-muted-foreground mb-3 text-xs">{t('topic.sections.previousSubtitle')}</p>
              <div className="space-y-2">
                {previousTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className="bg-muted/10 hover:bg-muted/20 flex items-start justify-between rounded-lg border p-3 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{topic.name}</div>
                      {topic.description && (
                        <p className="text-muted-foreground mt-1 text-sm">{topic.description}</p>
                      )}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleAddExistingTopic(topic)}>
                      {t('topic.addToMatrix')}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button onClick={onClose}>{t('topic.done')}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
