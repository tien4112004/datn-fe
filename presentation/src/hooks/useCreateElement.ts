import { storeToRefs } from 'pinia';
import { nanoid } from 'nanoid';
import { useMainStore, useSlidesStore } from '@/store';
import { getImageSize } from '@/utils/image';
import type {
  PPTLineElement,
  PPTElement,
  TableCell,
  TableCellStyle,
  PPTShapeElement,
  ChartType,
  PPTVideoElement,
  PPTAudioElement,
} from '@/types/slides';
import { type ShapePoolItem, SHAPE_PATH_FORMULAS } from '@/configs/shapes';
import type { LinePoolItem } from '@/configs/lines';
import { CHART_DEFAULT_DATA } from '@/configs/chart';
import useHistorySnapshot from '@/hooks/useHistorySnapshot';

interface CommonElementPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface LineElementPosition {
  top: number;
  left: number;
  start: [number, number];
  end: [number, number];
}

interface CreateTextData {
  content?: string;
  vertical?: boolean;
}

export default () => {
  const mainStore = useMainStore();
  const slidesStore = useSlidesStore();
  const { creatingElement } = storeToRefs(mainStore);
  const { theme, viewportRatio, viewportSize } = storeToRefs(slidesStore);

  const { addHistorySnapshot } = useHistorySnapshot();

  // Create (insert) an element and set it as the selected element
  const createElement = (element: PPTElement, callback?: () => void) => {
    slidesStore.addElement(element);
    mainStore.setActiveElementIdList([element.id]);

    if (creatingElement.value) mainStore.setCreatingElement(null);

    setTimeout(() => {
      mainStore.setEditorareaFocus(true);
    }, 0);

    if (callback) callback();

    addHistorySnapshot();
  };

  /**
   * Create image element
   * @param src Image URL
   */
  const createImageElement = (src: string) => {
    getImageSize(src).then(({ width, height }) => {
      const scale = height / width;

      if (scale < viewportRatio.value && width > viewportSize.value) {
        width = viewportSize.value;
        height = width * scale;
      } else if (height > viewportSize.value * viewportRatio.value) {
        height = viewportSize.value * viewportRatio.value;
        width = height / scale;
      }

      createElement({
        type: 'image',
        id: nanoid(10),
        src,
        width,
        height,
        left: (viewportSize.value - width) / 2,
        top: (viewportSize.value * viewportRatio.value - height) / 2,
        fixedRatio: true,
        rotate: 0,
      });
    });
  };

  /**
   * Create chart element
   * @param chartType Chart type
   */
  const createChartElement = (type: ChartType) => {
    createElement({
      type: 'chart',
      id: nanoid(10),
      chartType: type,
      left: 300,
      top: 81.25,
      width: 400,
      height: 400,
      rotate: 0,
      themeColors: theme.value.themeColors,
      textColor: theme.value.fontColor,
      data: CHART_DEFAULT_DATA[type],
    });
  };

  /**
   * Create table element
   * @param row Number of rows
   * @param col Number of columns
   */
  const createTableElement = (row: number, col: number) => {
    const style: TableCellStyle = {
      fontname: theme.value.fontName,
      color: theme.value.fontColor,
    };
    const data: TableCell[][] = [];
    for (let i = 0; i < row; i++) {
      const rowCells: TableCell[] = [];
      for (let j = 0; j < col; j++) {
        rowCells.push({
          id: nanoid(10),
          colspan: 1,
          rowspan: 1,
          text: '',
          style,
        });
      }
      data.push(rowCells);
    }

    const DEFAULT_CELL_WIDTH = 100;
    const DEFAULT_CELL_HEIGHT = 36;

    const colWidths: number[] = new Array(col).fill(1 / col);

    const width = col * DEFAULT_CELL_WIDTH;
    const height = row * DEFAULT_CELL_HEIGHT;

    createElement({
      type: 'table',
      id: nanoid(10),
      width,
      height,
      colWidths,
      rotate: 0,
      data,
      left: (viewportSize.value - width) / 2,
      top: (viewportSize.value * viewportRatio.value - height) / 2,
      outline: {
        width: 2,
        style: 'solid',
        color: '#eeece1',
      },
      theme: {
        color: theme.value.themeColors[0],
        rowHeader: true,
        rowFooter: false,
        colHeader: false,
        colFooter: false,
      },
      cellMinHeight: 36,
    });
  };

  /**
   * Create text element
   * @param position Position and size info
   * @param content Text content
   */
  const createTextElement = (position: CommonElementPosition, data?: CreateTextData) => {
    const { left, top, width, height } = position;
    const content = data?.content || '';
    const vertical = data?.vertical || false;

    const id = nanoid(10);
    createElement(
      {
        type: 'text',
        id,
        left,
        top,
        width,
        height,
        content,
        rotate: 0,
        defaultFontName: theme.value.fontName,
        defaultColor: theme.value.fontColor,
        vertical,
      },
      () => {
        setTimeout(() => {
          const editorRef: HTMLElement | null = document.querySelector(
            `#editable-element-${id} .ProseMirror`
          );
          if (editorRef) editorRef.focus();
        }, 0);
      }
    );
  };

  /**
   * Create shape element
   * @param position Position and size info
   * @param data Shape path info
   */
  const createShapeElement = (
    position: CommonElementPosition,
    data: ShapePoolItem,
    supplement: Partial<PPTShapeElement> = {}
  ) => {
    const { left, top, width, height } = position;
    const newElement: PPTShapeElement = {
      type: 'shape',
      id: nanoid(10),
      left,
      top,
      width,
      height,
      viewBox: data.viewBox,
      path: data.path,
      fill: theme.value.themeColors[0],
      fixedRatio: false,
      rotate: 0,
      ...supplement,
    };
    if (data.withborder) newElement.outline = theme.value.outline;
    if (data.special) newElement.special = true;
    if (data.pathFormula) {
      newElement.pathFormula = data.pathFormula;
      newElement.viewBox = [width, height];

      const pathFormula = SHAPE_PATH_FORMULAS[data.pathFormula];
      if ('editable' in pathFormula && pathFormula.editable) {
        newElement.path = pathFormula.formula(width, height, pathFormula.defaultValue!);
        newElement.keypoints = pathFormula.defaultValue;
      } else newElement.path = pathFormula.formula(width, height);
    }
    createElement(newElement);
  };

  /**
   * Create line element
   * @param position Position and size info
   * @param data Line path and style
   */
  const createLineElement = (position: LineElementPosition, data: LinePoolItem) => {
    const { left, top, start, end } = position;

    const newElement: PPTLineElement = {
      type: 'line',
      id: nanoid(10),
      left,
      top,
      start,
      end,
      points: data.points,
      color: theme.value.themeColors[0],
      style: data.style,
      width: 2,
    };
    if (data.isBroken) newElement.broken = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2];
    if (data.isBroken2) newElement.broken2 = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2];
    if (data.isCurve) newElement.curve = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2];
    if (data.isCubic)
      newElement.cubic = [
        [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2],
        [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2],
      ];
    createElement(newElement);
  };

  /**
   * Create LaTeX element
   * @param svg SVG code
   */
  const createLatexElement = (data: { path: string; latex: string; w: number; h: number }) => {
    createElement({
      type: 'latex',
      id: nanoid(10),
      width: data.w,
      height: data.h,
      rotate: 0,
      left: (viewportSize.value - data.w) / 2,
      top: (viewportSize.value * viewportRatio.value - data.h) / 2,
      path: data.path,
      latex: data.latex,
      color: theme.value.fontColor,
      strokeWidth: 2,
      viewBox: [data.w, data.h],
      fixedRatio: true,
    });
  };

  /**
   * Create video element
   * @param src Video URL
   */
  const createVideoElement = (src: string, ext?: string) => {
    const newElement: PPTVideoElement = {
      type: 'video',
      id: nanoid(10),
      width: 500,
      height: 300,
      rotate: 0,
      left: (viewportSize.value - 500) / 2,
      top: (viewportSize.value * viewportRatio.value - 300) / 2,
      src,
      autoplay: false,
    };
    if (ext) newElement.ext = ext;
    createElement(newElement);
  };

  /**
   * Create audio element
   * @param src Audio URL
   */
  const createAudioElement = (src: string, ext?: string) => {
    const newElement: PPTAudioElement = {
      type: 'audio',
      id: nanoid(10),
      width: 50,
      height: 50,
      rotate: 0,
      left: (viewportSize.value - 50) / 2,
      top: (viewportSize.value * viewportRatio.value - 50) / 2,
      loop: false,
      autoplay: false,
      fixedRatio: true,
      color: theme.value.themeColors[0],
      src,
    };
    if (ext) newElement.ext = ext;
    createElement(newElement);
  };

  return {
    createImageElement,
    createChartElement,
    createTableElement,
    createTextElement,
    createShapeElement,
    createLineElement,
    createLatexElement,
    createVideoElement,
    createAudioElement,
  };
};
