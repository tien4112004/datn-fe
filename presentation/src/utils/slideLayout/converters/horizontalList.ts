import type { Slide, SlideTheme } from '@/types/slides';
import { createTitleLine } from '../graphic';
import type { HorizontalListLayoutSchema } from './types';
import type { Bounds, TextLayoutBlockInstance, TemplateConfig } from '../types';
import LayoutPrimitives from '../layoutPrimitives';

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
        bounds: contentBounds,
        padding: { top: 0, bottom: 0, left: 0, right: 0 },
        distribution: 'equal',
        spacingBetweenItems: 25,
        horizontalAlignment: 'center',
        verticalAlignment: 'top',
        orientation: 'vertical',
        text: {
          color: theme.fontColor,
          fontFamily: theme.fontName,
          fontWeight: 'normal',
          fontStyle: 'normal',
        },
        childTemplate: {
          label: 'row',
          count: 2,
          structure: {
            padding: { top: 0, bottom: 0, left: 0, right: 0 },
            distribution: 'equal',
            spacingBetweenItems: 0,
            horizontalAlignment: 'center',
            verticalAlignment: 'top',
            orientation: 'horizontal',
            childTemplate: {
              label: 'item',
              count: 'auto',
              structure: {
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
                distribution: 'equal',
                spacingBetweenItems: 15,
                horizontalAlignment: 'center',
                verticalAlignment: 'center',
                orientation: 'vertical',
                children: [
                  {
                    padding: { top: 0, bottom: 0, left: 0, right: 0 },
                    horizontalAlignment: 'center',
                    verticalAlignment: 'center',
                    text: {
                      color: theme.fontColor,
                      fontFamily: theme.fontName,
                      fontWeight: 'bold',
                      fontStyle: 'normal',
                    },
                  },
                  {
                    padding: { top: 0, bottom: 0, left: 0, right: 0 },
                    horizontalAlignment: 'center',
                    verticalAlignment: 'center',
                    text: {
                      color: theme.fontColor,
                      fontFamily: theme.fontName,
                      fontWeight: 'normal',
                      fontStyle: 'normal',
                    },
                  },
                ],
              },
            },
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
  // Merge template config with bounds to create instances
  const titleInstance = {
    ...template.containers.title,
    ...template.containers.title.bounds,
  } as TextLayoutBlockInstance;
  const contentInstance = {
    ...template.containers.content,
    ...template.containers.content.bounds,
  } as TextLayoutBlockInstance;

  const { titleContent, titleDimensions, titlePosition } = LayoutPrimitives.calculateTitleLayout(
    data.title,
    titleInstance
  );

  const rows = LayoutPrimitives.getChildrenMaxBounds(template.containers.content);

  // Flatten items for each row: labels and content separately
  const topRowLabels = data.data.items
    .slice(0, rows[0] ? Math.ceil(data.data.items.length / 2) : 0)
    .map((item) => item.label);
  const topRowContents = data.data.items
    .slice(0, rows[0] ? Math.ceil(data.data.items.length / 2) : 0)
    .map((item) => item.content);

  const bottomRowLabels = rows[1]
    ? data.data.items.slice(Math.ceil(data.data.items.length / 2)).map((item) => item.label)
    : [];
  const bottomRowContents = rows[1]
    ? data.data.items.slice(Math.ceil(data.data.items.length / 2)).map((item) => item.content)
    : [];

  // Create label and content elements for top row
  const topRowLabelElements = await LayoutPrimitives.createItemElementsWithStyles(topRowLabels, {
    ...template.containers.content.children?.[0],
    ...rows[0],
    height: rows[0] ? rows[0].height * 0.3 : 0,
  } as TextLayoutBlockInstance);

  const topRowContentElements = await LayoutPrimitives.createItemElementsWithStyles(topRowContents, {
    ...template.containers.content.children?.[0],
    ...rows[0],
    top: rows[0] ? rows[0].top + rows[0].height * 0.3 + 15 : 0,
    height: rows[0] ? rows[0].height * 0.7 - 15 : 0,
  } as TextLayoutBlockInstance);

  // Create label and content elements for bottom row
  const bottomRowLabelElements = rows[1]
    ? await LayoutPrimitives.createItemElementsWithStyles(bottomRowLabels, {
        ...template.containers.content.children?.[1],
        ...rows[1],
        height: rows[1].height * 0.3,
      } as TextLayoutBlockInstance)
    : [];

  const bottomRowContentElements = rows[1]
    ? await LayoutPrimitives.createItemElementsWithStyles(bottomRowContents, {
        ...template.containers.content.children?.[1],
        ...rows[1],
        top: rows[1].top + rows[1].height * 0.3 + 15,
        height: rows[1].height * 0.7 - 15,
      } as TextLayoutBlockInstance)
    : [];

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
      ...topRowLabelElements,
      ...topRowContentElements,
      ...bottomRowLabelElements,
      ...bottomRowContentElements,
    ],
  };

  return slide;
};
