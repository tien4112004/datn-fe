import RichTextEditor from '@/shared/components/rte/RichTextEditor';
import { useRichTextEditor } from '@/shared/components/rte/useRichTextEditor';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';
import { BlockNoteEditor } from '@blocknote/core';
import { useSortable } from '@dnd-kit/sortable';
import { Trash } from 'lucide-react';
import React from 'react';

interface OutlineCardProps {
  id: string;
  title?: string;
  className?: string;
  htmlContent?: string;
  onDelete?: () => void;
  onContentChange: (html: string) => void;
}

const OutlineCard = ({
  id,
  title = 'Outline',
  className = '',
  htmlContent = '',
  onDelete,
  onContentChange,
}: OutlineCardProps) => {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `outline-card-${id.toString()}`,
  });
  const editor = useRichTextEditor({
    trailingBlock: false,
  });

  React.useEffect(() => {
    async function loadInitialHTML() {
      const blocks = await editor.tryParseHTMLToBlocks(htmlContent);
      editor.replaceBlocks(editor.document, blocks);
    }
    loadInitialHTML();
  }, [editor]);

  const handleDelete = () => {
    if (!onDelete) return;

    setIsDeleting(true);
    setTimeout(() => {
      onDelete();
    }, 300);
  };

  const handleContentChange = async (editor: BlockNoteEditor) => {
    const htmlContent = await editor.blocksToHTMLLossy(editor.document);
    onContentChange(htmlContent);
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
          onChange={handleContentChange}
          sideMenu={false}
          className="-mx-2"
        />
      </CardContent>
    </Card>
  );
};

export default OutlineCard;
