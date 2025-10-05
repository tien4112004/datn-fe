import type { Slide, SlideTheme, PPTTextElement } from '@/types/slides';
import type { TwoColumnWithImageLayoutSchema } from './types';
import type { Bounds, TemplateConfig, TextLayoutBlockInstance } from '../types';
import LayoutPrimitives from '../layoutPrimitives';
import LayoutProBuilder from '../layoutProbuild';

const SLIDE_WIDTH = 1000;
const SLIDE_HEIGHT = 562.5;

export const getTwoColumnWithImageLayoutTemplate = (theme: SlideTheme): TemplateConfig => {
  const columns = LayoutPrimitives.getColumnsLayout([50, 50]);
  const imageDimensions = { width: 400, height: 300 };

  const titleBounds: Bounds = {
    left: 15,
    top: 15,
    width: SLIDE_WIDTH - 30,
    height: 120,
  };

  const imagePosition = LayoutPrimitives.layoutItemsInBlock([imageDimensions], {
    layout: {
      horizontalAlignment: 'center',
      verticalAlignment: 'top',
    },
    bounds: {
      left: columns[0].left,
      top: columns[0].top + 140,
      width: columns[0].width,
      height: columns[0].height - 120,
    },
  } as any)[0];

  const imageBounds: Bounds = {
    ...imagePosition,
    ...imageDimensions,
  };

  const contentBounds: Bounds = {
    left: columns[1].left,
    top: columns[1].top + 140,
    width: columns[1].width,
    height: columns[1].height - 180,
  };

  return {
    containers: {
      title: {
        type: 'text',
        bounds: titleBounds,
        layout: {
          horizontalAlignment: 'center',
          verticalAlignment: 'top',
        },
        text: {
          color: theme.titleFontColor,
          fontFamily: theme.titleFontName,
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'center',
        },
      },
      image: {
        type: 'image',
        bounds: imageBounds,
        border: {
          width: 1,
          color: 'transparent',
          radius: 50,
        },
      },
      content: {
        type: 'block',
        bounds: contentBounds,
        layout: {
          distribution: 'space-between',
          gap: 20,
          horizontalAlignment: 'center',
          verticalAlignment: 'top',
          orientation: 'vertical',
        },
        childTemplate: {
          count: 'auto',
          structure: {
            type: 'text',
            label: 'item',
            layout: {
              horizontalAlignment: 'center',
              verticalAlignment: 'top',
            },
            border: {
              width: 1,
              color: theme.themeColors[0],
            },
            text: {
              color: theme.fontColor,
              fontFamily: theme.fontName,
              fontWeight: 'normal',
              fontStyle: 'normal',
            },
          },
        },
      },
    },
    theme,
  };
};

// ============================================================================

export const getTwoColumnBigImageLayoutTemplate = (theme: SlideTheme): TemplateConfig => {
  const columns = LayoutPrimitives.getColumnsLayout([33, 67]);
  const leftColumnBlock = columns[0];
  const rightColumnBlock = columns[1];

  const imageHeight = SLIDE_HEIGHT;
  const imageWidth = leftColumnBlock.width;

  const imageBounds: Bounds = {
    left: 0,
    top: 0,
    width: imageWidth,
    height: imageHeight,
  };

  const titleBounds: Bounds = {
    left: rightColumnBlock.left,
    top: 15,
    width: rightColumnBlock.width,
    height: 120,
  };

  return {
    containers: {
      title: {
        type: 'text',
        bounds: titleBounds,
        layout: {
          horizontalAlignment: 'center',
          verticalAlignment: 'top',
        },
        text: {
          color: theme.titleFontColor,
          fontFamily: theme.titleFontName,
          fontWeight: 'bold',
          fontStyle: 'normal',
        },
      },
      image: {
        type: 'image',
        bounds: imageBounds,
        border: {
          width: 1,
          color: 'transparent',
          radius: 0,
        },
      },
      content: {
        type: 'block',
        positioning: {
          relativeTo: 'title',
          axis: 'vertical',
          anchor: 'end',
          offset: 20,
          size: 'fill',
          margin: { left: 30, right: 30, top: 0, bottom: 40 },
        },
        layout: {
          distribution: 'equal',
          gap: 20,
          horizontalAlignment: 'left',
          verticalAlignment: 'top',
          orientation: 'vertical',
        },
        childTemplate: {
          count: 'auto',
          structure: {
            type: 'text',
            layout: {
              horizontalAlignment: 'left',
              verticalAlignment: 'top',
            },
            border: {
              width: 1,
              color: theme.themeColors[0],
            },
            children: [
              {
                label: 'item',
                type: 'text',
                text: {
                  color: theme.fontColor,
                  fontFamily: theme.fontName,
                  fontWeight: 'normal',
                  fontStyle: 'normal',
                  lineHeight: 1.4,
                },
              },
            ],
          },
        },
      },
    },
    theme,
  };
};

export const convertTwoColumnWithImageLayout = async (
  data: TwoColumnWithImageLayoutSchema,
  template: TemplateConfig,
  slideId?: string
): Promise<Slide> => {
  // Content container - use unified font sizing
  const contentContainer = template.containers.content;

  const resolvedBounds = LayoutPrimitives.resolveContainerPositions(template.containers, {
    width: SLIDE_WIDTH,
    height: SLIDE_HEIGHT,
  });

  const { instance: contentInstance, elements } = LayoutProBuilder.buildLayoutWithUnifiedFontSizing(
    contentContainer,
    resolvedBounds.content,
    {
      item: data.data.items,
    }
  );

  // Get labeled instances for bounds
  const itemInstances = LayoutPrimitives.recursivelyGetAllLabelInstances(
    contentInstance,
    'item'
  ) as TextLayoutBlockInstance[];

  // Extract elements by label
  const itemElements = elements['item'] || [];

  // Generate PPT elements from pre-created elements
  const contentElements = itemElements.map((itemEl, index) => {
    return {
      id: crypto.randomUUID(),
      type: 'text',
      content: itemEl.outerHTML,
      defaultFontName: itemInstances[index].text?.fontFamily,
      defaultColor: itemInstances[index].text?.color,
      left: itemInstances[index].bounds.left,
      top: itemInstances[index].bounds.top,
      width: itemInstances[index].bounds.width,
      height: itemInstances[index].bounds.height,
      textType: 'content',
    } as PPTTextElement;
  });

  const imageElement = await LayoutProBuilder.buildImageElement(data.data.image, template.containers.image);

  const slide: Slide = {
    id: slideId ?? crypto.randomUUID(),
    elements: [
      ...LayoutProBuilder.buildCards(contentInstance),
      ...LayoutProBuilder.buildTitle(data.title, template.containers.title, template.theme),
      imageElement,
      ...contentElements,
    ],
    background: LayoutPrimitives.processBackground(template.theme),
  };

  return slide;
};
