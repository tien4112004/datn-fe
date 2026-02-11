import { useTranslation } from 'react-i18next';
import { Trash2, Plus, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { useAssignmentFormStore } from '../../stores/useAssignmentFormStore';

interface TopicEditModalProps {
  topicId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TopicEditModal = ({ topicId, open, onOpenChange }: TopicEditModalProps) => {
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.matrixEditor' });

  const topics = useAssignmentFormStore((state) => state.topics);
  const updateTopic = useAssignmentFormStore((state) => state.updateTopic);
  const removeTopic = useAssignmentFormStore((state) => state.removeTopic);

  const topic = topics?.find((t) => t.id === topicId);

  const [name, setName] = useState(topic?.name || '');
  const [description, setDescription] = useState(topic?.description || '');
  const [subtopics, setSubtopics] = useState<string[]>(topic?.subtopics || []);

  // Update local state when topic changes
  useEffect(() => {
    if (topic) {
      setName(topic.name);
      setDescription(topic.description || '');
      setSubtopics(topic.subtopics || []);
    }
  }, [topic]);

  const handleSave = () => {
    if (topicId && topic) {
      updateTopic(topicId, {
        name,
        description,
        subtopics: subtopics.length > 0 ? subtopics : undefined,
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

  const handleAddSubtopic = () => {
    setSubtopics([...subtopics, '']);
  };

  const handleSubtopicChange = (index: number, value: string) => {
    const updated = [...subtopics];
    updated[index] = value;
    setSubtopics(updated);
  };

  const handleRemoveSubtopic = (index: number) => {
    setSubtopics(subtopics.filter((_, i) => i !== index));
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

          {/* Subtopics Section */}
          <div className="space-y-2 border-t pt-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">{t('subtopics', 'Subtopics (Optional)')}</Label>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleAddSubtopic}
                className="h-6 px-2 text-xs"
              >
                <Plus className="mr-1 h-3 w-3" />
                {t('addSubtopic', 'Add')}
              </Button>
            </div>
            <p className="text-xs text-gray-500">{t('subtopicsHint', 'For informational purposes only.')}</p>

            {subtopics.length > 0 ? (
              <div className="space-y-2">
                {subtopics.map((subtopic, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      value={subtopic}
                      onChange={(e) => handleSubtopicChange(idx, e.target.value)}
                      placeholder={t('subtopicPlaceholder', `Subtopic ${idx + 1}`)}
                      className="text-sm"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveSubtopic(idx)}
                      className="text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs italic text-gray-400">{t('noSubtopics', 'No subtopics added')}</p>
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
