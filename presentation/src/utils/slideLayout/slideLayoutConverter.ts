import type { PPTTextElement, Slide, SlideTheme } from '@/types/slides';
import {
  SlideLayoutCalculator,
  type SlideViewport,
  type Size,
  type ElementBounds,
  type ImageBounds,
  type LayoutBlock,
} from './slideLayout';
import { calculateLargestOptimalFontSize, calculateFontSizeForAvailableSpace } from './fontSizeCalculator';
import { generateUniqueId } from './utils';
import {
  createTitleLine,
  createImageElement,
  createItemElements,
  createItemElementsWithStyles,
  createTitleElement,
  calculateTitleLayout,
  createHorizontalItemBlocks,
  createHorizontalItemElements,
  calculateRowDistribution,
  type ItemStyles,
} from './graphic';

export interface TwoColumnWithImageLayoutSchema {
  type: string;
  title: string;
  data: {
    image: string;
    items: string[];
  };
}

export interface MainImageLayoutSchema {
  type: string;
  data: {
    image: string;
    content: string;
  };
}

export interface TitleLayoutSchema {
  type: string;
  data: {
    title: string;
    subtitle?: string;
  };
}

export interface TwoColumnLayoutSchema {
  type: string;
  data: {
    title: string;
    items1: string[];
    items2: string[];
  };
}

export interface VerticalListLayoutSchema {
  type: string;
  title: string;
  data: {
    items: string[];
  };
}

export interface HorizontalListLayoutSchema {
  type: string;
  title: string;
  data: {
    items: {
      label: string;
      content: string;
    }[];
  };
}

export interface TransitionLayoutSchema {
  type: string;
  data: {
    title: string;
    subtitle: string;
  };
}

export interface TableOfContentsLayoutSchema {
  type: string;
  data: {
    items: string[];
  };
}

// function formatItemContent(content: string, fontSize: number): string {
//   return `<p style="text-align: left;"><span style="font-size: ${fontSize}px;">${content}</span></p>`;
// }

export const convertTwoColumnWithImage = async (
  data: TwoColumnWithImageLayoutSchema,
  viewport: SlideViewport,
  theme: SlideTheme
) => {
  // Initialize layout calculator
  const layoutCalculator = new SlideLayoutCalculator(viewport.size, viewport.ratio, theme);

  // Calculate available space for content column (column 1, right side)
  const columns = layoutCalculator.getColumnsLayout([50, 50]);
  const contentColumnBlock = {
    ...columns[1],
    height: layoutCalculator.calculateAvailableHeight(100, 40),
  };

  // Calculate title layout using the new helper
  const titleAvailableBlock = {
    left: 0,
    top: 15,
    width: layoutCalculator.slideWidth,
    height: 120,
  };
  const { titleContent, titleDimensions, titlePosition } = calculateTitleLayout(
    data.title,
    titleAvailableBlock,
    layoutCalculator
  );
  const imageDimensions = layoutCalculator.calculateImageDimensions();

  // Get image position in first column
  const imagePosition = layoutCalculator.getColumnCenterPosition(
    imageDimensions.height,
    imageDimensions.width,
    0
  );

  // Calculate unified styles for items
  const contentAvailableBlock = {
    ...contentColumnBlock,
    top: contentColumnBlock.top + titleDimensions.height + 40,
  };
  const contentStyles: ItemStyles = calculateFontSizeForAvailableSpace(
    data.data.items,
    contentAvailableBlock.width,
    contentAvailableBlock.height,
    viewport
  );

  // Create item elements using the unified styles
  const itemElements = await createItemElementsWithStyles(
    data.data.items,
    contentAvailableBlock,
    layoutCalculator,
    theme,
    contentStyles,
    { alignment: 'center', leftMargin: 40 }
  );

  // Create slide elements
  const slide: Slide = {
    id: generateUniqueId(),
    elements: [
      createTitleElement(
        titleContent,
        { left: titlePosition.left, top: titlePosition.top },
        { width: titleDimensions.width, height: titleDimensions.height },
        theme
      ),
      await createImageElement(data.data.image, {
        ...imagePosition,
        ...imageDimensions,
      } as ImageBounds),
      // Graphic elements
      createTitleLine(
        {
          width: titleDimensions.width,
          height: titleDimensions.height,
          left: titlePosition.left,
          top: titlePosition.top,
        } as ElementBounds,
        theme
      ),

      // Item text elements with variable height positioning
      ...itemElements,
    ],
  };

  return slide;
};

export const convertTwoColumnWithBigImage = async (
  data: TwoColumnWithImageLayoutSchema,
  viewport: SlideViewport,
  theme: SlideTheme
) => {
  // Initialize layout calculator
  const layoutCalculator = new SlideLayoutCalculator(viewport.size, viewport.ratio, theme);

  // Use flexible column layout: 33% for image, 67% for content
  const columns = layoutCalculator.getColumnsLayout([33, 67]);
  const leftColumnBlock = columns[0];
  const contentColumnBlock = {
    ...columns[1],
    height: layoutCalculator.calculateAvailableHeight(0, 20),
  };

  // Calculate image dimensions to fit nicely in left column
  const imageHeight = viewport.size * viewport.ratio;
  const imageWidth = leftColumnBlock.width;

  // Calculate title layout using the new helper
  const titleAvailableBlock = {
    left: contentColumnBlock.left,
    top: 15,
    width: contentColumnBlock.width,
    height: 240,
  };
  const { titleContent, titleDimensions, titlePosition } = calculateTitleLayout(
    data.title,
    titleAvailableBlock,
    layoutCalculator
  );

  const contentAvailableWidth = contentColumnBlock.width;
  const contentAvailableHeight = contentColumnBlock.height - 160; // Reserve space for title

  const titleBottomOffset = titlePosition.top + titleDimensions.height + 40; // 40px spacing after title

  // Create item elements using the helper with custom available block
  const customAvailableBlock = {
    left: contentColumnBlock.left,
    top: titleBottomOffset,
    width: contentAvailableWidth,
    height: contentAvailableHeight,
  };

  // Calculate unified styles for items
  const contentStyles: ItemStyles = calculateFontSizeForAvailableSpace(
    data.data.items,
    customAvailableBlock.width,
    customAvailableBlock.height,
    viewport
  );

  const itemElements = await createItemElementsWithStyles(
    data.data.items,
    customAvailableBlock,
    layoutCalculator,
    theme,
    contentStyles,
    { alignment: 'top', leftMargin: 40 }
  );

  // Create slide elements
  const slide: Slide = {
    id: generateUniqueId(),
    elements: [
      createTitleElement(
        titleContent,
        { left: titlePosition.left, top: titlePosition.top },
        { width: titleDimensions.width, height: titleDimensions.height },
        theme
      ),
      await createImageElement(
        data.data.image,
        { left: 0, top: 0, width: imageWidth, height: imageHeight } as ImageBounds,
        { clip: 'auto' }
      ),
      //   Graphic elements
      createTitleLine(
        {
          width: titleDimensions.width,
          height: titleDimensions.height,
          left: titlePosition.left,
          top: titlePosition.top,
        } as ElementBounds,
        theme
      ),
      // Item text elements with variable height positioning
      ...itemElements,
    ],
  };

  return slide;
};

export const convertMainImage = async (
  data: MainImageLayoutSchema,
  viewport: SlideViewport,
  theme: SlideTheme
) => {
  // Initialize layout calculator
  const layoutCalculator = new SlideLayoutCalculator(viewport.size, viewport.ratio, theme);

  // Calculate image dimensions - larger for main image layout
  const imageWidth = layoutCalculator.slideWidth * 0.6; // 60% of slide width
  const imageHeight = imageWidth * (2 / 3); // Maintain 3:2 aspect ratio

  // Ensure image doesn't exceed 50% of slide height
  const maxImageHeight = layoutCalculator.slideHeight * 0.5;
  let finalImageWidth = imageWidth;
  let finalImageHeight = imageHeight;

  if (imageHeight > maxImageHeight) {
    finalImageHeight = maxImageHeight;
    finalImageWidth = finalImageHeight * (3 / 2);
  }

  // Calculate content area - below the image
  const contentMarginTop = 40; // Space between image and content
  const contentAreaTop =
    layoutCalculator.getVerticallyCenterPosition(finalImageHeight) + finalImageHeight + contentMarginTop;
  const contentAvailableHeight = layoutCalculator.slideHeight - contentAreaTop - 40; // Bottom margin
  const contentAvailableWidth = layoutCalculator.slideWidth * 0.8; // 80% of slide width

  // Calculate optimal font size for content
  const contentFontSize = calculateLargestOptimalFontSize(
    data.data.content,
    contentAvailableWidth,
    contentAvailableHeight,
    'content'
  );

  // Format content with calculated font size
  const contentText = `<p style="text-align: center;"><span style="font-size: ${contentFontSize}px;">${data.data.content}</span></p>`;

  // Calculate content dimensions
  const contentDimensions = layoutCalculator.calculateTextDimensions(contentText, {
    maxWidthRatio: 0.8,
    maxHeightRatio: 0.3,
    padding: 20,
  });

  // Calculate positions
  const imagePosition = {
    left: layoutCalculator.getHorizontallyCenterPosition(finalImageWidth),
    top: layoutCalculator.getVerticallyCenterPosition(finalImageHeight) - contentMarginTop / 2,
  };

  const contentPosition = {
    left: layoutCalculator.getHorizontallyCenterPosition(contentDimensions.width),
    top: imagePosition.top + finalImageHeight + contentMarginTop,
  };

  // Create slide elements
  const slide: Slide = {
    id: generateUniqueId(),
    elements: [
      await createImageElement(data.data.image, {
        ...imagePosition,
        width: finalImageWidth,
        height: finalImageHeight,
      } as ImageBounds),
      {
        id: generateUniqueId(),
        type: 'text',
        content: contentText,
        defaultFontName: theme.fontName,
        defaultColor: theme.fontColor,
        left: contentPosition.left,
        top: contentPosition.top,
        width: contentDimensions.width,
        height: contentDimensions.height,
      } as PPTTextElement,
    ],
  };

  return slide;
};

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
    layoutCalculator
  );

  // If no subtitle, recalculate with centered position
  if (!data.data.subtitle) {
    titleTop = (layoutCalculator.slideHeight - titleDimensions.height) / 2;
    const centeredTitleBlock = {
      ...titleAvailableBlock,
      top: titleTop,
    };
    const centeredLayout = calculateTitleLayout(data.data.title, centeredTitleBlock, layoutCalculator);
    titleContent = centeredLayout.titleContent;
    titleDimensions = centeredLayout.titleDimensions;
    titlePosition = centeredLayout.titlePosition;
  }

  // Subtitle (optional)
  let subtitleElement = null;
  if (data.data.subtitle) {
    const subtitleAvailableWidth = layoutCalculator.slideWidth * 0.88;
    const subtitleAvailableHeight = Math.max(60, layoutCalculator.slideHeight * 0.08);
    const subtitleFontSize = calculateLargestOptimalFontSize(
      data.data.subtitle,
      subtitleAvailableWidth,
      subtitleAvailableHeight,
      'content'
    );
    const subtitleContent = `<p style="text-align: center;"><span style="font-size: ${subtitleFontSize}px;">${data.data.subtitle}</span></p>`;
    // Use a larger maxWidthRatio for subtitle
    const subtitleDimensions = layoutCalculator.calculateTextDimensions(subtitleContent, {
      maxWidthRatio: 0.88,
      padding: 20,
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
    createTitleElement(
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

export const convertTwoColumn = async (
  data: TwoColumnLayoutSchema,
  viewport: SlideViewport,
  theme: SlideTheme
) => {
  // Initialize layout calculator
  const layoutCalculator = new SlideLayoutCalculator(viewport.size, viewport.ratio, theme);

  // Split slide into two equal columns
  const columns = layoutCalculator.getColumnsLayout([50, 50]);
  const leftColumnBlock = {
    ...columns[0],
    height: layoutCalculator.calculateAvailableHeight(40, 40),
  };
  const rightColumnBlock = {
    ...columns[1],
    height: layoutCalculator.calculateAvailableHeight(40, 40),
  };

  // Title
  const titleAvailableBlock = {
    left: 0,
    top: 15,
    width: layoutCalculator.slideWidth,
    height: 100,
  };
  const { titleContent, titleDimensions, titlePosition } = calculateTitleLayout(
    data.data.title,
    titleAvailableBlock,
    layoutCalculator
  );

  // Create item elements for each column, positioned below the title with more spacing
  const titleBottomSpacing = 60; // Increased spacing between title and content
  const leftContentBlock = {
    ...leftColumnBlock,
    top: leftColumnBlock.top + titleDimensions.height + titleBottomSpacing,
    height: leftColumnBlock.height - titleDimensions.height - titleBottomSpacing,
  };
  const rightContentBlock = {
    ...rightColumnBlock,
    top: rightColumnBlock.top + titleDimensions.height + titleBottomSpacing,
    height: rightColumnBlock.height - titleDimensions.height - titleBottomSpacing,
  };

  // Calculate unified styles for both columns combined
  const allItems = [...data.data.items1, ...data.data.items2];
  const unifiedBlock = {
    left: 0,
    top: 0,
    width: leftContentBlock.width,
    height: leftContentBlock.height * 2, // Account for both columns
  };
  const contentStyles: ItemStyles = calculateFontSizeForAvailableSpace(
    allItems,
    unifiedBlock.width,
    unifiedBlock.height,
    viewport
  );

  const leftItems = await createItemElementsWithStyles(
    data.data.items1,
    leftContentBlock,
    layoutCalculator,
    theme,
    contentStyles,
    { alignment: 'top', leftMargin: 40 }
  );
  const rightItems = await createItemElementsWithStyles(
    data.data.items2,
    rightContentBlock,
    layoutCalculator,
    theme,
    contentStyles,
    { alignment: 'top', leftMargin: 40 }
  );

  // Create slide elements
  const slide: Slide = {
    id: generateUniqueId(),
    elements: [
      createTitleElement(
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
      ...leftItems,
      ...rightItems,
    ],
  };

  return slide;
};

export const convertVerticalList = async (
  data: VerticalListLayoutSchema,
  viewport: SlideViewport,
  theme: SlideTheme
) => {
  // Initialize layout calculator
  const layoutCalculator = new SlideLayoutCalculator(viewport.size, viewport.ratio, theme);

  // Title
  const titleAvailableBlock = {
    left: 0,
    top: 15,
    width: layoutCalculator.slideWidth,
    height: 100,
  };
  const { titleContent, titleDimensions, titlePosition } = calculateTitleLayout(
    data.title,
    titleAvailableBlock,
    layoutCalculator
  );

  const titleBottomSpacing = 60;
  const items = data.data.items;

  // Auto-wrapping logic: if items > 5, split into two columns
  if (items.length > 5) {
    // Split into two columns
    const columns = layoutCalculator.getColumnsLayout([50, 50]);
    const leftColumnBlock = {
      ...columns[0],
      height: layoutCalculator.calculateAvailableHeight(40, 40),
    };
    const rightColumnBlock = {
      ...columns[1],
      height: layoutCalculator.calculateAvailableHeight(40, 40),
    };

    const columnContentHeight = leftColumnBlock.height - titleDimensions.height - titleBottomSpacing;

    // Create unified block for style calculation
    const unifiedBlock = {
      left: 0,
      top: 0,
      width: leftColumnBlock.width * 1.25, // Slightly increased width for better fit
      height: columnContentHeight * 2,
    };

    // Calculate unified styles using all items
    const contentStyles: ItemStyles = calculateFontSizeForAvailableSpace(
      items,
      unifiedBlock.width,
      unifiedBlock.height,
      viewport
    );

    // Split items into two columns
    const midpoint = Math.ceil(items.length / 2);
    const leftItems = items.slice(0, midpoint);
    const rightItems = items.slice(midpoint);

    // Create item elements for each column
    const leftItemElements = await createItemElementsWithStyles(
      leftItems,
      {
        ...leftColumnBlock,
        top: leftColumnBlock.top + titleDimensions.height + titleBottomSpacing,
        height: columnContentHeight,
      },
      layoutCalculator,
      theme,
      contentStyles,
      { alignment: 'top', leftMargin: 20 }
    );
    const rightItemsElements = await createItemElementsWithStyles(
      rightItems,
      {
        ...rightColumnBlock,
        top: rightColumnBlock.top + titleDimensions.height + titleBottomSpacing,
        height: columnContentHeight,
      },
      layoutCalculator,
      theme,
      contentStyles,
      { alignment: 'top', leftMargin: 20 }
    );

    // Create slide elements
    const slide: Slide = {
      id: generateUniqueId(),
      elements: [
        createTitleElement(
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
        ...leftItemElements,
        ...rightItemsElements,
      ],
    };

    return slide;
  } else {
    // Single column layout for 5 or fewer items
    const singleColumnBlock = {
      left: 0,
      top: titlePosition.top + titleDimensions.height + titleBottomSpacing,
      width: layoutCalculator.slideWidth,
      height: layoutCalculator.calculateAvailableHeight(40, 40) - titleDimensions.height - titleBottomSpacing,
    };

    // Calculate unified styles for items
    const contentStyles: ItemStyles = calculateFontSizeForAvailableSpace(
      items,
      singleColumnBlock.width,
      singleColumnBlock.height,
      viewport
    );

    // Create item elements using unified styles
    const itemElements = await createItemElementsWithStyles(
      items,
      singleColumnBlock,
      layoutCalculator,
      theme,
      contentStyles,
      { alignment: 'top', leftMargin: 60 }
    );

    // Create slide elements
    const slide: Slide = {
      id: generateUniqueId(),
      elements: [
        createTitleElement(
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
        ...itemElements,
      ],
    };

    return slide;
  }
};

export const convertHorizontalList = async (
  data: HorizontalListLayoutSchema,
  viewport: SlideViewport,
  theme: SlideTheme
) => {
  // Initialize layout calculator
  const layoutCalculator = new SlideLayoutCalculator(viewport.size, viewport.ratio, theme);

  // Calculate title layout
  const titleAvailableBlock = {
    left: 0,
    top: 15,
    width: layoutCalculator.slideWidth,
    height: 120,
  };

  const { titleContent, titleDimensions, titlePosition } = calculateTitleLayout(
    data.title,
    titleAvailableBlock,
    layoutCalculator
  );

  // Calculate available space for horizontal items
  const contentTopMargin = titlePosition.top + titleDimensions.height + 60; // Space after title and line
  const contentBottomMargin = 40; // Bottom margin
  const actualContentHeight = layoutCalculator.slideHeight - contentTopMargin - contentBottomMargin;

  const contentAvailableBlock = {
    left: 40, // Left margin
    top: contentTopMargin,
    width: layoutCalculator.slideWidth - 80, // Left and right margins
    height: actualContentHeight,
  };

  // Calculate row distribution
  const { topRowItems, bottomRowItems } = calculateRowDistribution(data.data.items.length);

  // Calculate column width based on the row with more items
  const maxItemsPerRow = Math.max(topRowItems, bottomRowItems || 0);
  const columnWidth = contentAvailableBlock.width / maxItemsPerRow;

  // Create horizontal item blocks
  const itemBlocks = createHorizontalItemBlocks(
    data.data.items,
    columnWidth,
    contentAvailableBlock.height,
    layoutCalculator,
    viewport
  );

  // Create horizontal item elements
  const itemElements = await createHorizontalItemElements(
    itemBlocks,
    contentAvailableBlock,
    layoutCalculator,
    theme
  );

  // Create slide
  const slide: Slide = {
    id: generateUniqueId(),
    elements: [
      createTitleElement(
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
      ...itemElements,
    ],
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

export const convertTableOfContents = async (
  data: TableOfContentsLayoutSchema,
  viewport: SlideViewport,
  theme: SlideTheme
) => {
  // Numbering
  const numberedItems = data.data.items.map((item, index) => `${index + 1}. ${item}`);

  // If too many items, switch to two-column layout
  if (numberedItems.length >= 8) {
    const newData = {
      type: 'two_column',
      data: {
        title: 'Contents',
        items1: numberedItems.slice(0, Math.ceil(numberedItems.length / 2)),
        items2: numberedItems.slice(Math.ceil(numberedItems.length / 2)),
      },
    } as TwoColumnLayoutSchema;

    return await convertTwoColumn(newData, viewport, theme);
  }

  // Initialize layout calculator
  const layoutCalculator = new SlideLayoutCalculator(viewport.size, viewport.ratio, theme);

  // Title "Contents"
  const titleText = 'Contents';
  const titleAvailableBlock = {
    left: 0,
    top: 15,
    width: layoutCalculator.slideWidth,
    height: 100,
  };
  const { titleContent, titleDimensions, titlePosition } = calculateTitleLayout(
    titleText,
    titleAvailableBlock,
    layoutCalculator
  );

  // Calculate available block for table of contents items
  const tocContentBlock = {
    left: 0,
    top: titlePosition.top + titleDimensions.height + 40, // Position below title with spacing
    width: layoutCalculator.slideWidth,
    height: layoutCalculator.slideHeight - (titlePosition.top + titleDimensions.height) - 40,
  };

  // Calculate unified styles for items
  const contentStyles: ItemStyles = calculateFontSizeForAvailableSpace(
    numberedItems,
    tocContentBlock.width,
    tocContentBlock.height,
    viewport
  );

  // Create item elements for table of contents
  const items = await createItemElementsWithStyles(
    numberedItems,
    tocContentBlock,
    layoutCalculator,
    theme,
    contentStyles,
    { alignment: 'top', leftMargin: 60 } // Increased left margin for better aesthetics
  );

  // Create slide elements
  const slide: Slide = {
    id: generateUniqueId(),
    elements: [
      createTitleElement(
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
      ...items,
    ],
  };

  return slide;
};

export const convertToSlide = async (data: any, viewport: SlideViewport, theme: SlideTheme) => {
  if (data.type === 'two_column_with_image') {
    return await convertTwoColumnWithImage(data, viewport, theme);
  }
  if (data.type === 'two_column_with_big_image') {
    return await convertTwoColumnWithBigImage(data, viewport, theme);
  }
  if (data.type === 'main_image') {
    return await convertMainImage(data, viewport, theme);
  }
  if (data.type === 'title') {
    return await convertTitleSlide(data, viewport, theme);
  }
  if (data.type === 'two_column') {
    return await convertTwoColumn(data, viewport, theme);
  }
  if (data.type === 'vertical_list') {
    return await convertVerticalList(data, viewport, theme);
  }
  if (data.type === 'horizontal_list') {
    return await convertHorizontalList(data, viewport, theme);
  }
  if (data.type === 'transition') {
    return await convertTransition(data, viewport, theme);
  }
  if (data.type === 'table_of_contents') {
    return await convertTableOfContents(data, viewport, theme);
  }
  throw new Error('Unsupported layout type');
};
