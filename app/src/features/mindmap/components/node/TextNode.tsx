import { Button } from '@/components/ui/button';
import type { TextNode } from '@/features/mindmap/types';
import { DRAGHANDLE } from '@/features/mindmap/types/constants';
import type { NodeProps } from '@xyflow/react';
import { Network } from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';
import { useMindmapPermissionContext } from '../../contexts/MindmapPermissionContext';
import { useCoreStore, useNodeOperationsStore } from '../../stores';
import { useLayoutStore } from '../../stores/layout';
import { BaseNodeControl } from '../controls/BaseNodeControl';
import { BaseNodeContent } from '../ui/base-node';
import { NodeRichTextContent } from '../ui/node-rich-text-content';
import { BaseNodeBlock } from './BaseNode';
import { getTreeLayoutType } from '../../services/utils';

const TextNodeBlock = memo(
  ({ ...node }: NodeProps<TextNode>) => {
    const { data, selected: isSelected, dragging, width, height } = node;

    const { isReadOnly, canEdit } = useMindmapPermissionContext();

    const nodes = useCoreStore((state) => state.nodes);
    const isLayouting = useLayoutStore((state) => state.isLayouting);
    const layoutType = useMemo(() => getTreeLayoutType(nodes), [nodes]);

    const updateNodeData = useNodeOperationsStore((state) => state.updateNodeDataWithUndo);
    const updateSubtreeLayout = useLayoutStore((state) => state.updateSubtreeLayout);

    const handleContentChange = useCallback(
      (content: string) => {
        updateNodeData(node.id, { content });
      },
      [node.id, updateNodeData]
    );

    const handleLayoutClick = () => {
      updateSubtreeLayout(node.id, layoutType);
    };

    return (
      <BaseNodeBlock
        node={node}
        variant="card"
        className={DRAGHANDLE.CLASS}
        style={{ backgroundColor: data.backgroundColor as string }}
      >
        <BaseNodeContent className="flex min-h-full flex-row items-start gap-2 px-4">
          {/* <div className={cn('flex-shrink-0 p-2 pr-0', DRAGHANDLE.CLASS)}>
            <GripVertical className={cn('h-6 w-5', isSelected ? 'opacity-100' : 'opacity-50')} />
          </div> */}
          <style>{`
            .bn-container[data-color-scheme] {
              --bn-colors-editor-background: ${data.backgroundColor} !important;
            }
          `}</style>

          <NodeRichTextContent
            content={data.content}
            isDragging={dragging}
            isLayouting={isLayouting}
            onContentChange={handleContentChange}
            minimalToolbar={true}
            isPresenterMode={isReadOnly}
            style={{
              width: width ? `${width - 40}px` : undefined,
              height: height ? `${height - 16}px` : undefined,
              minWidth: 'fit-content',
              minHeight: 'fit-content',
            }}
          />
        </BaseNodeContent>

        {canEdit && (
          <BaseNodeControl
            layoutType={layoutType}
            selected={isSelected}
            dragging={dragging}
            className="hidden"
          >
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
        )}
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
