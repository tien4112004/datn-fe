import { useI18n } from 'vue-i18n';

export const enum KEYS {
  C = 'C',
  X = 'X',
  Z = 'Z',
  Y = 'Y',
  A = 'A',
  G = 'G',
  L = 'L',
  F = 'F',
  D = 'D',
  B = 'B',
  P = 'P',
  O = 'O',
  R = 'R',
  T = 'T',
  MINUS = '-',
  EQUAL = '=',
  DIGIT_0 = '0',
  DELETE = 'DELETE',
  UP = 'ARROWUP',
  DOWN = 'ARROWDOWN',
  LEFT = 'ARROWLEFT',
  RIGHT = 'ARROWRIGHT',
  ENTER = 'ENTER',
  SPACE = ' ',
  TAB = 'TAB',
  BACKSPACE = 'BACKSPACE',
  ESC = 'ESCAPE',
  PAGEUP = 'PAGEUP',
  PAGEDOWN = 'PAGEDOWN',
  //   F5 = 'F5',
  F5 = '',
}

interface HotkeyItem {
  type: string;
  children: {
    label: string;
    value?: string;
  }[];
}

export const getHotkeyDoc = () => {
  const { t } = useI18n();

  return [
    {
      type: t('hotkeys.documentation.general'),
      children: [
        { label: t('hotkeys.documentation.cut'), value: 'Ctrl + X' },
        { label: t('hotkeys.documentation.copy'), value: 'Ctrl + C' },
        { label: t('hotkeys.documentation.paste'), value: 'Ctrl + V' },
        { label: t('hotkeys.documentation.pastePlainText'), value: 'Ctrl + Shift + V' },
        { label: t('hotkeys.documentation.quickCopyPaste'), value: 'Ctrl + D' },
        { label: t('hotkeys.documentation.selectAll'), value: 'Ctrl + A' },
        { label: t('hotkeys.documentation.undo'), value: 'Ctrl + Z' },
        { label: t('hotkeys.documentation.redo'), value: 'Ctrl + Y' },
        { label: t('hotkeys.documentation.delete'), value: 'Delete / Backspace' },
        { label: t('hotkeys.documentation.multiSelect'), value: 'Hold Ctrl or Shift' },
        { label: t('hotkeys.documentation.openSearchReplace'), value: 'Ctrl + F' },
        { label: t('hotkeys.documentation.print'), value: 'Ctrl + P' },
        { label: t('hotkeys.documentation.closePopup'), value: 'ESC' },
      ],
    },
    {
      type: t('hotkeys.documentation.slideshow'),
      children: [
        { label: t('hotkeys.documentation.startSlideshowBeginning'), value: 'F5' },
        { label: t('hotkeys.documentation.startSlideshowCurrent'), value: 'Shift + F5' },
        { label: t('hotkeys.documentation.previousSlide'), value: '↑ / ← / PgUp' },
        { label: t('hotkeys.documentation.nextSlide'), value: '↓ / → / PgDown' },
        { label: t('hotkeys.documentation.nextSlideAlt'), value: 'Enter / Space' },
        { label: t('hotkeys.documentation.exitSlideshow'), value: 'ESC' },
      ],
    },
    {
      type: t('hotkeys.documentation.slideEditing'),
      children: [
        { label: t('hotkeys.documentation.newSlide'), value: 'Enter' },
        { label: t('hotkeys.documentation.moveCanvas'), value: 'Space + Mouse drag' },
        { label: t('hotkeys.documentation.zoomCanvas'), value: 'Ctrl + Mouse wheel' },
        { label: t('hotkeys.documentation.zoomIn'), value: 'Ctrl + =' },
        { label: t('hotkeys.documentation.zoomOut'), value: 'Ctrl + -' },
        { label: t('hotkeys.documentation.fitCanvasToScreen'), value: 'Ctrl + 0' },
        { label: t('hotkeys.documentation.previousSlideNoElement'), value: '↑' },
        { label: t('hotkeys.documentation.nextSlideNoElement'), value: '↓' },
        { label: t('hotkeys.documentation.previousSlide'), value: 'Mouse wheel up / PgUp' },
        { label: t('hotkeys.documentation.nextSlide'), value: 'Mouse wheel down / PgDown' },
        { label: t('hotkeys.documentation.quickCreateText'), value: 'Double click blank / T' },
        { label: t('hotkeys.documentation.quickCreateRectangle'), value: 'R' },
        { label: t('hotkeys.documentation.quickCreateCircle'), value: 'O' },
        { label: t('hotkeys.documentation.quickCreateLine'), value: 'L' },
        { label: t('hotkeys.documentation.exitDrawingMode'), value: 'Right mouse button' },
      ],
    },
    {
      type: t('hotkeys.documentation.elementOperation'),
      children: [
        { label: t('hotkeys.documentation.move'), value: '↑ / ← / ↓ / →' },
        { label: t('hotkeys.documentation.lock'), value: 'Ctrl + L' },
        { label: t('hotkeys.documentation.group'), value: 'Ctrl + G' },
        { label: t('hotkeys.documentation.ungroup'), value: 'Ctrl + Shift + G' },
        { label: t('hotkeys.documentation.bringToFront'), value: 'Alt + F' },
        { label: t('hotkeys.documentation.sendToBack'), value: 'Alt + B' },
        { label: t('hotkeys.documentation.lockAspectRatio'), value: 'Hold Ctrl or Shift' },
        { label: t('hotkeys.documentation.createHorizontalVerticalLine'), value: 'Hold Ctrl or Shift' },
        { label: t('hotkeys.documentation.switchFocusElement'), value: 'Tab' },
        { label: t('hotkeys.documentation.confirmImageCrop'), value: 'Enter' },
        { label: t('hotkeys.documentation.finishCustomShapeDrawing'), value: 'Enter' },
      ],
    },
    {
      type: t('hotkeys.documentation.tableEditing'),
      children: [
        { label: t('hotkeys.documentation.focusNextCell'), value: 'Tab' },
        { label: t('hotkeys.documentation.moveFocusCell'), value: '↑ / ← / ↓ / →' },
        { label: t('hotkeys.documentation.insertRowAbove'), value: 'Ctrl + ↑' },
        { label: t('hotkeys.documentation.insertRowBelow'), value: 'Ctrl + ↓' },
        { label: t('hotkeys.documentation.insertColumnLeft'), value: 'Ctrl + ←' },
        { label: t('hotkeys.documentation.insertColumnRight'), value: 'Ctrl + →' },
      ],
    },
    {
      type: t('hotkeys.documentation.chartDataEditing'),
      children: [{ label: t('hotkeys.documentation.focusNextRow'), value: 'Enter' }],
    },
    {
      type: t('hotkeys.documentation.textEditing'),
      children: [
        { label: t('hotkeys.documentation.bold'), value: 'Ctrl + B' },
        { label: t('hotkeys.documentation.italic'), value: 'Ctrl + I' },
        { label: t('hotkeys.documentation.underline'), value: 'Ctrl + U' },
        { label: t('hotkeys.documentation.inlineCode'), value: 'Ctrl + E' },
        { label: t('hotkeys.documentation.superscript'), value: 'Ctrl + ;' },
        { label: t('hotkeys.documentation.subscript'), value: `Ctrl + '` },
        { label: t('hotkeys.documentation.selectParagraph'), value: `ESC` },
      ],
    },
    {
      type: t('hotkeys.documentation.otherShortcuts'),
      children: [
        { label: t('hotkeys.documentation.addImagePasteImage') },
        { label: t('hotkeys.documentation.addImageDragLocalImage') },
        { label: t('hotkeys.documentation.addImagePasteSVGCode') },
        { label: t('hotkeys.documentation.addImagePasteImageLinkFromPexels') },
        { label: t('hotkeys.documentation.addTextPasteText') },
        { label: t('hotkeys.documentation.addTextDragSelectedText') },
        {
          label: t('hotkeys.documentation.textEditingSupportMarkdown'),
        },
      ],
    },
  ] as HotkeyItem[];
};
