import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
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

  // Collect unique existing group names
  const existingGroups = useMemo(() => {
    const groups = new Set<string>();
    topics?.forEach((t) => {
      const group = t.parentTopic || t.name;
      if (group) groups.add(group);
    });
    return Array.from(groups);
  }, [topics]);

  const [name, setName] = useState(topic?.name || '');
  const [description, setDescription] = useState(topic?.description || '');
  const [parentTopic, setParentTopic] = useState(topic?.parentTopic || '');

  // Update local state when topic changes
  useEffect(() => {
    if (topic) {
      setName(topic.name);
      setDescription(topic.description || '');
      setParentTopic(topic.parentTopic || '');
    }
  }, [topic]);

  const handleSave = () => {
    if (topicId && topic) {
      updateTopic(topicId, { name, description, parentTopic: parentTopic || undefined });
      onOpenChange(false);
    }
  };

  const handleDelete = () => {
    if (topicId && topics && topics.length > 0) {
      removeTopic(topicId);
      onOpenChange(false);
    }
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
            <Label>{t('parentTopic')}</Label>
            <Select value={parentTopic} onValueChange={setParentTopic}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('parentTopicPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {existingGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
              rows={4}
              className="resize-none"
            />
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
