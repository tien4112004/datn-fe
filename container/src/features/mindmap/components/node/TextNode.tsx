import { GripVertical } from 'lucide-react';
import { useState, useEffect, useCallback, memo } from 'react';
import { cn } from '@/shared/lib/utils';
import { useRichTextEditor } from '@/shared/components/rte/useRichTextEditor';
import { DIRECTION, DRAGHANDLE } from '@/features/mindmap/types/constants';
import type { TextNode } from '@/features/mindmap/types';
import { BaseNodeBlock } from './BaseNode';
import { BaseNodeContent } from '../ui/base-node';
import { useMindmapNodeCommon } from '../../hooks';
import type { NodeProps } from '@xyflow/react';
import { useUpdateNodeInternals } from '@xyflow/react';
import RichTextEditor from '@/components/rte/RichTextEditor';
import { useNodeOperationsStore } from '../../stores';
import { useLayoutStore } from '../../stores/layout';
import { Button } from '@/components/ui/button';
import { Network } from 'lucide-react';
import { BaseNodeControl } from '../controls/BaseNodeControl';

const TextNodeBlock = memo(
  ({ ...node }: NodeProps<TextNode>) => {
    const { data, selected: isSelected, width, dragging } = node;

    const { layout, isLayouting } = useMindmapNodeCommon<TextNode>({
      node,
    });

    const updateNodeData = useNodeOperationsStore((state) => state.updateNodeDataWithUndo);
    const updateSubtreeLayout = useLayoutStore((state) => state.updateSubtreeLayout);
    const updateNodeInternals = useUpdateNodeInternals();

    const [isEditing, setIsEditing] = useState(false);

    // Only create heavy rich text editor when not dragging/layouting for better performance
    const shouldUseRichEditor = !dragging && !isLayouting && isEditing;

    const editor = useRichTextEditor({
      trailingBlock: false,
      placeholders: { default: '', heading: '', emptyBlock: '' },
    });

    useEffect(() => {
      if (!shouldUseRichEditor) return;

      async function loadInitialHTML() {
        const blocks = await editor.tryParseHTMLToBlocks(data.content);
        editor.replaceBlocks(editor.document, blocks);
      }
      loadInitialHTML();
    }, [editor, data.content, shouldUseRichEditor]);

    const handleEditSubmit = useCallback(async () => {
      setIsEditing(false);
      const htmlContent = await editor.blocksToFullHTML(editor.document);
      updateNodeData(node.id, { content: htmlContent });
    }, [editor, node.id, updateNodeData]);

    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsEditing(false);
      }
    }, []);

    const handleLayoutClick = () => {
      updateSubtreeLayout(node.id, layout, updateNodeInternals);
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
          <div
            className="min-h-full flex-1 cursor-text p-2 pl-0"
            style={{
              width: width ? `${width - 40}px` : undefined,
              minWidth: '60px',
            }}
            onKeyDown={handleKeyPress}
          >
            {shouldUseRichEditor ? (
              <RichTextEditor
                editor={editor}
                sideMenu={false}
                slashMenu={false}
                className="m-0 min-h-[24px] w-full border-none p-0"
                onBlur={handleEditSubmit}
              />
            ) : (
              // Lightweight HTML display during drag operations
              <div
                className="m-0 min-h-[24px] w-full cursor-text p-0"
                dangerouslySetInnerHTML={{ __html: data.content }}
                onClick={() => setIsEditing(true)}
              />
            )}
          </div>
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
