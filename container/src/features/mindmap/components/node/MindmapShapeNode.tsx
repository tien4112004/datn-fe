import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { memo } from 'react';
import { Position, type NodeProps } from '@xyflow/react';
import { cn } from '@/shared/lib/utils';
import { DIRECTION } from '../../constants';
import type { MindMapShapeNode } from '../../types';
import { BaseHandle } from '@/features/mindmap/components/ui/base-handle';
import { useMindmapStore } from '../../stores/useMindmapStore';
import { useMindmapNodeCommon } from '../../hooks/useMindmapNodeCommon';
import { MindmapNodeBase } from './MindmapNodeBase';

const MindMapShapeNodeBlock = memo(({ ...node }: NodeProps<MindMapShapeNode>) => {
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
  } = useMindmapNodeCommon<MindMapShapeNode>({ node });

  const updateNodeData = useMindmapStore((state) => state.updateNodeData);

  const handleShapeChange = (newShape: 'rectangle' | 'circle' | 'ellipse') => {
    updateNodeData(nodeId, { shape: newShape });
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
      variant="replacing"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="h-full w-full"
        viewBox={`0 0 ${nodeData.width || 200} ${nodeData.height || 100}`}
      >
        {nodeData.shape === 'circle' && (
          <circle
            cx={nodeData.width ? nodeData.width / 2 : 100}
            cy={nodeData.height ? nodeData.height / 2 : 50}
            r={Math.min(nodeData.width || 200, nodeData.height || 100) / 2 - 5}
            fill={nodeData.metadata?.fill || 'lightblue'}
            stroke={nodeData.metadata?.stroke || 'blue'}
            strokeWidth={nodeData.metadata?.strokeWidth || 2}
          />
        )}
        {nodeData.shape === 'ellipse' && (
          <ellipse
            cx={nodeData.width ? nodeData.width / 2 : 100}
            cy={nodeData.height ? nodeData.height / 2 : 50}
            rx={(nodeData.width || 200) / 2 - 5}
            ry={(nodeData.height || 100) / 2 - 5}
            fill={nodeData.metadata?.fill || 'lightgreen'}
            stroke={nodeData.metadata?.stroke || 'green'}
            strokeWidth={nodeData.metadata?.strokeWidth || 2}
          />
        )}
        {(!nodeData.shape || nodeData.shape === 'rectangle') && (
          <rect
            x="5"
            y="5"
            width={(nodeData.width || 200) - 10}
            height={(nodeData.height || 100) - 10}
            fill={nodeData.metadata?.fill || 'lightblue'}
            stroke={nodeData.metadata?.stroke || 'blue'}
            strokeWidth={nodeData.metadata?.strokeWidth || 2}
            rx={nodeData.metadata?.borderRadius || 8}
            ry={nodeData.metadata?.borderRadius || 8}
          />
        )}
      </svg>

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

      {/* Shape selector */}
      <div
        className={cn(
          layout === DIRECTION.VERTICAL
            ? 'right-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%+24px)] flex-col'
            : 'left-1/2 top-0 -translate-x-1/2 -translate-y-[calc(100%+24px)] flex-row',
          'bg-muted absolute z-[1000] flex items-center justify-center gap-1 rounded-sm transition-all duration-200',
          isSelected ? 'visible opacity-100' : 'invisible opacity-0'
        )}
      >
        <button
          onClick={() => handleShapeChange('rectangle')}
          className={cn(
            'hover:bg-accent cursor-pointer rounded-sm p-1',
            (!nodeData.shape || nodeData.shape === 'rectangle') && 'bg-accent'
          )}
          title="Rectangle"
        >
          <svg className="h-3 w-3" viewBox="0 0 12 8" fill="currentColor">
            <rect width="12" height="8" rx="1" />
          </svg>
        </button>
        <button
          onClick={() => handleShapeChange('circle')}
          className={cn(
            'hover:bg-accent cursor-pointer rounded-sm p-1',
            nodeData.shape === 'circle' && 'bg-accent'
          )}
          title="Circle"
        >
          <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
            <circle cx="6" cy="6" r="6" />
          </svg>
        </button>
        <button
          onClick={() => handleShapeChange('ellipse')}
          className={cn(
            'hover:bg-accent cursor-pointer rounded-sm p-1',
            nodeData.shape === 'ellipse' && 'bg-accent'
          )}
          title="Ellipse"
        >
          <svg className="h-3 w-3" viewBox="0 0 12 8" fill="currentColor">
            <ellipse cx="6" cy="4" rx="6" ry="4" />
          </svg>
        </button>
      </div>

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

export default MindMapShapeNodeBlock;
