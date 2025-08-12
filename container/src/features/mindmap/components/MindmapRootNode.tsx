import { Plus, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, memo } from 'react';
import { Position, type NodeProps } from '@xyflow/react';
import { cn } from '@/shared/lib/utils';
import { DIRECTION, DragHandle } from '../constants';
import type { MindMapRootNode } from '../types';
import { BaseHandle } from '@/features/mindmap/components/ui/base-handle';
import { useMindmapNodeCommon } from '../hooks/useMindmapNodeCommon';
import { MindmapNodeBase } from './shared/MindmapNodeBase';
import { Input } from '@/components/ui/input';

const MindmapRootNodeBlock = memo(({ ...node }: NodeProps<MindMapRootNode>) => {
  const {
    isMouseOver,
    setIsMouseOver,
    layout,
    isLayouting,
    addChildNode,
    finalizeNodeDeletion,
    canCreateLeft,
    canCreateRight,
    nodeId,
    nodeData,
    isSelected,
  } = useMindmapNodeCommon<MindMapRootNode>({ node });

  const [, setIsEditing] = useState(false);

  const handleEditSubmit = () => {
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  return (
    <MindmapNodeBase
      nodeId={nodeId}
      nodeData={nodeData}
      isSelected={isSelected}
      isLayouting={isLayouting}
      isMouseOver={isMouseOver}
      onMouseEnter={() => setIsMouseOver(true)}
      onMouseLeave={() => setIsMouseOver(false)}
      onAnimationComplete={finalizeNodeDeletion}
      contentClassName="flex flex-row items-stretch gap-2 p-0"
    >
      <div className={cn('p-2 pr-0', DragHandle.CLASS)}>
        <GripVertical
          className={cn(
            'h-full w-5',
            isMouseOver || isSelected ? 'opacity-100' : 'opacity-50',
            layout === DIRECTION.NONE ? 'cursor-move' : 'cursor-default'
          )}
        />
      </div>
      <Input
        type="text"
        className="min-w-[100px] max-w-[300px] cursor-text border-none bg-transparent p-2 pl-0 outline-none"
        value={nodeData.content || ''}
        onKeyDown={handleKeyPress}
        onBlur={handleEditSubmit}
      />

      {/* Add Child Buttons */}
      <Button
        onClick={() =>
          addChildNode(
            node,
            { x: node.positionAbsoluteX - 250, y: node.positionAbsoluteY },
            `first-source-${nodeId}`
          )
        }
        disabled={!canCreateLeft}
        size="icon"
        variant="outline"
        className={cn(
          'bg-accent absolute z-[1000] cursor-pointer rounded-full transition-all duration-200',
          (isMouseOver || isSelected) && canCreateLeft ? 'visible opacity-100' : 'invisible opacity-0',
          layout === DIRECTION.VERTICAL
            ? 'left-1/2 top-0 -translate-x-1/2 -translate-y-[calc(100%+24px)]'
            : 'left-0 top-1/2 -translate-x-[calc(100%+24px)] -translate-y-1/2'
        )}
      >
        <Plus />
      </Button>

      <Button
        onClick={() =>
          addChildNode(
            node,
            { x: node.positionAbsoluteX + 250, y: node.positionAbsoluteY },
            `second-source-${nodeId}`
          )
        }
        disabled={!canCreateRight}
        size="icon"
        variant="outline"
        className={cn(
          'bg-accent absolute z-[1000] cursor-pointer rounded-full transition-all duration-200',
          (isMouseOver || isSelected) && canCreateRight ? 'visible opacity-100' : 'invisible opacity-0',
          layout === DIRECTION.VERTICAL
            ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-[calc(100%+24px)]'
            : 'right-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%+24px)]'
        )}
      >
        <Plus />
      </Button>

      {/* Connection Handles */}
      <BaseHandle
        type="source"
        position={layout === DIRECTION.VERTICAL ? Position.Top : Position.Left}
        style={{ visibility: 'hidden' }}
        id={`first-source-${nodeId}`}
      />
      <BaseHandle
        type="source"
        position={layout === DIRECTION.VERTICAL ? Position.Bottom : Position.Right}
        style={{ visibility: 'hidden' }}
        id={`second-source-${nodeId}`}
      />
      <BaseHandle
        type="target"
        position={layout === DIRECTION.VERTICAL ? Position.Top : Position.Left}
        style={{ visibility: 'hidden' }}
        id={`first-target-${nodeId}`}
      />
      <BaseHandle
        type="target"
        position={layout === DIRECTION.VERTICAL ? Position.Bottom : Position.Right}
        style={{ visibility: 'hidden' }}
        id={`second-target-${nodeId}`}
      />
    </MindmapNodeBase>
  );
});

export default MindmapRootNodeBlock;
