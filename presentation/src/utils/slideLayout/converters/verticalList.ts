import type { Slide, SlideTheme } from '@/types/slides';
import type { VerticalListLayoutSchema } from './types';
import type { Bounds, TextLayoutBlockInstance, TemplateConfig, TextTemplateContainer } from '../types';
import LayoutPrimitives from '../layoutPrimitives';
import LayoutProBuilder from '../layoutProbuild';

const SLIDE_WIDTH = 1000;
const SLIDE_HEIGHT = 562.5;

// ============================================================================
// 1. Template Configuration
// ============================================================================

export const getVerticalListLayoutTemplate = (theme: SlideTheme): TemplateConfig => {
  const titleBounds: Bounds = {
    left: 15,
    top: 15,
    width: SLIDE_WIDTH - 30,
    height: 100,
  };

  const contentBounds: Bounds = {
    left: 60,
    top: 100,
    width: SLIDE_WIDTH - 100,
    height: SLIDE_HEIGHT - 100,
  };

  const singleColumnBounds: Bounds = {
    left: 60,
    top: 175,
    width: SLIDE_WIDTH - 120,
    height: SLIDE_HEIGHT - 175 - 40,
  };

  return {
    containers: {
      title: {
        bounds: titleBounds,
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
        bounds: contentBounds,
        padding: { top: 0, bottom: 0, left: 0, right: 0 },
        distribution: 'equal',
        spacingBetweenItems: 20,
        horizontalAlignment: 'left',
        verticalAlignment: 'top',
        orientation: 'horizontal',
        text: {
          color: theme.fontColor,
          fontFamily: theme.fontName,
          fontWeight: 'normal',
          fontStyle: 'normal',
        },
        children: [
          {
            padding: { top: 0, bottom: 0, left: 0, right: 0 },
            distribution: 'space-around',
            horizontalAlignment: 'left',
            verticalAlignment: 'top',
            text: {
              color: theme.fontColor,
              fontFamily: theme.fontName,
              fontWeight: 'normal',
              fontStyle: 'normal',
            },
          },
          {
            padding: { top: 0, bottom: 0, left: 0, right: 0 },
            distribution: 'space-around',
            horizontalAlignment: 'left',
            verticalAlignment: 'top',
            text: {
              color: theme.fontColor,
              fontFamily: theme.fontName,
              fontWeight: 'normal',
              fontStyle: 'normal',
            },
          },
        ],
      } satisfies TextTemplateContainer,
      singleColumn: {
        bounds: singleColumnBounds,
        padding: { top: 0, bottom: 0, left: 0, right: 0 },
        distribution: 'equal',
        spacingBetweenItems: 20,
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

export const convertVerticalListLayout = async (
  data: VerticalListLayoutSchema,

  template: TemplateConfig,
  slideId?: string
): Promise<Slide> => {
  const items = data.data.items;
  const useTwoColumns = items.length > 5;

  if (useTwoColumns) {
    // Two column layout
    const contentInstance = {
      ...template.containers.content,
      bounds: template.containers.content.bounds,
    } as TextLayoutBlockInstance;

    const childContainers = LayoutPrimitives.getChildrenMaxBounds(contentInstance.bounds, {
      distribution: contentInstance.distribution,
      childCount: contentInstance.children?.length || 0,
      orientation: contentInstance.orientation,
    });

    // Split items into two columns
    const midpoint = Math.ceil(items.length / 2);
    const leftItems = items.slice(0, midpoint);
    const rightItems = items.slice(midpoint);

    const leftItemElements = await LayoutPrimitives.createItemElementsWithStyles(leftItems, {
      ...contentInstance.children?.[0],
      bounds: childContainers[0],
    } as TextLayoutBlockInstance);

    const rightItemElements = await LayoutPrimitives.createItemElementsWithStyles(rightItems, {
      ...contentInstance.children?.[1],
      bounds: childContainers[1],
    } as TextLayoutBlockInstance);

    const slide: Slide = {
      id: slideId ?? crypto.randomUUID(),
      elements: [
        ...LayoutProBuilder.buildTitle(data.title, template.containers.title, template.theme),
        ...leftItemElements,
        ...rightItemElements,
      ],
    };

    return slide;
  } else {
    // Single column layout
    const singleColumnInstance = {
      ...template.containers.singleColumn,
      bounds: template.containers.singleColumn.bounds,
    } as TextLayoutBlockInstance;

    const itemElements = await LayoutPrimitives.createItemElementsWithStyles(items, singleColumnInstance);

    const slide: Slide = {
      id: slideId ?? crypto.randomUUID(),
      elements: [
        ...LayoutProBuilder.buildTitle(data.title, template.containers.title, template.theme),
        ...itemElements,
      ],
      background: LayoutPrimitives.processBackground(template.theme),
    };

    return slide;
  }
};
