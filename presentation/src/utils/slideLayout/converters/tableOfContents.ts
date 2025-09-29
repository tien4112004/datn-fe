import type { Slide, SlideTheme } from '@/types/slides';
import { createTitleLine } from '../graphic';
import type { TableOfContentsLayoutSchema, TwoColumnLayoutSchema } from './types';
import { convertTwoColumnLayout, getTwoColumnLayoutTemplate } from './twoColumn';
import type { Bounds, TextLayoutBlockInstance, TemplateConfig, TextTemplateContainer } from '../types';
import LayoutPrimitives from '../layoutPrimitives';

const SLIDE_WIDTH = 1000;
const SLIDE_HEIGHT = 562.5;

export const getTableOfContentsLayoutTemplate = (theme: SlideTheme): TemplateConfig => {
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
      } satisfies TextTemplateContainer,
      content: {
        bounds: {
          left: 60,
          top: 155, // title height + spacing
          width: SLIDE_WIDTH - 120, // leave margins
          height: SLIDE_HEIGHT - 155 - 40, // remaining height with bottom margin
        },
        padding: { top: 0, bottom: 0, left: 0, right: 0 },
        distribution: 'equal',
        spacingBetweenItems: 25,
        horizontalAlignment: 'left',
        verticalAlignment: 'top',
        text: {
          color: theme.fontColor,
          fontFamily: theme.fontName,
          fontWeight: 'normal',
          fontStyle: 'normal',
        },
      } satisfies TextTemplateContainer,
    },
    theme,
  } satisfies TemplateConfig;
};

export const convertTableOfContentsLayout = async (
  data: TableOfContentsLayoutSchema,
  template: TemplateConfig,
  slideId?: string
): Promise<Slide> => {
  // Add numbering to items
  const numberedItems = data.data.items.map((item, index) => `${index + 1}. ${item}`);

  // Determine if two columns are needed
  const useTwoColumns = numberedItems.length >= 8;

  // If too many items, delegate to two-column layout
  if (useTwoColumns) {
    const twoColumnTemplate = getTwoColumnLayoutTemplate(template.theme);
    const newData = {
      type: 'two_column',
      title: 'Contents',
      data: {
        items1: numberedItems.slice(0, Math.ceil(numberedItems.length / 2)),
        items2: numberedItems.slice(Math.ceil(numberedItems.length / 2)),
      },
    } as TwoColumnLayoutSchema;

    return await convertTwoColumnLayout(newData, twoColumnTemplate, slideId);
  }

  // Single column layout - merge template config with bounds
  const titleInstance = {
    ...template.containers.title,
    ...template.containers.title.bounds,
  } as TextLayoutBlockInstance;
  const contentInstance = {
    ...template.containers.content,
    ...template.containers.content.bounds,
  } as TextLayoutBlockInstance;

  const { titleContent, titleDimensions, titlePosition } = LayoutPrimitives.calculateTitleLayout(
    'Contents',
    titleInstance
  );

  // Create item elements using template
  const itemElements = await LayoutPrimitives.createItemElementsWithStyles(numberedItems, contentInstance);

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
      ...itemElements,
    ],
  };

  return slide;
};
