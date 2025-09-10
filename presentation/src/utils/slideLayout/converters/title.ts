import type { PPTTextElement, Slide, SlideTheme } from '@/types/slides';
import { SlideLayoutCalculator, type SlideViewport, type ElementBounds } from '../slideLayout';
import { calculateLargestOptimalFontSize, applyFontSizeToElement } from '../fontSizeCalculator';
import { createItemElement } from '../htmlTextCreation';
import { generateUniqueId } from '../utils';
import { createTitlePPTElement, calculateTitleLayout, createTitleLine } from '../graphic';
import type { TitleLayoutSchema, TransitionLayoutSchema } from './types';

export const convertTitleSlide = async (
  data: TitleLayoutSchema,
  viewport: SlideViewport,
  theme: SlideTheme
) => {
  // Initialize layout calculator
  const layoutCalculator = new SlideLayoutCalculator(viewport.size, viewport.ratio, theme);

  // Calculate title layout using the new helper
  const titleAvailableHeight = Math.max(120, layoutCalculator.slideHeight * 0.18);
  let titleTop = layoutCalculator.slideHeight * 0.28;

  // If no subtitle, center the title more vertically - need to calculate dimensions first
  const titleAvailableBlock = {
    left: 0,
    top: titleTop,
    width: layoutCalculator.slideWidth,
    height: titleAvailableHeight,
  };

  let { titleContent, titleDimensions, titlePosition } = calculateTitleLayout(
    data.data.title,
    titleAvailableBlock,
    layoutCalculator,
    theme
  );

  // If no subtitle, recalculate with centered position
  if (!data.data.subtitle) {
    titleTop = (layoutCalculator.slideHeight - titleDimensions.height) / 2;
    const centeredTitleBlock = {
      ...titleAvailableBlock,
      top: titleTop,
    };
    const centeredLayout = calculateTitleLayout(data.data.title, centeredTitleBlock, layoutCalculator, theme);
    titleContent = centeredLayout.titleContent;
    titleDimensions = centeredLayout.titleDimensions;
    titlePosition = centeredLayout.titlePosition;
  }

  // Subtitle (optional)
  let subtitleElement = null;
  if (data.data.subtitle) {
    const subtitleAvailableWidth = layoutCalculator.slideWidth * 0.88;
    const subtitleAvailableHeight = Math.max(60, layoutCalculator.slideHeight * 0.08);

    const subtitleTempElement = createItemElement({
      content: data.data.subtitle,
      fontSize: 20, // Initial size, will be optimized
      lineHeight: 1.4,
      fontFamily: theme.fontName,
      color: theme.fontColor,
    });

    const subtitleFontSize = calculateLargestOptimalFontSize(
      subtitleTempElement,
      subtitleAvailableWidth,
      subtitleAvailableHeight,
      'content'
    );

    // Apply the calculated font size to the element
    applyFontSizeToElement(subtitleTempElement, subtitleFontSize, 1.4);
    const subtitleContent = `<p style="text-align: center;"><span style="font-size: ${subtitleFontSize}px;">${data.data.subtitle}</span></p>`;
    // Calculate subtitle dimensions using element-based measurement
    const subtitleDimensions = layoutCalculator.measureHTMLElement(subtitleTempElement, {
      maxWidth: subtitleAvailableWidth,
      maxHeight: subtitleAvailableHeight,
    });
    subtitleElement = {
      id: generateUniqueId(),
      type: 'text',
      content: subtitleContent,
      defaultFontName: theme.fontName,
      defaultColor: theme.fontColor,
      left: layoutCalculator.getHorizontallyCenterPosition(subtitleDimensions.width),
      top: titlePosition.top + titleDimensions.height + 32,
      width: subtitleDimensions.width,
      height: subtitleDimensions.height,
    } as PPTTextElement;
  }

  // Create slide elements
  const elements = [
    createTitlePPTElement(
      titleContent,
      { left: titlePosition.left, top: titlePosition.top },
      { width: titleDimensions.width, height: titleDimensions.height },
      theme
    ),
    createTitleLine(
      {
        width: titleDimensions.width,
        height: titleDimensions.height,
        left: titlePosition.left,
        top: titlePosition.top,
      } as ElementBounds,
      theme
    ),
  ];
  if (subtitleElement) {
    elements.push(subtitleElement);
  }

  const slide: Slide = {
    id: generateUniqueId(),
    elements,
  };
  return slide;
};

export const convertTransition = async (
  data: TransitionLayoutSchema,
  viewport: SlideViewport,
  theme: SlideTheme
) => {
  return await convertTitleSlide(data, viewport, theme);
};
