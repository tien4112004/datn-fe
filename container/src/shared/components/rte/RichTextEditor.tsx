import '@blocknote/core/fonts/inter.css';
import { type BlockNoteViewProps } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import './style.css';
import { cn } from '@/shared/lib/utils';

export default function RichTextEditor({
  children,
  ...props
}: React.PropsWithChildren<BlockNoteViewProps<any, any, any> & { className?: string }>) {
  return (
    <>
      {children}
      <BlockNoteView
        {...props}
        data-theming-ui-css-variables
        className={cn(
          'min-h-[120px] h-full w-full bg-transparent placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          props.className
        )}
      />
      ;
    </>
  );
}
