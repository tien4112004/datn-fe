import type { Slide, SlideTheme, PPTTextElement } from '@/types/slides';
import type { TableOfContentsLayoutSchema } from './types';
import type { TextLayoutBlockInstance, TemplateConfig } from '../types';
import LayoutPrimitives from '../layoutPrimitives';
import LayoutProBuilder from '../layoutProbuild';

const SLIDE_WIDTH = 1000;
const SLIDE_HEIGHT = 562.5;

export const getTableOfContentsLayoutTemplate = (theme: SlideTheme): TemplateConfig => {
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
          margin: { left: 60, right: 60, top: 0, bottom: 40 },
        },
        padding: { top: 0, bottom: 0, left: 0, right: 0 },
        layout: {
          distribution: 'space-between',
          spacingBetweenItems: 25,
          horizontalAlignment: 'left',
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
            lineSpacing: 20,
            alternating: false,
          },
          structure: {
            type: 'text' as const,
            label: 'item',
            padding: { top: 0, bottom: 0, left: 0, right: 0 },
            layout: {
              horizontalAlignment: 'left',
              verticalAlignment: 'top',
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

export const convertTableOfContentsLayout = async (
  data: TableOfContentsLayoutSchema,
  template: TemplateConfig,
  slideId?: string
): Promise<Slide> => {
  // Add numbering to items
  const numberedItems = data.data.items.map((item, index) => `${index + 1}. ${item}`);

  // Resolve container positions (handles both absolute and relative positioning)
  const resolvedBounds = LayoutPrimitives.resolveContainerPositions(template.containers, {
    width: SLIDE_WIDTH,
    height: SLIDE_HEIGHT,
  });

  // Content container - use unified font sizing
  const contentContainer = template.containers.content;
  const { instance: contentInstance, elements } = LayoutProBuilder.buildLayoutWithUnifiedFontSizing(
    contentContainer,
    resolvedBounds.content,
    {
      item: numberedItems,
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
  const contentElements = itemElements
    .map((itemEl, index) => {
      return [
        {
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
        } as PPTTextElement,
      ];
    })
    .flat();

  const slide: Slide = {
    id: slideId ?? crypto.randomUUID(),
    elements: [
      ...LayoutProBuilder.buildCards(contentInstance),
      ...LayoutProBuilder.buildTitle('Contents', template.containers.title, template.theme),
      ...contentElements,
    ],
    background: LayoutPrimitives.processBackground(template.theme),
  };

  return slide;
};
