import type { PPTTextElement, Slide, SlideTheme } from '@/types/slides';
import type { TwoColumnLayoutSchema } from './types';
import type { TextLayoutBlockInstance, TemplateConfig } from '../types';
import LayoutPrimitives from '../layoutPrimitives';
import LayoutProBuilder from '../layoutProbuild';

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
        // Using relative positioning - positioned below title
        positioning: {
          relativeTo: 'title',
          anchor: { vertical: 'bottom', horizontal: 'none' },
          offset: { left: 60, top: 25, right: 80 },
          fillRemaining: { vertical: true },
        },
        padding: { top: 0, bottom: 0, left: 0, right: 0 },
        distribution: 'space-between',
        spacingBetweenItems: 20,
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
              count: 'auto',
              structure: {
                label: 'item',
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
            distribution: 'space-between',
            horizontalAlignment: 'left',
            verticalAlignment: 'top',
            childTemplate: {
              count: 'auto',
              structure: {
                label: 'item',
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

export const getHorizontalListLayoutTemplateOneRow = (theme: SlideTheme): TemplateConfig => {
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
          width: SLIDE_WIDTH - 120,
          height: SLIDE_HEIGHT - 155 - 40,
        },
        padding: { top: 0, bottom: 0, left: 0, right: 0 },
        distribution: 'space-around',
        horizontalAlignment: 'center',
        verticalAlignment: 'center',
        orientation: 'horizontal',
        childTemplate: {
          count: 'auto',
          structure: {
            label: 'item',
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

export const convertTwoColumnLayout = async (
  data: TwoColumnLayoutSchema,
  template: TemplateConfig,
  slideId?: string
): Promise<Slide> => {
  // Resolve container positions (handles both absolute and relative positioning)
  const resolvedBounds = LayoutPrimitives.resolveContainerPositions(template.containers, {
    width: SLIDE_WIDTH,
    height: SLIDE_HEIGHT,
  });

  // Content container - use unified font sizing with nested data
  const contentContainer = { ...template.containers.content, bounds: resolvedBounds.content };
  const { instance: contentInstance, elements } = LayoutProBuilder.buildLayoutWithUnifiedFontSizing(
    contentContainer,
    contentContainer.bounds!,
    {
      items1: data.data.items1,
      items2: data.data.items2,
    }
  );

  // Extract elements (they're all labeled as 'item')
  const itemElements = elements['item'] || [];

  // Split into left and right based on which column they belong to
  const leftItems = (contentInstance.children?.[0]?.children || []) as TextLayoutBlockInstance[];
  const rightItems = (contentInstance.children?.[1]?.children || []) as TextLayoutBlockInstance[];

  // Create PPT elements for left column
  const leftItemElements = leftItems.map(
    (item, index) =>
      ({
        id: crypto.randomUUID(),
        type: 'text',
        content: itemElements[index]?.outerHTML || '',
        defaultFontName: item.text?.fontFamily,
        defaultColor: item.text?.color,
        left: item.bounds.left,
        top: item.bounds.top,
        width: item.bounds.width,
        height: item.bounds.height,
        textType: 'content',
      }) as PPTTextElement
  );

  // Create PPT elements for right column
  const rightItemElements = rightItems.map(
    (item, index) =>
      ({
        id: crypto.randomUUID(),
        type: 'text',
        content: itemElements[leftItems.length + index]?.outerHTML || '',
        defaultFontName: item.text?.fontFamily,
        defaultColor: item.text?.color,
        left: item.bounds.left,
        top: item.bounds.top,
        width: item.bounds.width,
        height: item.bounds.height,
        textType: 'content',
      }) as PPTTextElement
  );

  const slide: Slide = {
    id: slideId ?? crypto.randomUUID(),
    elements: [
      ...LayoutProBuilder.buildTitle(
        data.title,
        { ...template.containers.title, bounds: resolvedBounds.title },
        template.theme
      ),
      ...leftItemElements,
      ...rightItemElements,
    ],
    background: LayoutPrimitives.processBackground(template.theme),
  };

  return slide;
};
