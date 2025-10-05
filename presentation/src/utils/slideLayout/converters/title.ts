import type { Slide, SlideTheme } from '@/types/slides';
import type { TitleLayoutSchema, TransitionLayoutSchema } from './types';
import type { Bounds, TextLayoutBlockInstance, TemplateConfig, TextTemplateContainer } from '../types';
import LayoutPrimitives from '../layoutPrimitives';
import LayoutProBuilder from '../layoutProbuild';

const SLIDE_WIDTH = 1000;
const SLIDE_HEIGHT = 562.5;

export const getTitleLayoutTemplate = (theme: SlideTheme): TemplateConfig => {
  const titleBounds: Bounds = {
    left: 0,
    top: SLIDE_HEIGHT * 0.28,
    width: SLIDE_WIDTH,
    height: 120,
  };

  return {
    containers: {
      title: {
        type: 'text' as const,
        bounds: titleBounds,
        padding: { top: 0, bottom: 0, left: 0, right: 0 },
        layout: {
          horizontalAlignment: 'center',
          verticalAlignment: 'center',
        },
        text: {
          color: theme.titleFontColor,
          fontFamily: theme.titleFontName,
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'center',
        },
      },
      subtitle: {
        type: 'text' as const,
        positioning: {
          relativeTo: 'title',
          axis: 'vertical',
          anchor: 'end',
          offset: 0,
          size: 120,
          margin: { left: 30, right: 30, top: 0, bottom: 40 },
        },
        padding: { top: 0, bottom: 0, left: 0, right: 0 },
        layout: {
          horizontalAlignment: 'center',
          verticalAlignment: 'top',
        },
        text: {
          color: theme.fontColor,
          fontFamily: theme.fontName,
          fontWeight: 'normal',
          fontStyle: 'normal',
          textAlign: 'center',
        },
      },
    },
    theme,
  };
};

export const convertTitleLayout = async (
  data: TitleLayoutSchema | TransitionLayoutSchema,

  template: TemplateConfig,
  slideId?: string
): Promise<Slide> => {
  const hasSubtitle = !!data.data.subtitle;

  // Resolve container positions (handles both absolute and relative positioning)
  const resolvedBounds = LayoutPrimitives.resolveContainerPositions(template.containers, {
    width: SLIDE_WIDTH,
    height: SLIDE_HEIGHT,
  });

  // Merge template config with bounds to create instances
  const titleInstance = {
    ...template.containers.title,
    bounds: resolvedBounds.title,
  } as TextLayoutBlockInstance;

  const subtitleInstance = {
    ...template.containers.subtitle,
    bounds: resolvedBounds.subtitle,
  } as TextLayoutBlockInstance;

  const { titleContent, titleDimensions, titlePosition } = LayoutPrimitives.calculateTitleLayout(
    data.data.title,
    titleInstance
  );

  const elements = [
    ...LayoutProBuilder.buildTitle(data.data.title, template.containers.title, template.theme),
  ];

  // Add subtitle if present
  if (hasSubtitle && data.data.subtitle) {
    const subtitleElement = await LayoutPrimitives.createElement(data.data.subtitle, subtitleInstance);

    elements.push(subtitleElement);
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
    background: LayoutPrimitives.processBackground(template.theme),
  };

  return slide;
};

export const getTransitionLayoutTemplate = (theme: SlideTheme): TemplateConfig => {
  return getTitleLayoutTemplate(theme);
};

export const convertTransitionLayout = async (
  data: TransitionLayoutSchema,
  template: TemplateConfig,
  slideId?: string
) => {
  return await convertTitleLayout(data, template, slideId);
};
