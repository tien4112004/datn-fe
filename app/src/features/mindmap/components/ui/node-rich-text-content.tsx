import { useState, useCallback, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { useRichTextEditor } from '@/shared/components/rte/useRichTextEditor';
import RichTextEditor from '@/components/rte/RichTextEditor';
import { cn } from '@/shared/lib/utils';
import { DRAGHANDLE } from '../../types';

interface NodeRichTextContentProps {
  content: string;
  isDragging?: boolean;
  isLayouting?: boolean;
  onContentChange: (content: string) => void;
  className?: string;
  editorClassName?: string;
  minimalToolbar?: boolean;
  style?: React.CSSProperties;
  isPresenterMode?: boolean;
}

export const NodeRichTextContent = ({
  content,
  isDragging = false,
  isLayouting = false,
  onContentChange,
  className = '',
  editorClassName = '',
  minimalToolbar = false,
  style,
  isPresenterMode = false,
}: NodeRichTextContentProps) => {
  const [isEditing, setIsEditing] = useState(false);

  // Only create heavy rich text editor when not dragging/layouting for better performance
  const shouldUseRichEditor = !isDragging && !isLayouting && isEditing;

  const editor = useRichTextEditor({
    trailingBlock: false,
    placeholders: { default: '', heading: '', emptyBlock: '' },
  });

  useEffect(() => {
    if (!shouldUseRichEditor) return;

    async function loadInitialHTML() {
      const blocks = await editor.tryParseHTMLToBlocks(content);
      editor.replaceBlocks(editor.document, blocks);
    }
    loadInitialHTML();
  }, [editor, content, shouldUseRichEditor]);

  const handleEditSubmit = useCallback(async () => {
    setIsEditing(false);
    const htmlContent = await editor.blocksToFullHTML(editor.document);
    onContentChange(htmlContent);
  }, [editor, onContentChange]);

  // Handle blur only if focus moves outside the editor container
  const handleEditorBlur = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      const relatedTarget = e.relatedTarget as Node | null;
      const currentTarget = e.currentTarget;

      // If the new focus target is still within the editor container, don't submit
      if (relatedTarget && currentTarget.contains(relatedTarget)) {
        return;
      }

      handleEditSubmit();
    },
    [handleEditSubmit]
  );

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
    }
  }, []);

  return (
    <div
      className={cn('min-h-full flex-1 p-2 pl-0', !isPresenterMode && 'cursor-text', className)}
      onKeyDown={handleKeyPress}
      onBlur={shouldUseRichEditor ? handleEditorBlur : undefined}
      style={style}
    >
      {shouldUseRichEditor ? (
        <RichTextEditor
          editor={editor}
          sideMenu={false}
          slashMenu={false}
          minimalToolbar={minimalToolbar}
          className={cn(
            `m-0 min-h-[24px] w-full rounded-none border-none ${editorClassName}`,
            DRAGHANDLE.NODRAG_CLASS
          )}
        />
      ) : (
        // Lightweight HTML display during drag operations
        <div
          style={{
            letterSpacing: 'var(--tracking-normal)',
            fontSize: 'inherit',
            fontFamily: 'inherit',
            paddingInline: '1px',
          }}
          className={cn('break-word m-0 min-h-[24px] w-full', !isPresenterMode && 'cursor-text')}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
          onClick={() => !isPresenterMode && setIsEditing(true)}
        />
      )}
    </div>
  );
};

export default NodeRichTextContent;
