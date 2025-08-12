import { GripVertical } from 'lucide-react';
import { useState, memo } from 'react';
import { type NodeProps } from '@xyflow/react';
import { cn } from '@/shared/lib/utils';
import { DIRECTION, DragHandle } from '../../constants';
import type { RootNode } from '../../types';
import { useMindmapNodeCommon } from '../../hooks/useNodeCommon';
import { BaseNodeBlock } from './BaseNode';
import { Input } from '@/components/ui/input';
import { BaseNodeContent } from '../ui/base-node';

const RootNodeBlock = memo(({ ...node }: NodeProps<RootNode>) => {
  const { data, selected: isSelected } = node;
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

  console.log('RootNodeBlock rendered');

  return (
    <BaseNodeBlock node={node} className="border-primary">
      <BaseNodeContent className="flex flex-row items-stretch gap-2 p-0">
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
          value={data.content || ''}
          onKeyDown={handleKeyPress}
          onBlur={handleEditSubmit}
        />
      </BaseNodeContent>
    </BaseNodeBlock>
  );
});

export default RootNodeBlock;
