import { GripVertical } from 'lucide-react';
import { useCallback, memo } from 'react';
import { cn } from '@/shared/lib/utils';
import { DIRECTION, DRAGHANDLE } from '@/features/mindmap/types/constants';
import type { TextNode } from '@/features/mindmap/types';
import { BaseNodeBlock } from './BaseNode';
import { BaseNodeContent } from '../ui/base-node';
import { useMindmapNodeCommon } from '../../hooks';
import type { NodeProps } from '@xyflow/react';
import { useNodeOperationsStore } from '../../stores';
import { useLayoutStore } from '../../stores/layout';
import { Button } from '@/components/ui/button';
import { Network } from 'lucide-react';
import { BaseNodeControl } from '../controls/BaseNodeControl';
import { NodeRichTextContent } from '../ui/node-rich-text-content';

const TextNodeBlock = memo(
  ({ ...node }: NodeProps<TextNode>) => {
    const { data, selected: isSelected, dragging } = node;

    const { layout, isLayouting } = useMindmapNodeCommon<TextNode>({
      node,
    });

    const updateNodeData = useNodeOperationsStore((state) => state.updateNodeDataWithUndo);
    const updateSubtreeLayout = useLayoutStore((state) => state.updateSubtreeLayout);

    const handleContentChange = useCallback(
      (content: string) => {
        updateNodeData(node.id, { content });
      },
      [node.id, updateNodeData]
    );

    const handleLayoutClick = () => {
      updateSubtreeLayout(node.id, layout);
    };

    return (
      <BaseNodeBlock node={node} variant="card">
        <BaseNodeContent className="flex min-h-full flex-row items-start gap-2 p-0">
          <div className={cn('flex-shrink-0 p-2 pr-0', DRAGHANDLE.CLASS)}>
            <GripVertical
              className={cn(
                'h-6 w-5',
                isSelected ? 'opacity-100' : 'opacity-50',
                layout === DIRECTION.NONE ? 'cursor-move' : 'cursor-default'
              )}
            />
          </div>
          <NodeRichTextContent
            content={data.content}
            isDragging={dragging}
            isLayouting={isLayouting}
            onContentChange={handleContentChange}
            minimalToolbar={true}
          />
        </BaseNodeContent>

        <BaseNodeControl layout={layout} selected={isSelected} dragging={dragging}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLayoutClick}
            className="h-6 w-6 p-1"
            title="Update Subtree Layout"
          >
            <Network className="h-3 w-3" />
          </Button>
        </BaseNodeControl>
      </BaseNodeBlock>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.id === nextProps.id &&
      prevProps.data === nextProps.data &&
      prevProps.selected === nextProps.selected &&
      prevProps.dragging === nextProps.dragging &&
      prevProps.width === nextProps.width &&
      prevProps.height === nextProps.height
    );
  }
);

export default TextNodeBlock;
