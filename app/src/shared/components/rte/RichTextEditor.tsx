import '@blocknote/core/fonts/inter.css';
import {
  type BlockNoteViewProps,
  FormattingToolbar,
  FormattingToolbarController,
  useComponentsContext,
  useBlockNoteEditor,
} from '@blocknote/react';
import { BasicTextStyleButton, ColorStyleButton, TextAlignButton } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import './style.css';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';

interface RichTextEditorProps extends BlockNoteViewProps<any, any, any> {
  className?: string;
  onBlur?: () => void;
  minimalToolbar?: boolean;
}

const FONT_SIZES = ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'];

const FontSizeButton = () => {
  const editor = useBlockNoteEditor();
  const Components = useComponentsContext();
  const { t } = useTranslation(I18N_NAMESPACES.MINDMAP);

  const handleFontSizeChange = useCallback(
    (size: string) => {
      editor.focus();

      const selection = editor.getSelection();
      if (selection) {
        // Apply font size to selected blocks' content
        selection.blocks.forEach((block) => {
          if (block.content && Array.isArray(block.content)) {
            const updatedContent = block.content.map((item: any) => ({
              ...item,
              styles: {
                ...item.styles,
                fontSize: size,
              },
            }));
            editor.updateBlock(block, { content: updatedContent });
          }
        });
      }
    },
    [editor]
  );

  if (!Components) {
    return null;
  }

  return (
    <Components.Generic.Menu.Root>
      <Components.Generic.Menu.Trigger>
        <Components.FormattingToolbar.Button mainTooltip={t('editor.fontSize')} label="Size">
          A
        </Components.FormattingToolbar.Button>
      </Components.Generic.Menu.Trigger>
      <Components.Generic.Menu.Dropdown>
        {FONT_SIZES.map((size) => (
          <Components.Generic.Menu.Item key={size} onClick={() => handleFontSizeChange(size)}>
            <span>{size}</span>
          </Components.Generic.Menu.Item>
        ))}
      </Components.Generic.Menu.Dropdown>
    </Components.Generic.Menu.Root>
  );
};

const MinimalFormattingToolbar = () => (
  <FormattingToolbar>
    <BasicTextStyleButton basicTextStyle="bold" key="bold" />
    <BasicTextStyleButton basicTextStyle="italic" key="italic" />
    <BasicTextStyleButton basicTextStyle="underline" key="underline" />
    <BasicTextStyleButton basicTextStyle="strike" key="strike" />
    <ColorStyleButton key="colors" />
    <FontSizeButton key="fontSize" />
    <TextAlignButton textAlignment="left" key="alignLeft" />
    <TextAlignButton textAlignment="center" key="alignCenter" />
    <TextAlignButton textAlignment="right" key="alignRight" />
  </FormattingToolbar>
);

export default React.memo(function RichTextEditor({
  children,
  minimalToolbar = false,
  ...props
}: React.PropsWithChildren<RichTextEditorProps>) {
  return (
    <>
      {children}
      <BlockNoteView
        {...props}
        data-theming-ui-css-variables
        className={props.className}
        formattingToolbar={minimalToolbar ? false : undefined}
      >
        {minimalToolbar && <FormattingToolbarController formattingToolbar={MinimalFormattingToolbar} />}
      </BlockNoteView>
    </>
  );
});
