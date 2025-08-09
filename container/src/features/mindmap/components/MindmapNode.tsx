import { Plus, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ButtonHandle } from '@/components/button-handle';
import { useState, useEffect, memo } from 'react';
import { Handle, Position, useNodeConnections, type Node, type NodeProps } from '@xyflow/react';
import { BaseNode, BaseNodeContent } from '@/components/base-node';
import { cn } from '@/shared/lib/utils';
import { useMindmap } from '../context/MindmapContext';
import RichTextEditor from '@/shared/components/rte/RichTextEditor';
import { useRichTextEditor } from '@/shared/components/rte/useRichTextEditor';
import { BlockNoteEditor } from '@blocknote/core';
import { DragHandle, type MindMapTypes } from '../constants';
import { AnimatePresence, motion } from 'motion/react';

export type MindMapNode = Node<{
  level: number;
  content: string;
  isDeleting?: boolean;
}> & {
  type: MindMapTypes;
};

const MindMapNodeBlock = memo(({ ...node }: NodeProps<MindMapNode>) => {
  const { data, selected, id } = node;
  const { addChildNode, finalizeNodeDeletion } = useMindmap();
  const [, setIsEditing] = useState(false);
  const [isMouseOver, setIsMouseOver] = useState(false);
  const editor = useRichTextEditor({
    trailingBlock: false,
    placeholders: { default: '', heading: '', emptyBlock: '' },
  });

  const connections = useNodeConnections({ id });

  const canCreateLeft = !connections.some(
    (conn) => conn.sourceHandle === `left-source-${id}` || conn.targetHandle === `left-target-${id}`
  );

  const canCreateRight = !connections.some(
    (conn) => conn.sourceHandle === `right-source-${id}` || conn.targetHandle === `right-target-${id}`
  );

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
    console.log('Content updated:', htmlContent);
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
        key={`mindmap-node-${id}`}
        initial={{ opacity: 0, scale: 0 }}
        animate={data.isDeleting ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        onAnimationComplete={() => {
          if (data.isDeleting) {
            finalizeNodeDeletion(id);
          }
        }}
      >
        <BaseNode
          className={cn(
            `rounded-lg border-2 shadow-md transition-all duration-200`,
            selected ? 'ring-2' : 'ring-0'
          )}
          onMouseEnter={() => setIsMouseOver(true)}
          onMouseLeave={() => setIsMouseOver(false)}
        >
          <BaseNodeContent className="flex flex-row items-stretch gap-2 p-0">
            <div className={cn('p-2 pr-0', DragHandle.CLASS)}>
              <GripVertical
                className={cn(
                  'h-full w-5 cursor-move',
                  isMouseOver || selected ? 'opacity-100' : 'opacity-50'
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
          <ButtonHandle
            type="source"
            position={Position.Left}
            style={{
              opacity: (isMouseOver || selected) && canCreateLeft ? 1 : 0,
              visibility: (isMouseOver || selected) && canCreateLeft ? 'visible' : 'hidden',
            }}
            id={`left-source-${id}`}
          >
            <Button
              onClick={() =>
                addChildNode(
                  node,
                  { x: node.positionAbsoluteX - 250, y: node.positionAbsoluteY },
                  `left-source-${id}`
                )
              }
              disabled={!canCreateLeft}
              size="icon"
              variant="secondary"
              className="cursor-pointer rounded-full"
            >
              <Plus />
            </Button>
          </ButtonHandle>
          <ButtonHandle
            type="source"
            position={Position.Right}
            style={{
              opacity: (isMouseOver || selected) && canCreateRight ? 1 : 0,
              visibility: (isMouseOver || selected) && canCreateRight ? 'visible' : 'hidden',
            }}
            id={`right-source-${id}`}
          >
            <Button
              onClick={() =>
                addChildNode(
                  node,
                  { x: node.positionAbsoluteX + 250, y: node.positionAbsoluteY },
                  `right-source-${id}`
                )
              }
              disabled={!canCreateRight}
              size="icon"
              variant="secondary"
              className="cursor-pointer rounded-full"
            >
              <Plus />
            </Button>
          </ButtonHandle>
          <Handle
            type="target"
            position={Position.Left}
            style={{
              opacity: 0,
            }}
            id={`left-target-${id}`}
          />
          <Handle
            type="target"
            position={Position.Right}
            style={{
              opacity: 0,
            }}
            id={`right-target-${id}`}
          />
        </BaseNode>
      </motion.div>
    </AnimatePresence>
  );
});

export default MindMapNodeBlock;
