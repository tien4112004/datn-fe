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
        type: 'text' as const,
        bounds: {
          left: 15,
          top: 15,
          width: SLIDE_WIDTH - 30,
          height: 100,
        },
        padding: { top: 0, bottom: 0, left: 40, right: 40 },
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
      content: {
        type: 'block' as const,
        // Using relative positioning - positioned below title
        positioning: {
          relativeTo: 'title',
          axis: 'vertical',
          anchor: 'end',
          offset: 20,
          size: 'fill',
          margin: { left: 30, right: 30, top: 0, bottom: 40 },
        },
        padding: { top: 0, bottom: 0, left: 0, right: 0 },
        layout: {
          distribution: 'space-between',
          spacingBetweenItems: 20,
          horizontalAlignment: 'center',
          verticalAlignment: 'top',
          orientation: 'vertical',
        },
        childTemplate: {
          count: 'auto',
          wrap: {
            enabled: true,
            maxItemsPerLine: 4,
            lineCount: 2,
            distribution: 'balanced',
            lineSpacing: 15,
            alternating: true,
          },
          structure: {
            type: 'text' as const,
            label: 'item',
            padding: { top: 0, bottom: 0, left: 0, right: 0 },
            layout: {
              distribution: 'equal',
              horizontalAlignment: 'left',
              verticalAlignment: 'top',
            },
            text: {
              color: theme.fontColor,
              fontFamily: theme.fontName,
              fontWeight: 'normal',
              fontStyle: 'normal',
              lineHeight: 1.7,
            },
            border: {
              color: theme.themeColors[0],
              width: 1,
              radius: 8,
            },
          },
        },
      },
    },
    theme,
  };
};

export const getHorizontalListLayoutTemplateOneRow = (theme: SlideTheme): TemplateConfig => {
  return {
    containers: {
      title: {
        type: 'text' as const,
        bounds: {
          left: 15,
          top: 15,
          width: SLIDE_WIDTH - 30,
          height: 100,
        },
        padding: { top: 0, bottom: 0, left: 40, right: 40 },
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
      content: {
        type: 'block' as const,
        bounds: {
          left: 60,
          top: 140,
          width: SLIDE_WIDTH - 120,
          height: SLIDE_HEIGHT - 155 - 40,
        },
        padding: { top: 0, bottom: 0, left: 0, right: 0 },
        layout: {
          distribution: 'space-around',
          horizontalAlignment: 'center',
          verticalAlignment: 'center',
          orientation: 'horizontal',
        },
        childTemplate: {
          count: 'auto',
          structure: {
            type: 'text' as const,
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
      item: [...data.data.items1, ...data.data.items2].map((item) => item),
    }
  );

  const itemInstances = LayoutPrimitives.recursivelyGetAllLabelInstances(
    contentInstance,
    'item'
  ) as TextLayoutBlockInstance[];
  const contentElements = elements['item'] || [];

  const itemElements = contentElements
    .map((labelEl, index) => {
      return [
        LayoutPrimitives.createCard(itemInstances[index]),
        {
          id: crypto.randomUUID(),
          type: 'text',
          content: labelEl.outerHTML,
          defaultFontName: itemInstances[index].text?.fontFamily,
          defaultColor: itemInstances[index].text?.color,
          left: itemInstances[index].bounds.left,
          top: itemInstances[index].bounds.top,
          width: itemInstances[index].bounds.width,
          height: itemInstances[index].bounds.height,
          textType: 'content',
          lineHeight: itemInstances[index].text?.lineHeight,
        } as PPTTextElement,
      ];
    })
    .flat();

  const slide: Slide = {
    id: slideId ?? crypto.randomUUID(),
    elements: [
      ...LayoutProBuilder.buildTitle(
        data.title,
        { ...template.containers.title, bounds: resolvedBounds.title },
        template.theme
      ),
      ...itemElements,
    ],
    background: LayoutPrimitives.processBackground(template.theme),
  };

  return slide;
};
