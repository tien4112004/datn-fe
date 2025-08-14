import { GripVertical } from 'lucide-react';
import { useState, memo, useCallback } from 'react';
import { cn } from '@/shared/lib/utils';
import { DIRECTION, DragHandle } from '../../types/constants';
import type { RootNode } from '../../types';
import { useMindmapNodeCommon } from '../../hooks/useNodeCommon';
import { BaseNodeBlock } from './BaseNode';
import { Input } from '@/components/ui/input';
import { BaseNodeContent } from '../ui/base-node';
import type { NodeProps } from '@xyflow/react';

const RootNodeBlock = memo(
  ({ ...node }: NodeProps<RootNode>) => {
    const { data, selected: isSelected, width } = node;
    const { layout, updateNodeData } = useMindmapNodeCommon<RootNode>({
      node,
    });

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
          />
        </BaseNodeContent>
      </BaseNodeBlock>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if these specific properties change
    return (
      prevProps.id === nextProps.id &&
      prevProps.data.content === nextProps.data.content &&
      prevProps.selected === nextProps.selected &&
      prevProps.width === nextProps.width &&
      prevProps.height === nextProps.height &&
      prevProps.data.isDeleting === nextProps.data.isDeleting
    );
  }
);

export default RootNodeBlock;
