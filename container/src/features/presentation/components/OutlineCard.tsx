import RichTextEditor from '@/shared/components/rte/RichTextEditor';
import { useRichTextEditor } from '@/shared/components/rte/useRichTextEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';
import type { PartialBlock } from '@blocknote/core';
import { useSortable } from '@dnd-kit/sortable';

const OutlineCard = ({
  id,
  title = 'Outline',
  className = '',
  texts = [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Blocks:',
          styles: { bold: true },
        },
      ],
    },
    {
      type: 'paragraph',
      content:
        'This is a sample text for the outline card. You can edit this content using the rich text editor.',
    },
  ],
}: {
  id: string;
  title?: string;
  className?: string;
  texts?: PartialBlock[];
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `outline-card-${id}`,
  });

  const editor = useRichTextEditor({
    initialContent: texts,
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        `border-primary flex min-h-24 w-full flex-row gap-4 bg-white p-0 shadow-md transition-shadow duration-300 hover:shadow-lg ${className}`,
        isDragging ? 'opacity-50' : ''
      )}
    >
      <CardHeader {...attributes} {...listeners} className="bg-accent w-24 rounded-l-xl p-2 text-center">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-start flex-1 p-2">
        <RichTextEditor editor={editor} sideMenu={false} className="-mx-2" />
      </CardContent>
    </Card>
  );
};

export default OutlineCard;
