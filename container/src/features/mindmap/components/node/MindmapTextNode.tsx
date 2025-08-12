import { Plus, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, memo } from 'react';
import { Position, type NodeProps } from '@xyflow/react';
import { cn } from '@/shared/lib/utils';
import RichTextEditor from '@/shared/components/rte/RichTextEditor';
import { useRichTextEditor } from '@/shared/components/rte/useRichTextEditor';
import { BlockNoteEditor } from '@blocknote/core';
import { DIRECTION, DragHandle } from '../../constants';
import type { MindMapTextNode } from '../../types';
import { BaseHandle } from '@/features/mindmap/components/ui/base-handle';
import { useMindmapNodeCommon } from '../../hooks/useMindmapNodeCommon';
import { MindmapNodeBase } from './MindmapNodeBase';
import { BaseNodeContent } from '../ui/base-node';

const MindMapTextNodeBlock = memo(({ ...node }: NodeProps<MindMapTextNode>) => {
  const {
    isMouseOver,
    setIsMouseOver,
    layout,
    isLayouting,
    addChildNode,
    finalizeNodeDeletion,
    canCreateLeft,
    canCreateRight,
    nodeId,
    nodeData,
    isSelected,
  } = useMindmapNodeCommon<MindMapTextNode>({ node });

  const [, setIsEditing] = useState(false);
  const editor = useRichTextEditor({
    trailingBlock: false,
    placeholders: { default: '', heading: '', emptyBlock: '' },
  });

  useEffect(() => {
    async function loadInitialHTML() {
      const blocks = await editor.tryParseHTMLToBlocks(nodeData.content);
      editor.replaceBlocks(editor.document, blocks);
    }
    loadInitialHTML();
  }, [editor, nodeData.content]);

  const handleContentChange = async (editor: BlockNoteEditor) => {
    // In a real app, you'd update the node data here
    const htmlContent = await editor.blocksToFullHTML(editor.document);
    htmlContent;
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
    <MindmapNodeBase
      nodeId={nodeId}
      nodeData={nodeData}
      isSelected={isSelected}
      isLayouting={isLayouting}
      isMouseOver={isMouseOver}
      onMouseEnter={() => setIsMouseOver(true)}
      onMouseLeave={() => setIsMouseOver(false)}
      onAnimationComplete={finalizeNodeDeletion}
      variant="card"
    >
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

      {/* Add Child Buttons */}
      <Button
        onClick={() =>
          addChildNode(
            node,
            { x: node.positionAbsoluteX - 250, y: node.positionAbsoluteY },
            `first-source-${nodeId}`
          )
        }
        disabled={!canCreateLeft}
        size="icon"
        variant="outline"
        className={cn(
          'bg-accent absolute z-[1000] cursor-pointer rounded-full transition-all duration-200',
          (isMouseOver || isSelected) && canCreateLeft ? 'visible opacity-100' : 'invisible opacity-0',
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
            `second-source-${nodeId}`
          )
        }
        disabled={!canCreateRight}
        size="icon"
        variant="outline"
        className={cn(
          'bg-accent absolute z-[1000] cursor-pointer rounded-full transition-all duration-200',
          (isMouseOver || isSelected) && canCreateRight ? 'visible opacity-100' : 'invisible opacity-0',
          layout === DIRECTION.VERTICAL
            ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-[calc(100%+24px)]'
            : 'right-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%+24px)]'
        )}
      >
        <Plus />
      </Button>

      {/* Connection Handles */}
      <BaseHandle
        type="source"
        position={layout === DIRECTION.VERTICAL ? Position.Top : Position.Left}
        style={{ visibility: 'hidden' }}
        id={`first-source-${nodeId}`}
      />
      <BaseHandle
        type="source"
        position={layout === DIRECTION.VERTICAL ? Position.Bottom : Position.Right}
        style={{ visibility: 'hidden' }}
        id={`second-source-${nodeId}`}
      />
      <BaseHandle
        type="target"
        position={layout === DIRECTION.VERTICAL ? Position.Top : Position.Left}
        style={{ visibility: 'hidden' }}
        id={`first-target-${nodeId}`}
      />
      <BaseHandle
        type="target"
        position={layout === DIRECTION.VERTICAL ? Position.Bottom : Position.Right}
        style={{ visibility: 'hidden' }}
        id={`second-target-${nodeId}`}
      />
    </MindmapNodeBase>
  );
});

export default MindMapTextNodeBlock;
