import { useState, useCallback, useRef, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { useNodeOperationsStore } from '../../stores';
import type { MindMapNode } from '../../types';

interface TreeNodeContentProps {
  node: MindMapNode;
  onSelect?: () => void;
}

export const TreeNodeContent = ({ node, onSelect }: TreeNodeContentProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(node.data.content as string);
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const updateNodeData = useNodeOperationsStore((state) => state.updateNodeDataWithUndo);

  // Set initial content when entering edit mode
  useEffect(() => {
    if (isEditing && contentEditableRef.current) {
      contentEditableRef.current.innerHTML = node.data.content as string;
      setContent(node.data.content as string);
      // Focus and move cursor to the end
      contentEditableRef.current.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      if (contentEditableRef.current.childNodes.length > 0) {
        range.selectNodeContents(contentEditableRef.current);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  }, [isEditing, node.data.content]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (content !== (node.data.content as string)) {
      updateNodeData(node.id, { content });
    }
  }, [content, node.id, node.data.content, updateNodeData]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setContent(node.data.content as string);
        setIsEditing(false);
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        setIsEditing(false);
        handleBlur();
      }
    },
    [node.data.content, handleBlur]
  );

  if (isEditing) {
    return (
      <div
        ref={contentEditableRef}
        contentEditable
        suppressContentEditableWarning
        onBlur={handleBlur}
        onInput={(e) => setContent(e.currentTarget.innerHTML)}
        onKeyDown={handleKeyDown}
        className="min-w-0 flex-1 px-1.5 text-sm outline-none"
      />
    );
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(); // Select node first
        setIsEditing(true); // Then enter edit mode
      }}
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(node.data.content as string) }}
      className="min-w-0 flex-1 cursor-text break-words px-1.5 text-sm leading-tight"
      title={`${node.data.content as string} (Click to edit)`}
    />
  );
};
