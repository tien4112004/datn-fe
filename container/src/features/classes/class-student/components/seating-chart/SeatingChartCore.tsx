import { useDraggable, useDroppable } from '@dnd-kit/core';

const DraggableItem = ({
  id,
  children,
  data,
  disabled = false,
}: {
  id: string;
  children: React.ReactNode;
  data?: any;
  disabled?: boolean;
}) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data,
    disabled,
  });

  const style = {
    cursor: disabled ? 'default' : isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={isDragging ? 'opacity-0' : ''}
    >
      {children}
    </div>
  );
};

const DroppableArea = ({ id, children, data }: { id: string; children: React.ReactNode; data?: any }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data,
  });

  return (
    <div ref={setNodeRef} className={isOver ? 'ring-primary/50 rounded-lg ring-2 ring-offset-2' : ''}>
      {children}
    </div>
  );
};

export { DraggableItem, DroppableArea };
