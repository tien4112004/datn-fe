import { Trash2, SquarePen, Plus, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ButtonHandle } from '@/components/button-handle';
import { useState, useEffect } from 'react';
import { Background, Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { BaseNode, BaseNodeContent } from '@/components/base-node';
import { cn } from '@/shared/lib/utils';
import { useMindmap } from '../context/MindmapContext';
import RichTextEditor from '@/shared/components/rte/RichTextEditor';
import { useRichTextEditor } from '@/shared/components/rte/useRichTextEditor';
import { BlockNoteEditor } from '@blocknote/core';

export type MindMapNodeData = Node<{
  label: string;
  level: number;
  htmlContent?: string;
}>;

interface MindMapNodeProps extends NodeProps {
  data: MindMapNodeData;
  onCreateChild: (nodeId: string) => void;
}

const MindMapNode = ({ ...node }: NodeProps<MindMapNodeData>) => {
  const { data, selected, id } = node;
  const { addChildNode } = useMindmap();
  const [isEditing, setIsEditing] = useState(false);
  const [isMouseOver, setIsMouseOver] = useState(false);
  const editor = useRichTextEditor({
    trailingBlock: false,
    placeholders: {
      default: '',
    },
  });

  useEffect(() => {
    async function loadInitialHTML() {
      const htmlContent = data.htmlContent || `<p>${data.label}</p>`;
      const blocks = await editor.tryParseHTMLToBlocks(htmlContent);
      editor.replaceBlocks(editor.document, blocks);
    }
    loadInitialHTML();
  }, [editor, data.htmlContent, data.label]);

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
    <BaseNode
      className={cn(
        `rounded-lg border-2 shadow-md transition-all duration-200`,
        selected ? 'ring-1' : 'ring-0'
      )}
      onMouseEnter={() => setIsMouseOver(true)}
      onMouseLeave={() => setIsMouseOver(false)}
    >
      <BaseNodeContent className="flex flex-row items-stretch gap-2 p-0">
        <div className="dragHandle p-2 pr-0">
          <GripVertical
            className={cn('h-full w-5 cursor-move', isMouseOver || selected ? 'opacity-100' : 'opacity-50')}
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
      {data.level === 0 && (
        <ButtonHandle
          type="source"
          position={Position.Left}
          style={{
            opacity: isMouseOver || selected ? 1 : 0,
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
            size="icon"
            variant="secondary"
            className="cursor-pointer rounded-full"
          >
            <Plus />
          </Button>
        </ButtonHandle>
      )}
      <ButtonHandle
        type="source"
        position={Position.Right}
        style={{
          opacity: isMouseOver || selected ? 1 : 0,
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
  );
};

export default MindMapNode;
