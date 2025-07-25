import RichTextEditor from '@/shared/components/rte/RichTextEditor';
import { useRichTextEditor } from '@/shared/components/rte/useRichTextEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

const OutlineCard = () => {
  const editor = useRichTextEditor({
    initialContent: [
      {
        type: 'paragraph',
        content: 'Welcome to this demo!',
      },
      {
        type: 'paragraph',
        content:
          'There are no menus or toolbars in this editor, but you can still markup text using keyboard shortcuts.',
      },
      {
        type: 'paragraph',
        content: 'Try making text bold with Ctrl+B/Cmd+B or undo with Ctrl+Z/Cmd+Z.',
      },
    ],
  });
  return (
    <Card className="border-primary flex min-h-24 w-full flex-row gap-4 bg-white p-0 shadow-md transition-shadow duration-300 hover:shadow-lg">
      <CardHeader className="bg-accent w-24 rounded-l-xl p-4 text-center">
        <CardTitle>abc</CardTitle>
      </CardHeader>
      <CardContent className="flex-start flex-1 p-4">
        <RichTextEditor editor={editor} sideMenu={false} className="-mx-2" />
      </CardContent>
    </Card>
  );
};

export default OutlineCard;
