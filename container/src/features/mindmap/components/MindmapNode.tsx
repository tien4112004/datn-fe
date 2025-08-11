import { Plus, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, memo } from 'react';
import { Position, useNodeConnections, useUpdateNodeInternals, type NodeProps } from '@xyflow/react';
import { BaseNode, BaseNodeContent } from '@/components/base-node';
import { cn } from '@/shared/lib/utils';
import { useMindmapStore } from '../stores/useMindmapStore';
import RichTextEditor from '@/shared/components/rte/RichTextEditor';
import { useRichTextEditor } from '@/shared/components/rte/useRichTextEditor';
import { BlockNoteEditor } from '@blocknote/core';
import { DIRECTION, DragHandle } from '../constants';
import { AnimatePresence, motion } from 'motion/react';
import type { MindMapNode } from '../types';
import { BaseHandle } from '@/shared/components/base-handle';
import { useLayoutStore } from '../stores/useLayoutStore';

const MindMapNodeBlock = memo(({ ...node }: NodeProps<MindMapNode>) => {
  const { data, selected, id } = node;
  const addChildNode = useMindmapStore((state) => state.addChildNode);
  const finalizeNodeDeletion = useMindmapStore((state) => state.finalizeNodeDeletion);
  const layout = useLayoutStore((state) => state.layout);
  const isLayouting = useLayoutStore((state) => state.isLayouting);
  const updateNodeInternals = useUpdateNodeInternals();
  const [, setIsEditing] = useState(false);
  const [isMouseOver, setIsMouseOver] = useState(false);
  const editor = useRichTextEditor({
    trailingBlock: false,
    placeholders: { default: '', heading: '', emptyBlock: '' },
  });

  const connections = useNodeConnections({ id });

  useEffect(() => {
    updateNodeInternals(id);
  }, [layout, isLayouting]);

  const canCreateLeft =
    !connections.some(
      (conn) => conn.sourceHandle === `first-source-${id}` || conn.targetHandle === `first-target-${id}`
    ) || node.data.level === 0;

  //   const canCreateRight =
  //     !connections.some(
  //       (conn) => conn.sourceHandle === `second-source-${id}` || conn.targetHandle === `second-target-${id}`
  //     ) || node.data.level === 0;

  const canCreateRight = true; // Temporarily allow right connections for simplicity

  useEffect(() => {
    async function loadInitialHTML() {
      const blocks = await editor.tryParseHTMLToBlocks(data.content);
      editor.replaceBlocks(editor.document, blocks);
    }
    loadInitialHTML();
  }, [editor, data.content]);

  const handleContentChange = async (editor: BlockNoteEditor) => {
    // In a real app, you'd update the node data here
    const htmlContent = await editor.blocksToFullHTML(editor.document);
  };

  const handleEditSubmit = () => {
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key={id}
        initial={{ opacity: 0, scale: 0 }}
        animate={data.isDeleting ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], type: 'tween' }}
        onAnimationComplete={() => {
          if (data.isDeleting) {
            finalizeNodeDeletion();
          }
        }}
      >
        <BaseNode
          className={cn(
            `rounded-lg border-2 shadow-md`,
            selected ? 'ring-2' : 'ring-0',
            isLayouting && 'shadow-lg ring-2 ring-blue-300'
          )}
          onMouseEnter={() => setIsMouseOver(true)}
          onMouseLeave={() => setIsMouseOver(false)}
        >
          <BaseNodeContent className="flex flex-row items-stretch gap-2 p-0">
            <div className={cn('p-2 pr-0', DragHandle.CLASS)}>
              <GripVertical
                className={cn(
                  'h-full w-5',
                  isMouseOver || selected ? 'opacity-100' : 'opacity-50',
                  layout === DIRECTION.NONE ? 'cursor-move' : 'cursor-default'
                )}
              />
            </div>
            <div className="min-w-[100px] max-w-[300px] cursor-text p-2 pl-0" onKeyDown={handleKeyPress}>
              <RichTextEditor
                editor={editor}
                onChange={handleContentChange}
                sideMenu={false}
                slashMenu={false}
                className="m-0 min-h-[24px] border-none p-0"
                onBlur={handleEditSubmit}
              />
            </div>
          </BaseNodeContent>

          <Button
            onClick={() =>
              addChildNode(
                node,
                { x: node.positionAbsoluteX - 250, y: node.positionAbsoluteY },
                `first-source-${id}`
              )
            }
            disabled={!canCreateLeft}
            size="icon"
            variant="outline"
            className={cn(
              'bg-accent absolute z-[1000] cursor-pointer rounded-full transition-all duration-200',
              (isMouseOver || selected) && canCreateLeft ? 'visible opacity-100' : 'invisible opacity-0',
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
                `second-source-${id}`
              )
            }
            disabled={!canCreateRight}
            size="icon"
            variant="outline"
            className={cn(
              'bg-accent absolute z-[1000] cursor-pointer rounded-full transition-all duration-200',
              (isMouseOver || selected) && canCreateRight ? 'visible opacity-100' : 'invisible opacity-0',
              layout === DIRECTION.VERTICAL
                ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-[calc(100%+24px)]'
                : 'right-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%+24px)]'
            )}
          >
            <Plus />
          </Button>

          {/* Hub contents */}
          <div
            className={cn(
              layout === DIRECTION.VERTICAL
                ? 'right-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%+24px)] flex-col'
                : 'left-1/2 top-0 -translate-x-1/2 -translate-y-[calc(100%+24px)] flex-row',
              'bg-muted absolute z-[1000] flex items-center justify-center gap-1 rounded-sm transition-all duration-200',
              selected ? 'visible opacity-100' : 'invisible opacity-0'
            )}
          >
            <button className="hover:bg-accent cursor-pointer rounded-sm p-1">
              <Plus className="h-3 w-3" />
            </button>
            <button className="hover:bg-accent cursor-pointer rounded-sm p-1">
              <Plus className="h-3 w-3" />
            </button>
            <button className="hover:bg-accent cursor-pointer rounded-sm p-1">
              <Plus className="h-3 w-3" />
            </button>
          </div>

          {/* Invisible handles for connections */}
          <BaseHandle
            type="source"
            position={layout === DIRECTION.VERTICAL ? Position.Top : Position.Left}
            style={{ visibility: 'hidden' }}
            id={`first-source-${id}`}
          />
          <BaseHandle
            type="source"
            position={layout === DIRECTION.VERTICAL ? Position.Bottom : Position.Right}
            style={{ visibility: 'hidden' }}
            id={`second-source-${id}`}
          />
          <BaseHandle
            type="target"
            position={layout === DIRECTION.VERTICAL ? Position.Top : Position.Left}
            style={{ visibility: 'hidden' }}
            id={`first-target-${id}`}
          />
          <BaseHandle
            type="target"
            position={layout === DIRECTION.VERTICAL ? Position.Bottom : Position.Right}
            style={{ visibility: 'hidden' }}
            id={`second-target-${id}`}
          />
        </BaseNode>
      </motion.div>
    </AnimatePresence>
  );
});

export default MindMapNodeBlock;
