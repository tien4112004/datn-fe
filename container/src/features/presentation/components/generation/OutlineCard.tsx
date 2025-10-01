import RichTextEditor from '@/shared/components/rte/RichTextEditor';
import { useRichTextEditor } from '@/shared/components/rte/useRichTextEditor';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { Trash } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
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
  const [isEditing, setIsEditing] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');

  const handleContentChange = useOutlineStore((state) => state.handleOutlineChange);
  const content = useOutlineStore((state) => state.outlines.find((item) => item.id === id));

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `outline-card-${id.toString()}`,
  });

  const editor = useRichTextEditor({
    trailingBlock: false,
  });

  // Convert markdown to HTML for display
  const convertMarkdownToHtml = useCallback(
    async (markdownContent: string) => {
      if (!markdownContent) {
        setHtmlContent('');
        return;
      }

      try {
        const blocks = await editor.tryParseMarkdownToBlocks(markdownContent);
        const html = await editor.blocksToFullHTML(blocks);
        setHtmlContent(html);
      } catch (error) {
        console.error('Failed to convert markdown to HTML:', error);
        setHtmlContent('');
      }
    },
    [editor]
  );

  // Load initial content into editor (only when editing)
  const loadInitialHTML = useCallback(async () => {
    try {
      const blocks = await editor.tryParseMarkdownToBlocks(content?.markdownContent || '');
      editor.replaceBlocks(editor.document, blocks);
    } catch (error) {
      console.error('Failed to load initial HTML:', error);
    }
  }, [editor, content?.markdownContent]);

  // Convert markdown to HTML when content changes (for display mode)
  useEffect(() => {
    if (!isEditing) {
      convertMarkdownToHtml(content?.markdownContent || '');
    }
  }, [content?.markdownContent, isEditing, convertMarkdownToHtml]);

  // Initialize editor content when entering edit mode
  useEffect(() => {
    if (isEditing) {
      loadInitialHTML();
    }
  }, [isEditing, loadInitialHTML]);

  const handleDelete = () => {
    if (!onDelete) return;

    setIsDeleting(true);
    setTimeout(() => {
      onDelete(id);
    }, 300);
  };

  const handleEditingComplete = () => {
    setIsEditing(false);
  };

  const handleEditorChange = useCallback(async () => {
    try {
      const markdownContent = await editor.blocksToMarkdownLossy(editor.document);
      handleContentChange?.(id, markdownContent);
    } catch (error) {
      console.error('Failed to convert blocks to markdown:', error);
    }
  }, [editor, handleContentChange, id]);

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        `border-primary group relative flex min-h-24 w-full flex-row gap-4 p-0 pr-6 shadow-md transition-shadow duration-300 hover:shadow-lg`,
        isDragging ? 'z-1000 opacity-50' : '',
        isDeleting ? 'scale-0 transition-all' : '',
        isEditing ? 'border-2' : '',
        className
      )}
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

      <CardContent className={cn('flex-start flex-1 p-2')}>
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
            dangerouslySetInnerHTML={{ __html: htmlContent }}
            onClick={() => setIsEditing(true)}
            className="-mx-2 cursor-text rounded transition-colors"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsEditing(true);
              }
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default OutlineCard;
