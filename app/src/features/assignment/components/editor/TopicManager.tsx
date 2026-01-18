import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { useAssignmentFormStore } from '../../stores/useAssignmentFormStore';
import { generateId } from '../../utils';

export const TopicManager = () => {
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.matrixEditor' });

  // Get data and actions from store
  const topics = useAssignmentFormStore((state) => state.topics);
  const addTopic = useAssignmentFormStore((state) => state.addTopic);
  const removeTopic = useAssignmentFormStore((state) => state.removeTopic);
  const updateTopic = useAssignmentFormStore((state) => state.updateTopic);

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
          </div>
        ))}
      </div>
    </div>
  );
};
