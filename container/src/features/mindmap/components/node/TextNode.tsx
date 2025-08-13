import { GripVertical } from 'lucide-react';
import { useState, useEffect, memo } from 'react';
import { type NodeProps } from '@xyflow/react';
import { cn } from '@/shared/lib/utils';
import RichTextEditor from '@/shared/components/rte/RichTextEditor';
import { useRichTextEditor } from '@/shared/components/rte/useRichTextEditor';
import { BlockNoteEditor } from '@blocknote/core';
import { DIRECTION, DragHandle } from '@/features/mindmap/types/constants';
import type { TextNode } from '@/features/mindmap/types';
import { BaseNodeBlock } from './BaseNode';
import { BaseNodeContent } from '../ui/base-node';
import { useMindmapNodeCommon } from '../../hooks';

const TextNodeBlock = memo(({ ...node }: NodeProps<TextNode>) => {
  const { data, selected: isSelected, width, height } = node;
  const { isMouseOver, layout } = useMindmapNodeCommon<TextNode>({
    node,
  });

  const [, setIsEditing] = useState(false);

  const editor = useRichTextEditor({
    trailingBlock: false,
    placeholders: { default: '', heading: '', emptyBlock: '' },
  });

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
    <BaseNodeBlock node={node} variant="card">
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
        <div
          className="min-h-full flex-1 cursor-text p-2 pl-0"
          style={{
            width: width ? `${width - 40}px` : undefined,
            minWidth: '60px',
          }}
          onKeyDown={handleKeyPress}
        >
          <RichTextEditor
            editor={editor}
            onChange={handleContentChange}
            sideMenu={false}
            slashMenu={false}
            className="m-0 min-h-[24px] w-full border-none p-0"
            onBlur={handleEditSubmit}
          />
        </div>
      </BaseNodeContent>
    </BaseNodeBlock>
  );
});

export default TextNodeBlock;
