import type { Slide, SlideTheme, PPTTextElement } from '@/types/slides';
import type { VerticalListLayoutSchema } from './types';
import type { Bounds, TemplateConfig } from '../types';
import LayoutPrimitives from '../layoutPrimitives';
import LayoutProBuilder from '../layoutProbuild';

const SLIDE_WIDTH = 1000;
const SLIDE_HEIGHT = 562.5;

export const getVerticalListLayoutTemplate = (theme: SlideTheme): TemplateConfig => {
  const titleBounds: Bounds = {
    left: 0,
    top: 15,
    width: SLIDE_WIDTH,
    height: 120,
  };

  return {
    containers: {
      title: {
        bounds: titleBounds,
        padding: { top: 0, bottom: 0, left: 0, right: 0 },
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
        id: 'content',
        positioning: {
          relativeTo: 'title',
          axis: 'vertical',
          anchor: 'end',
          offset: 20,
          size: 'fill',
          margin: { left: 30, right: 30, top: 0, bottom: 40 },
        },
        padding: { top: 0, bottom: 0, left: 0, right: 0 },
        distribution: 'space-between',
        spacingBetweenItems: 20,
        verticalAlignment: 'top',
        orientation: 'vertical',
        childTemplate: {
          count: 'auto',
          wrap: {
            enabled: true,
            maxItemsPerLine: 4,
            lineCount: 'auto',
            distribution: 'balanced',
            lineSpacing: 20,
            alternating: false,
          },
          structure: {
            label: 'item',
            padding: { top: 0, bottom: 0, left: 0, right: 0 },
            horizontalAlignment: 'left',
            verticalAlignment: 'center',
            border: {
              width: 1,
              color: theme.themeColors[0],
            },
            text: {
              color: theme.fontColor,
              fontFamily: theme.fontName,
              fontWeight: 'normal',
              fontStyle: 'normal',
              textAlign: 'left',
            },
          },
        },
      },
    },
    theme,
  };
};

export const convertVerticalListLayout = async (
  data: VerticalListLayoutSchema,
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
  const itemInstances = LayoutPrimitives.recursivelyGetAllLabelInstances(contentInstance, 'item');

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
      ...LayoutProBuilder.buildTitle(data.title, template.containers.title, template.theme),
      ...contentElements,
      ...LayoutProBuilder.buildCards(contentInstance),
    ],
    background: LayoutPrimitives.processBackground(template.theme),
  };

  return slide;
};
