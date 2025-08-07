import { Trash2, SquarePen, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ButtonHandle } from '@/components/button-handle';
import { useState } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { BaseNode, BaseNodeContent } from '@/components/base-node';
import { cn } from '@/shared/lib/utils';

type MindMapNodeData = Node<{
  label: string;
  level: number;
}>;

interface MindMapNodeProps extends NodeProps {
  data: MindMapNodeData;
  onCreateChild: (nodeId: string) => void;
}

const MindMapNode = ({ id, data, selected }: NodeProps<MindMapNodeData>) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label);
  const [isMouseOver, setIsMouseOver] = useState(false);

  const handleEditSubmit = () => {
    setIsEditing(false);
    // In a real app, you'd update the node data here
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSubmit();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(data.label);
    }
  };

  return (
    <BaseNode
      className={cn(
        `rounded-lg border-2 p-2 shadow-md transition-all duration-200`,
        selected ? 'ring-1' : 'ring-0'
      )}
      onMouseEnter={() => setIsMouseOver(true)}
      onMouseLeave={() => setIsMouseOver(false)}
    >
      <BaseNodeContent>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <Input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleEditSubmit}
              onKeyDown={handleKeyPress}
              autoFocus
              style={{ minWidth: '120px' }}
            />
          ) : (
            <span className="select-none font-medium">{data.label}</span>
          )}
        </div>
      </BaseNodeContent>
      {data.level !== 1 && (
        <ButtonHandle
          type="source"
          position={Position.Left}
          style={{
            opacity: isMouseOver || selected ? 1 : 0,
          }}
        >
          <Button
            // onClick={() => onCreateChild(id)}
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
      >
        <Button
          //   onClick={() => onCreateChild(id)}
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
      ></Handle>
      <Handle
        type="target"
        position={Position.Right}
        style={{
          opacity: 0,
        }}
      ></Handle>
    </BaseNode>
  );
};

export default MindMapNode;
