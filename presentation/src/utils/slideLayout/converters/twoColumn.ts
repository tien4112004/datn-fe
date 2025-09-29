import type { Slide, SlideTheme } from '@/types/slides';
import { createTitleLine } from '../graphic';
import type { TwoColumnLayoutSchema } from './types';
import type {
  Bounds,
  TextLayoutBlockInstance,
  TemplateConfig,
  TextTemplateContainer,
  LayoutBlockInstance,
  SlideLayoutBlockInstance,
} from '../types';
import LayoutPrimitives from '../layoutPrimitives';

const SLIDE_WIDTH = 1000;
const SLIDE_HEIGHT = 562.5;

export const getTwoColumnLayoutTemplate = (theme: SlideTheme): TemplateConfig => {
  return {
    containers: {
      title: {
        bounds: {
          left: 15,
          top: 15,
          width: SLIDE_WIDTH - 30,
          height: 100,
        },
        padding: { top: 0, bottom: 0, left: 40, right: 40 },
        horizontalAlignment: 'center',
        verticalAlignment: 'top',
        text: {
          color: theme.titleFontColor,
          fontFamily: theme.titleFontName,
          fontWeight: 'bold',
          fontStyle: 'normal',
        },
      },
      content: {
        bounds: {
          left: 60,
          top: 140,
          width: SLIDE_WIDTH - 80,
          height: SLIDE_HEIGHT - 155 - 40,
        },
        padding: { top: 0, bottom: 0, left: 0, right: 0 },
        distribution: 'space-between',
        horizontalAlignment: 'center',
        verticalAlignment: 'top',
        orientation: 'horizontal',
        children: [
          {
            padding: { top: 0, bottom: 0, left: 0, right: 0 },
            distribution: 'space-between',
            horizontalAlignment: 'left',
            verticalAlignment: 'top',
            childTemplate: {
              label: 'item',
              count: 'auto',
              structure: {
                text: {
                  color: theme.fontColor,
                  fontFamily: theme.fontName,
                  fontWeight: 'normal',
                  fontStyle: 'normal',
                },
              },
            },
          },
          {
            padding: { top: 0, bottom: 0, left: 0, right: 0 },
            distribution: 'space-around',
            horizontalAlignment: 'left',
            verticalAlignment: 'top',
            childTemplate: {
              label: 'item',
              count: 'auto',
              structure: {
                text: {
                  color: theme.fontColor,
                  fontFamily: theme.fontName,
                  fontWeight: 'normal',
                  fontStyle: 'normal',
                },
              },
            },
          },
        ],
      },
    },
    theme,
  };
};

export const convertTwoColumnLayout = async (
  data: TwoColumnLayoutSchema,

  template: TemplateConfig,
  slideId?: string
): Promise<Slide> => {
  // Merge template config with bounds to create instance
  const titleInstance = {
    ...template.containers.title,
    ...template.containers.title.bounds,
  } as SlideLayoutBlockInstance;
  const contentInstance = {
    ...template.containers.content,
    ...template.containers.content.bounds,
  } as SlideLayoutBlockInstance;

  // Calculate title layout
  const { titleContent, titleDimensions, titlePosition } = LayoutPrimitives.calculateTitleLayout(
    data.title,
    titleInstance
  );

  // Recursively calculate child bounds for content container
  LayoutPrimitives.recursivelyPreprocessDescendants(contentInstance);

  // Calculate unified font size for both columns to ensure consistent sizing
  const unifiedFontSize = LayoutPrimitives.calculateUnifiedFontSizeForColumns(
    [data.data.items1, data.data.items2],
    [
      contentInstance.children?.[0] as TextLayoutBlockInstance,
      contentInstance.children?.[1] as TextLayoutBlockInstance,
    ]
  );

  // Create item elements for both columns with unified font size
  const leftItemElements = await LayoutPrimitives.createItemElementsWithUnifiedStyles(
    data.data.items1,
    contentInstance.children?.[0] as TextLayoutBlockInstance,
    unifiedFontSize
  );

  const rightItemElements = await LayoutPrimitives.createItemElementsWithUnifiedStyles(
    data.data.items2,
    contentInstance.children?.[1] as TextLayoutBlockInstance,
    unifiedFontSize
  );

  const slide: Slide = {
    id: slideId ?? crypto.randomUUID(),
    elements: [
      LayoutPrimitives.createTitlePPTElement(
        titleContent,
        { left: titlePosition.left, top: titlePosition.top },
        { width: titleDimensions.width, height: titleDimensions.height },
        titleInstance
      ),
      createTitleLine(
        {
          width: titleDimensions.width,
          height: titleDimensions.height,
          left: titlePosition.left,
          top: titlePosition.top,
        } as Bounds,
        template.theme
      ),
      ...leftItemElements,
      ...rightItemElements,
    ],
  };

  return slide;
};
