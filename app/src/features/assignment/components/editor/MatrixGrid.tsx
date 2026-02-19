import { useEffect, useState } from 'react';
import { MatrixGridEditor } from '@aiprimary/question/matrix';
import { TopicEditModal } from './TopicEditModal';
import { useAssignmentFormStore } from '../../stores/useAssignmentFormStore';
import { generateId } from '@aiprimary/core';

export const MatrixGrid = () => {
  // Get data from store (matrix counts are auto-synced)
  const topics = useAssignmentFormStore((state) => state.topics);
  const matrixCells = useAssignmentFormStore((state) => state.matrix);
  const addTopic = useAssignmentFormStore((state) => state.addTopic);
  const updateMatrixCell = useAssignmentFormStore((state) => state.updateMatrixCell);
  const createMatrixCell = useAssignmentFormStore((state) => state.createMatrixCell);
  const removeMatrixCell = useAssignmentFormStore((state) => state.removeMatrixCell);

  // Modal state
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);

  const handleAddTopic = () => {
    const newTopicId = generateId();
    addTopic({ id: newTopicId, name: '', description: '' });
    setEditingTopicId(newTopicId);
  };

  // Listen for add topic event from Actions sidebar
  useEffect(() => {
    const handler = () => handleAddTopic();
    window.addEventListener('matrix.addTopic', handler);
    return () => window.removeEventListener('matrix.addTopic', handler);
  });

  return (
    <div className="space-y-4">
      <MatrixGridEditor
        topics={topics || []}
        cells={matrixCells || []}
        onCellUpdate={updateMatrixCell}
        onCellCreate={createMatrixCell}
        onCellRemove={removeMatrixCell}
        onTopicEdit={(topicId) => setEditingTopicId(topicId)}
      />

      <TopicEditModal
        topicId={editingTopicId}
        open={!!editingTopicId}
        onOpenChange={(open) => !open && setEditingTopicId(null)}
      />
    </div>
  );
};
