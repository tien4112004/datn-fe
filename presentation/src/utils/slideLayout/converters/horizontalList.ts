import type { HorizontalListLayoutSchema } from './types';
import type { Bounds, TemplateConfig } from '../types';
import LayoutPrimitives from '../layoutPrimitives';
import type { PPTTextElement, Slide, SlideTheme } from '@/types/slides';
import LayoutProBuilder from '../layoutProbuild';

const SLIDE_WIDTH = 1000;
const SLIDE_HEIGHT = 562.5;

export const getHorizontalListLayoutTemplate = (theme: SlideTheme): TemplateConfig => {
  const titleBounds: Bounds = {
    left: 0,
    top: 15,
    width: SLIDE_WIDTH,
    height: 120,
  };

  const contentBounds: Bounds = {
    left: 40,
    top: 15 + 120,
    width: SLIDE_WIDTH - 80,
    height: SLIDE_HEIGHT - (15 + 120) - 40,
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
        bounds: contentBounds,
        padding: { top: 0, bottom: 0, left: 0, right: 0 },
        distribution: 'space-around',
        spacingBetweenItems: 25,
        horizontalAlignment: 'center',
        verticalAlignment: 'center',
        orientation: 'horizontal',
        childTemplate: {
          count: 'auto',
          wrap: {
            enabled: true,
            maxItemsPerLine: 4,
            lineCount: 'auto',
            distribution: 'balanced',
            lineSpacing: 15,
            alternating: true,
          },
          structure: {
            label: 'item',
            padding: { top: 0, bottom: 0, left: 0, right: 0 },
            distribution: 'equal',
            spacingBetweenItems: -20,
            horizontalAlignment: 'center',
            verticalAlignment: 'top',
            orientation: 'vertical',
            border: {
              color: theme.themeColors[0],
              width: 1,
              radius: 8,
            },
            children: [
              {
                id: 'label',
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
                horizontalAlignment: 'center',
                verticalAlignment: 'center',
                label: 'label',
                text: {
                  color: theme.fontColor,
                  fontFamily: theme.fontName,
                  fontWeight: 'bold',
                  fontStyle: 'normal',
                  textAlign: 'center',
                },
              },
              {
                id: 'content',
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
                horizontalAlignment: 'center',
                verticalAlignment: 'center',
                label: 'content',
                text: {
                  color: theme.fontColor,
                  fontFamily: theme.fontName,
                  fontWeight: 'normal',
                  fontStyle: 'normal',
                  textAlign: 'center',
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

export const convertHorizontalListLayout = async (
  data: HorizontalListLayoutSchema,
  template: TemplateConfig,
  slideId?: string
): Promise<Slide> => {
  const resolvedBounds = LayoutPrimitives.resolveContainerPositions(template.containers, {
    width: SLIDE_WIDTH,
    height: SLIDE_HEIGHT,
  });

  const contentContainer = template.containers.content;
  const { instance: contentInstance, elements } = LayoutProBuilder.buildLayoutWithUnifiedFontSizing(
    contentContainer,
    resolvedBounds.content,
    {
      label: data.data.items.map((item) => item.label),
      content: data.data.items.map((item) => item.content),
    }
  );

  // Get labeled instances for bounds
  const labels = LayoutPrimitives.recursivelyGetAllLabelInstances(contentInstance, 'label');
  const contents = LayoutPrimitives.recursivelyGetAllLabelInstances(contentInstance, 'content');
  const itemInstances = LayoutPrimitives.recursivelyGetAllLabelInstances(contentInstance, 'item');

  // Extract elements by label
  const labelElements = elements['label'] || [];
  const contentElements = elements['content'] || [];

  // Generate PPT elements from pre-created elements
  const itemElements = labelElements
    .map((labelEl, index) => {
      return [
        LayoutPrimitives.createCard(itemInstances[index]),
        {
          id: crypto.randomUUID(),
          type: 'text',
          content: labelEl.outerHTML,
          defaultFontName: labels[index].text?.fontFamily,
          defaultColor: labels[index].text?.color,
          left: labels[index].bounds.left,
          top: labels[index].bounds.top,
          width: labels[index].bounds.width,
          height: labels[index].bounds.height,
          textType: 'content',
        } as PPTTextElement,
        {
          id: crypto.randomUUID(),
          type: 'text',
          content: contentElements[index].outerHTML,
          defaultFontName: contents[index].text?.fontFamily,
          defaultColor: contents[index].text?.color,
          left: contents[index].bounds.left,
          top: contents[index].bounds.top,
          width: contents[index].bounds.width,
          height: contents[index].bounds.height,
          textType: 'content',
        } as PPTTextElement,
      ];
    })
    .flat();

  const slide: Slide = {
    id: slideId ?? crypto.randomUUID(),
    elements: [
      ...LayoutProBuilder.buildTitle(data.title, template.containers.title, template.theme),
      ...itemElements,
    ],
    background: LayoutPrimitives.processBackground(template.theme),
  };

  return slide;
};
