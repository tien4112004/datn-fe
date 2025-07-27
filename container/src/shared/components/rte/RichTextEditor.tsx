import '@blocknote/core/fonts/inter.css';
import { type BlockNoteViewProps } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import './style.css';

export default function RichTextEditor({
  children,
  ...props
}: React.PropsWithChildren<BlockNoteViewProps<any, any, any> & { className?: string }>) {
  return (
    <>
      {children}
      <BlockNoteView {...props} data-theming-ui-css-variables className={props.className} />
    </>
  );
}
