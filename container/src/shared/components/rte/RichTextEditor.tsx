import '@blocknote/core/fonts/inter.css';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/shadcn';
import '@blocknote/shadcn/style.css';
import * as Button from '@/components/ui/button';
import * as Select from '@/components/ui/select';
import * as Input from '@/components/ui/input';
import * as DropdownMenu from '@/components/ui/dropdown-menu';
import * as Popover from '@/components/ui/popover';
import * as Card from '@/components/ui/card';
import * as Tooltip from '@/components/ui/tooltip';

export default function RichTextEditor() {
  const editor = useCreateBlockNote();

  return (
    <BlockNoteView
      editor={editor}
      shadCNComponents={{
        Button,
        Select,
        Input,
        DropdownMenu,
        Popover,
        Card,
        Tooltip,
      }}
    />
  );
}
