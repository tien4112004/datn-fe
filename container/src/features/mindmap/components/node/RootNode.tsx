import { GripVertical, Network, Workflow } from 'lucide-react';
import { useState, memo, useCallback } from 'react';
import { cn } from '@/shared/lib/utils';
import { DIRECTION, DragHandle } from '../../types/constants';
import type { RootNode } from '../../types';
import { PATH_TYPES, type PathType } from '../../types';
import { useMindmapNodeCommon } from '../../hooks/useNodeCommon';
import { BaseNodeBlock, BaseNodeControl } from './BaseNode';
import { Input } from '@/components/ui/input';
import { BaseNodeContent } from '../ui/base-node';
import type { NodeProps } from '@xyflow/react';
import { useNodeManipulationStore, useNodeOperationsStore, useLayoutStore } from '../../stores';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { BezierIcon, SmoothStepIcon, StraightIcon } from '../ui/icon';

const RootNodeBlock = memo(
  ({ ...node }: NodeProps<RootNode>) => {
    const { data, selected: isSelected, width } = node;
    const { layout } = useMindmapNodeCommon<RootNode>({
      node,
    });

    const updateNodeData = useNodeOperationsStore((state) => state.updateNodeDataWithUndo);
    const updateSubtreeLayout = useLayoutStore((state) => state.updateSubtreeLayout);
    const updateSubtreeEdgePathType = useNodeManipulationStore((state) => state.updateSubtreeEdgePathType);

    const [, setIsEditing] = useState(false);

    const handleEditSubmit = useCallback(() => {
      setIsEditing(false);
      const content = data.content || '';
      updateNodeData(node.id, { content });
    }, [data.content, node.id, updateNodeData]);

    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsEditing(false);
      }
    }, []);

    const handleLayoutClick = () => {
      updateSubtreeLayout(node.id, layout);
    };

    const handlePathTypeChange = useCallback(
      (pathType: PathType) => {
        updateSubtreeEdgePathType(node.id, pathType);
      },
      [node.id, updateSubtreeEdgePathType]
    );

    return (
      <BaseNodeBlock node={node} className="border-primary">
        <BaseNodeContent className="flex min-h-full flex-row items-start gap-2 p-0">
          <div className={cn('flex-shrink-0 p-2 pr-0', DragHandle.CLASS)}>
            <GripVertical
              className={cn(
                'h-6 w-5',
                isSelected ? 'opacity-100' : 'opacity-50',
                layout === DIRECTION.NONE ? 'cursor-move' : 'cursor-default'
              )}
            />
          </div>
          <Input
            type="text"
            className="flex-1 cursor-text border-none bg-transparent p-2 pl-0 outline-none"
            style={{
              width: width ? `${width - 40}px` : undefined,
              minWidth: '60px',
            }}
            value={data.content || ''}
            onKeyDown={handleKeyPress}
            onBlur={handleEditSubmit}
            onChange={(e) => updateNodeData(node.id, { content: e.target.value })}
          />
        </BaseNodeContent>

        <BaseNodeControl layout={layout} isSelected={isSelected ?? false}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLayoutClick}
            className="h-6 w-6 p-1"
            title="Update Subtree Layout"
          >
            <Network className="h-3 w-3" />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-1" title="Change Edge Path Type">
                <Workflow className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent side="top" className="w-48 p-2">
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-xs"
                  onClick={() => handlePathTypeChange(PATH_TYPES.SMOOTHSTEP)}
                >
                  <SmoothStepIcon />
                  Smooth Step
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-xs"
                  onClick={() => handlePathTypeChange(PATH_TYPES.BEZIER)}
                >
                  <BezierIcon />
                  Bezier
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-xs"
                  onClick={() => handlePathTypeChange(PATH_TYPES.STRAIGHT)}
                >
                  <StraightIcon />
                  Straight
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </BaseNodeControl>
      </BaseNodeBlock>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if these specific properties change
    return (
      prevProps.id === nextProps.id &&
      prevProps.data === nextProps.data &&
      prevProps.selected === nextProps.selected &&
      prevProps.width === nextProps.width &&
      prevProps.height === nextProps.height
    );
  }
);

export default RootNodeBlock;
