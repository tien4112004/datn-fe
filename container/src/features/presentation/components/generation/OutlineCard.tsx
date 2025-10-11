import RichTextEditor from '@/shared/components/rte/RichTextEditor';
import { useRichTextEditor } from '@/shared/components/rte/useRichTextEditor';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { Trash } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import useOutlineStore from '@/features/presentation/stores/useOutlineStore';
import { motion } from 'motion/react';

interface OutlineCardProps {
  id: string;
  title: string;
  className?: string;
  onDelete?: (id: string) => void;
}

const OutlineCard = ({ id, title = 'Outline', className = '', onDelete }: OutlineCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [displayHtml, setDisplayHtml] = useState('');
  const [parsedBlocks, setParsedBlocks] = useState<any[] | null>(null);
  const isStreaming = useOutlineStore((state) => state.isStreaming);

  const editingId = useOutlineStore((state) => state.editingId);
  const setEditingId = useOutlineStore((state) => state.setEditingId);
  const handleMarkdownChange = useOutlineStore((state) => state.handleMarkdownChange);
  const isEditing = editingId === id;
  const content = useOutlineStore((state) => state.outlines.find((item) => item.id === id));

  // Track if we've loaded initial content to prevent re-loading
  const hasLoadedContentRef = useRef(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `outline-card-${id.toString()}`,
  });

  const editor = useRichTextEditor({
    trailingBlock: false,
  });

  // FLOW 1: Load markdown into editor blocks on mount and when markdown changes (streaming)
  useEffect(() => {
    if (!editor || !content?.markdownContent) return;
    if (isEditing) return; // Don't reload while editing to preserve cursor

    const loadContent = async () => {
      try {
        // Try to parse the markdown with additional checks
        const blocks = await editor.tryParseMarkdownToBlocks(content.markdownContent);

        // Store parsed blocks for HTML generation
        setParsedBlocks(blocks);

        editor.replaceBlocks(editor.document, blocks);
        hasLoadedContentRef.current = true;
      } catch (error) {
        console.error('Failed to load markdown to editor:', error);
      }
    };

    // Load content initially or when streaming updates markdown
    if (!hasLoadedContentRef.current || isStreaming) {
      loadContent();
    }
  }, [content?.markdownContent, editor, isStreaming, isEditing]);

  // FLOW 2: Generate HTML from parsed blocks for display when not editing
  useEffect(() => {
    if (isEditing || !editor || !parsedBlocks) return;

    const generateHtml = async () => {
      try {
        // Generate HTML directly from parsed blocks, not from editor.document
        const html = await editor.blocksToFullHTML(parsedBlocks);
        setDisplayHtml(html);
      } catch (error) {
        console.error('Failed to generate HTML from editor blocks:', error);
      }
    };

    // Generate HTML when exiting edit mode or when parsed blocks change
    generateHtml();
  }, [isEditing, editor, parsedBlocks]);

  // FLOW 3: Ensure blocks are loaded when entering edit mode
  useEffect(() => {
    if (isEditing && editor && parsedBlocks && parsedBlocks.length > 0) {
      // Always reload blocks when entering edit mode to ensure they're present
      editor.replaceBlocks(editor.document, parsedBlocks);

      setTimeout(() => {
        editor.focus();
      }, 0);
    }
  }, [isEditing, editor, parsedBlocks]);

  const handleDelete = () => {
    if (!onDelete) return;

    setIsDeleting(true);
    setTimeout(() => {
      onDelete(id);
    }, 300);
  };

  const handleEditingComplete = () => {
    setEditingId('');
  };

  // FLOW 4: Save editor blocks as markdown when editing
  const handleEditorChange = useCallback(async () => {
    if (isStreaming) return; // Don't update during streaming

    try {
      // Convert editor blocks to markdown and save to store
      const blocks = editor.document;
      const markdown = await editor.blocksToMarkdownLossy(blocks);
      handleMarkdownChange(id, markdown);
    } catch (error) {
      console.error('Failed to convert blocks to markdown:', error);
    }
  }, [editor, handleMarkdownChange, id, isStreaming]);
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        `outline-card border-primary group relative flex w-full cursor-pointer flex-row gap-4 p-0 pr-6 shadow-md transition-shadow duration-300 hover:shadow-lg`,
        isDragging ? 'z-1000 opacity-50' : '',
        isDeleting ? 'scale-0 transition-all' : '',
        isEditing ? 'border-2' : '',
        isStreaming ? 'pointer-events-none select-none opacity-80' : '',
        className
      )}
      onClick={() => {
        setEditingId(id);
      }}
      onBlur={handleEditingComplete}
    >
      {onDelete && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="absolute right-2 top-2 z-10 h-8 w-8 p-0 text-gray-400 opacity-0 transition-opacity duration-200 hover:bg-transparent hover:text-red-500 group-hover:opacity-100"
        >
          <motion.div
            whileHover={{
              scale: 1.1,
              rotate: -10,
            }}
          >
            <Trash className="h-4 w-4" />
          </motion.div>
        </Button>
      )}

      <CardHeader {...attributes} {...listeners} className="bg-accent w-24 rounded-l-xl p-2 text-center">
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent className={cn('flex-1 p-2')}>
        {isEditing ? (
          <RichTextEditor
            data-card
            editor={editor}
            onChange={handleEditorChange}
            onBlur={handleEditingComplete}
            sideMenu={false}
            className="-mx-2"
          />
        ) : (
          <div
            style={{
              letterSpacing: 'var(--tracking-normal)',
              fontSize: 'inherit',
              fontFamily: 'inherit',
              paddingInline: '1px',
            }}
            dangerouslySetInnerHTML={{ __html: displayHtml }}
            className="break-word -mx-2 cursor-text rounded transition-colors"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setEditingId(id);
              }
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default OutlineCard;
