import { useState, useCallback } from 'react';
import { useNodeOperationsStore } from '../../stores';
import type { MindMapNode } from '../../types';

interface TreeNodeContentProps {
  node: MindMapNode;
}

export const TreeNodeContent = ({ node }: TreeNodeContentProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(node.data.content as string);
  const updateNodeData = useNodeOperationsStore((state) => state.updateNodeDataWithUndo);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (content !== (node.data.content as string)) {
      updateNodeData(node.id, { content });
    }
  }, [content, node.id, node.data.content, updateNodeData]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContent(node.data.content as string);
        setIsEditing(false);
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleBlur();
      }
    },
    [node.data.content, handleBlur]
  );

  if (isEditing) {
    return (
      <div
        contentEditable
        suppressContentEditableWarning
        dangerouslySetInnerHTML={{ __html: content }}
        onBlur={handleBlur}
        onInput={(e) => setContent(e.currentTarget.innerHTML)}
        onKeyDown={handleKeyDown}
        className="min-w-0 flex-1 px-1 text-sm outline-none"
        autoFocus
      />
    );
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      dangerouslySetInnerHTML={{ __html: node.data.content as string }}
      className="min-w-0 flex-1 cursor-text truncate px-1 text-sm"
      title="Click to edit"
    />
  );
};
