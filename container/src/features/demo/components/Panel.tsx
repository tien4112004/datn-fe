import { useDraggable } from '@dnd-kit/core';

const Panel = () => {
  const { attributes, listeners, setNodeRef, transform, isDragging, active } = useDraggable({
    id: 'question-template',
    data: {
      type: 'question-template',
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`w-64 h-16 bg-blue-100 border-2 border-dashed border-blue-300 rounded-lg p-4 cursor-grab active:cursor-grabbing hover:bg-blue-200 transition-colors ${
        isDragging ? 'opacity-50' : ''
      }`}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      }}
    >
      <p className="text-center text-blue-600 font-medium h-full flex items-center justify-center">
        📝 Drag to add question
      </p>
    </div>
  );
};

export default Panel;
