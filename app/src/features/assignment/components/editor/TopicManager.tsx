import { useTranslation } from 'react-i18next';
import { Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { useAssignmentFormStore } from '../../stores/useAssignmentFormStore';
import { generateId } from '@/shared/lib/utils';

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

  const handleAddSubtopic = (topicId: string) => {
    const topic = topics.find((t) => t.id === topicId);
    if (!topic) return;
    const currentSubtopics = topic.subtopics || [];
    updateTopic(topicId, { subtopics: [...currentSubtopics, ''] });
  };

  const handleSubtopicChange = (topicId: string, index: number, value: string) => {
    const topic = topics.find((t) => t.id === topicId);
    if (!topic) return;
    const updatedSubtopics = [...(topic.subtopics || [])];
    updatedSubtopics[index] = value;
    updateTopic(topicId, { subtopics: updatedSubtopics });
  };

  const handleRemoveSubtopic = (topicId: string, index: number) => {
    const topic = topics.find((t) => t.id === topicId);
    if (!topic) return;
    const updatedSubtopics = (topic.subtopics || []).filter((_, i) => i !== index);
    updateTopic(topicId, { subtopics: updatedSubtopics.length > 0 ? updatedSubtopics : undefined });
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

            {/* Subtopics Editor */}
            <div className="space-y-2 border-t pt-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-gray-600">
                  {t('subtopics', 'Subtopics (Optional)')}
                </Label>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => handleAddSubtopic(topic.id)}
                  className="h-6 px-2 text-xs"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  {t('addSubtopic', 'Add Subtopic')}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                {t(
                  'subtopicsHint',
                  'Subtopics are for informational purposes and do not affect question filtering.'
                )}
              </p>

              {/* Subtopics List */}
              {topic.subtopics && topic.subtopics.length > 0 ? (
                <div className="space-y-2">
                  {topic.subtopics.map((subtopic, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={subtopic}
                        onChange={(e) => handleSubtopicChange(topic.id, idx, e.target.value)}
                        placeholder={t('subtopicPlaceholder', `Subtopic ${idx + 1}`)}
                        className="text-sm"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveSubtopic(topic.id, idx)}
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs italic text-gray-400">{t('noSubtopics', 'No subtopics added yet')}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
