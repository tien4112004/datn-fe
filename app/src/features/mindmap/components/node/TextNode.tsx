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
import { DEFAULT_LAYOUT_TYPE } from '../../services/utils';

const TextNodeBlock = memo(
  ({ ...node }: NodeProps<TextNode>) => {
    const { data, selected: isSelected, dragging, width, height } = node;

    const { isReadOnly, canEdit } = useMindmapPermissionContext();

    const isLayouting = useLayoutStore((state) => state.isLayouting);

    // Use cached layout type map instead of searching through all nodes
    // This avoids subscribing to the full nodes array on every component instance
    const layoutType = useMemo(() => {
      const rootId = useCoreStore.getState().nodeToRootMap.get(node.id);
      if (!rootId) return DEFAULT_LAYOUT_TYPE;
      return useCoreStore.getState().rootLayoutTypeMap.get(rootId) || DEFAULT_LAYOUT_TYPE;
    }, [node.id]);

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

          <NodeRichTextContent
            content={data.content}
            isDragging={dragging}
            isLayouting={isLayouting}
            onContentChange={handleContentChange}
            minimalToolbar={true}
            isPresenterMode={isReadOnly}
            style={{
              minWidth: 'fit-content',
              minHeight: 'fit-content',
              // @ts-ignore - Custom CSS variable for editor background
              '--bn-colors-editor-background': data.backgroundColor,
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
