import type { Slide, SlideTheme } from '@/types/slides';
import { createTitleLine } from '../graphic';
import type { TitleLayoutSchema, TransitionLayoutSchema } from './types';
import type { Bounds, TextLayoutBlockInstance, TemplateConfig, TextTemplateContainer } from '../types';
import LayoutPrimitives from '../layoutPrimitives';

const SLIDE_WIDTH = 1000;
const SLIDE_HEIGHT = 562.5;

export const getTitleLayoutTemplate = (theme: SlideTheme): TemplateConfig => {
  const titleBounds: Bounds = {
    left: 0,
    top: SLIDE_HEIGHT * 0.28,
    width: SLIDE_WIDTH,
    height: 120,
  };

  const subtitleBounds: Bounds = {
    left: SLIDE_WIDTH * 0.06,
    top: 0, // Will be calculated relative to title
    width: SLIDE_WIDTH * 0.88,
    height: 80,
  };

  return {
    containers: {
      title: {
        bounds: titleBounds,
        padding: { top: 0, bottom: 0, left: 0, right: 0 },
        horizontalAlignment: 'center',
        verticalAlignment: 'center',
        text: {
          color: theme.titleFontColor,
          fontFamily: theme.titleFontName,
          fontWeight: 'bold',
          fontStyle: 'normal',
        },
      } satisfies TextTemplateContainer,
      subtitle: {
        bounds: subtitleBounds,
        padding: { top: 0, bottom: 0, left: 0, right: 0 },
        horizontalAlignment: 'center',
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

export const convertTitleLayout = async (
  data: TitleLayoutSchema | TransitionLayoutSchema,

  template: TemplateConfig,
  slideId?: string
): Promise<Slide> => {
  const hasSubtitle = !!data.data.subtitle;

  // Merge template config with bounds to create instances
  const titleInstance = {
    ...template.containers.title,
    ...template.containers.title.bounds,
  } as TextLayoutBlockInstance;

  const { titleContent, titleDimensions, titlePosition } = LayoutPrimitives.calculateTitleLayout(
    data.data.title,
    titleInstance
  );

  const elements = [
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
  ];

  // Add subtitle if present
  if (hasSubtitle && data.data.subtitle) {
    const subtitleInstance = {
      ...template.containers.subtitle,
      ...template.containers.subtitle.bounds,
      top: titlePosition.top + titleDimensions.height + 32, // Position below title
    } as TextLayoutBlockInstance;

    const subtitleElements = await LayoutPrimitives.createItemElementsWithStyles(
      [data.data.subtitle],
      subtitleInstance
    );
    elements.push(...subtitleElements);
  }

  // If no subtitle, recenter the title vertically
  if (!hasSubtitle) {
    const centeredTop = (SLIDE_HEIGHT - titleDimensions.height) / 2;
    const diff = centeredTop - titlePosition.top;
    elements[0].top += diff / 2;
    elements[1].top += diff / 2;
  }

  const slide: Slide = {
    id: slideId ?? crypto.randomUUID(),
    elements,
  };

  return slide;
};

export const convertTransitionLayout = async (
  data: TransitionLayoutSchema,
  template: TemplateConfig,
  slideId?: string
) => {
  return await convertTitleLayout(data, template, slideId);
};
