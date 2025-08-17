import RichTextEditor from '@/shared/components/rte/RichTextEditor';
import { useRichTextEditor } from '@/shared/components/rte/useRichTextEditor';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { Trash } from 'lucide-react';
import React from 'react';
import useOutlineStore from '@/features/presentation/stores/useOutlineStore';
// import { useOutlineContext } from '../../context/OutlineContext';

interface OutlineCardProps {
  id: string;
  title: string;
  className?: string;
  onDelete?: () => void;
}

const OutlineCard = ({ id, title = 'Outline', className = '', onDelete }: OutlineCardProps) => {
  const [isDeleting, setIsDeleting] = React.useState(false);
  // const { handleContentChange } = useOutlineContext();
  const handleContentChange = useOutlineStore((state) => state.handleContentChange);
  const content = useOutlineStore((state) => state.content.find((item) => item.id === id));
  const isStreaming = useOutlineStore((state) => state.isStreaming);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `outline-card-${id.toString()}`,
  });
  const editor = useRichTextEditor({
    trailingBlock: false,
  });
  const hasInitialized = React.useRef(false);

  async function loadInitialHTML() {
    const blocks = await editor.tryParseMarkdownToBlocks(content?.markdownContent || '');
    editor.replaceBlocks(editor.document, blocks);
  }

  React.useEffect(() => {
    if (isStreaming || !content || !hasInitialized.current) {
      loadInitialHTML();
      hasInitialized.current = true;
    }
  }, [content?.markdownContent]);

  React.useEffect(() => {
    loadInitialHTML();
  }, [editor]);

  const handleDelete = () => {
    if (!onDelete) return;

    setIsDeleting(true);
    setTimeout(() => {
      onDelete();
    }, 300);
  };

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        `border-primary group relative flex min-h-24 w-full flex-row gap-4 p-0 shadow-md transition-shadow duration-300 hover:shadow-lg`,
        isDragging ? 'z-1000 opacity-50' : '',
        isDeleting ? 'scale-0 transition-all' : '',
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
          <Trash className="h-4 w-4" />
        </Button>
      )}
      <CardHeader {...attributes} {...listeners} className="bg-accent w-24 rounded-l-xl p-2 text-center">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-start flex-1 p-2">
        <RichTextEditor
          data-card
          editor={editor}
          onChange={async () => {
            // const htmlContent = await editor.blocksToFullHTML(editor.document);
            const markdownContent = await editor.blocksToMarkdownLossy(editor.document);
            // handleContentChange?.(id, htmlContent);
            handleContentChange?.(id, markdownContent);
          }}
          sideMenu={false}
          className="-mx-2"
        />
      </CardContent>
    </Card>
  );
};

export default OutlineCard;
