import { GripVertical } from 'lucide-react';
import { useState, memo } from 'react';
import { type NodeProps } from '@xyflow/react';
import { cn } from '@/shared/lib/utils';
import { DIRECTION, DragHandle } from '../../types/constants';
import type { RootNode } from '../../types';
import { useMindmapNodeCommon } from '../../hooks/useNodeCommon';
import { BaseNodeBlock } from './BaseNode';
import { Input } from '@/components/ui/input';
import { BaseNodeContent } from '../ui/base-node';

const RootNodeBlock = memo(({ ...node }: NodeProps<RootNode>) => {
  const { data, selected: isSelected, width, height } = node;
  const { isMouseOver, layout } = useMindmapNodeCommon<RootNode>({
    node,
  });

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
    <BaseNodeBlock node={node} className="border-primary">
      <BaseNodeContent className="flex min-h-full flex-row items-start gap-2 p-0">
        <div className={cn('flex-shrink-0 p-2 pr-0', DragHandle.CLASS)}>
          <GripVertical
            className={cn(
              'h-6 w-5',
              isMouseOver || isSelected ? 'opacity-100' : 'opacity-50',
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
});

export default RootNodeBlock;
