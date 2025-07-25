import RichTextEditor from '@/shared/components/rte/RichTextEditor';
import { useRichTextEditor } from '@/shared/components/rte/useRichTextEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import type { PartialBlock } from '@blocknote/core';

const OutlineCard = ({
  title = 'Outline',
  className = '',
  texts = [
    {
      type: 'heading',
      content: 'Welcome to this demo!',
    },
    {
      type: 'paragraph',
      content:
        'This is a sample text for the outline card. You can edit this content using the rich text editor.',
    },
  ],
}: {
  title?: string;
  className?: string;
  texts?: PartialBlock[];
}) => {
  const editor = useRichTextEditor({
    initialContent: texts,
  });
  return (
    <Card
      className={`border-primary flex min-h-24 w-full flex-row gap-4 bg-white p-0 shadow-md transition-shadow duration-300 hover:shadow-lg ${className}`}
    >
      <CardHeader className="bg-accent w-24 rounded-l-xl p-4 text-center">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-start flex-1 p-4">
        <RichTextEditor editor={editor} sideMenu={false} className="-mx-2" />
      </CardContent>
    </Card>
  );
};

export default OutlineCard;
