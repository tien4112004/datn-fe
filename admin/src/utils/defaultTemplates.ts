import type { SlideTemplate } from '@aiprimary/core';

const AVAILABLE_LAYOUTS = [
  'title',
  'list',
  'labeled_list',
  'two_column',
  'two_column_with_image',
  'main_image',
  'table_of_contents',
  'timeline',
  'pyramid',
] as const;

type LayoutType = (typeof AVAILABLE_LAYOUTS)[number];

/**
 * Default template structures for each layout type
 * These serve as starter templates when creating new templates
 */
export const DEFAULT_TEMPLATES: Record<LayoutType, Omit<SlideTemplate, 'id' | 'createdAt' | 'updatedAt'>> = {
  title: {
    name: 'New Title Template',
    layout: 'title',
    containers: {
      title: {
        type: 'text',
        bounds: {
          left: 50,
          top: 180,
          width: 900,
          height: 150,
        },
        layout: {
          horizontalAlignment: 'center',
          verticalAlignment: 'center',
        },
        text: {
          color: '{{theme.titleFontColor}}',
          fontFamily: '{{theme.titleFontName}}',
          fontWeight: 'bold',
          textAlign: 'center',
        },
      },
      content: {
        type: 'block',
        positioning: {
          relativeTo: 'title',
          axis: 'vertical',
          anchor: 'end',
          offset: 20,
          size: 'fill',
          margin: { left: 50, right: 50, top: 0, bottom: 40 },
        },
        layout: {
          distribution: 'equal',
          gap: 10,
          verticalAlignment: 'top',
          orientation: 'vertical',
        },
        childTemplate: {
          count: 'auto',
          structure: {
            type: 'text',
            label: 'subtitle',
            layout: {
              horizontalAlignment: 'center',
              verticalAlignment: 'center',
            },
            text: {
              color: '{{theme.fontColor}}',
              fontFamily: '{{theme.fontName}}',
              textAlign: 'center',
            },
          },
        },
      },
    },
  },

  list: {
    name: 'New List Template',
    layout: 'list',
    parameters: [
      {
        key: 'SIDE_PADDING',
        label: 'Side Padding (px)',
        defaultValue: 20,
        min: 0,
        max: 50,
        step: 1,
      },
    ],
    containers: {
      title: {
        type: 'text',
        bounds: {
          left: { expr: 'SIDE_PADDING' },
          top: 15,
          width: { expr: 'SLIDE_WIDTH - SIDE_PADDING * 2' },
          height: 120,
        },
        layout: {
          horizontalAlignment: 'center',
          verticalAlignment: 'top',
        },
        text: {
          color: '{{theme.titleFontColor}}',
          fontFamily: '{{theme.titleFontName}}',
          fontWeight: 'bold',
          textAlign: 'center',
        },
      },
      content: {
        type: 'block',
        positioning: {
          relativeTo: 'title',
          axis: 'vertical',
          anchor: 'end',
          offset: 20,
          size: 'fill',
          margin: { left: 0, right: 0, top: 0, bottom: 40 },
        },
        layout: {
          distribution: 'space-between',
          gap: 20,
          verticalAlignment: 'top',
          orientation: 'vertical',
        },
        childTemplate: {
          count: 'auto',
          wrap: {
            enabled: true,
            maxItemsPerLine: 4,
            lineCount: 'auto',
            wrapDistribution: 'balanced',
            lineSpacing: 20,
            syncSize: true,
          },
          structure: {
            type: 'text',
            label: 'item',
            layout: {
              horizontalAlignment: 'center',
              verticalAlignment: 'center',
            },
            border: {
              width: '{{theme.card.borderWidth}}',
              color: '{{theme.themeColors[0]}}',
              radius: '{{theme.card.borderRadius}}',
            },
            text: {
              color: '{{theme.fontColor}}',
              fontFamily: '{{theme.fontName}}',
              textAlign: 'left',
            },
          },
        },
      },
    },
  },

  labeled_list: {
    name: 'New Labeled List Template',
    layout: 'labeled_list',
    containers: {
      title: {
        type: 'text',
        bounds: {
          left: 30,
          top: 15,
          width: 940,
          height: 100,
        },
        layout: {
          horizontalAlignment: 'center',
          verticalAlignment: 'top',
        },
        text: {
          color: '{{theme.titleFontColor}}',
          fontFamily: '{{theme.titleFontName}}',
          fontWeight: 'bold',
          textAlign: 'center',
        },
      },
      content: {
        type: 'block',
        positioning: {
          relativeTo: 'title',
          axis: 'vertical',
          anchor: 'end',
          offset: 30,
          size: 'fill',
          margin: { left: 40, right: 40, top: 0, bottom: 40 },
        },
        layout: {
          distribution: 'equal',
          gap: 25,
          verticalAlignment: 'top',
          orientation: 'vertical',
        },
        childTemplate: {
          count: 'auto',
          structure: {
            type: 'block',
            layout: {
              distribution: '20/80',
              gap: 15,
              horizontalAlignment: 'left',
              verticalAlignment: 'top',
              orientation: 'horizontal',
            },
            children: [
              {
                type: 'text',
                label: 'label',
                text: {
                  color: '{{theme.labelFontColor}}',
                  fontFamily: '{{theme.labelFontName}}',
                  fontWeight: 'bold',
                  textAlign: 'right',
                },
              },
              {
                type: 'text',
                label: 'content',
                text: {
                  color: '{{theme.fontColor}}',
                  fontFamily: '{{theme.fontName}}',
                  textAlign: 'left',
                },
              },
            ],
          },
        },
      },
    },
  },

  two_column: {
    name: 'New Two Column Template',
    layout: 'two_column',
    containers: {
      title: {
        type: 'text',
        bounds: {
          left: 30,
          top: 15,
          width: 940,
          height: 100,
        },
        layout: {
          horizontalAlignment: 'center',
          verticalAlignment: 'top',
        },
        text: {
          color: '{{theme.titleFontColor}}',
          fontFamily: '{{theme.titleFontName}}',
          fontWeight: 'bold',
          textAlign: 'center',
        },
      },
      leftColumn: {
        type: 'block',
        bounds: {
          left: 40,
          top: 130,
          width: 440,
          height: 390,
        },
        layout: {
          distribution: 'equal',
          gap: 15,
          verticalAlignment: 'top',
          orientation: 'vertical',
        },
        childTemplate: {
          count: 'auto',
          structure: {
            type: 'text',
            label: 'item',
            text: {
              color: '{{theme.fontColor}}',
              fontFamily: '{{theme.fontName}}',
              textAlign: 'left',
            },
          },
        },
      },
      rightColumn: {
        type: 'block',
        bounds: {
          left: 520,
          top: 130,
          width: 440,
          height: 390,
        },
        layout: {
          distribution: 'equal',
          gap: 15,
          verticalAlignment: 'top',
          orientation: 'vertical',
        },
        childTemplate: {
          count: 'auto',
          structure: {
            type: 'text',
            label: 'item',
            text: {
              color: '{{theme.fontColor}}',
              fontFamily: '{{theme.fontName}}',
              textAlign: 'left',
            },
          },
        },
      },
    },
  },

  two_column_with_image: {
    name: 'New Two Column with Image Template',
    layout: 'two_column_with_image',
    containers: {
      title: {
        type: 'text',
        bounds: {
          left: 30,
          top: 15,
          width: 940,
          height: 85,
        },
        layout: {
          horizontalAlignment: 'center',
          verticalAlignment: 'top',
        },
        text: {
          color: '{{theme.titleFontColor}}',
          fontFamily: '{{theme.titleFontName}}',
          fontWeight: 'bold',
          textAlign: 'center',
        },
      },
      content: {
        type: 'block',
        bounds: {
          left: 40,
          top: 120,
          width: 480,
          height: 400,
        },
        layout: {
          distribution: 'equal',
          gap: 15,
          verticalAlignment: 'top',
          orientation: 'vertical',
        },
        childTemplate: {
          count: 'auto',
          structure: {
            type: 'text',
            label: 'item',
            text: {
              color: '{{theme.fontColor}}',
              fontFamily: '{{theme.fontName}}',
              textAlign: 'left',
            },
          },
        },
      },
      image: {
        type: 'image',
        bounds: {
          left: 560,
          top: 120,
          width: 400,
          height: 400,
        },
      },
    },
  },

  main_image: {
    name: 'New Main Image Template',
    layout: 'main_image',
    containers: {
      image: {
        type: 'image',
        bounds: {
          left: 50,
          top: 50,
          width: 900,
          height: 400,
        },
      },
      content: {
        type: 'text',
        positioning: {
          relativeTo: 'image',
          axis: 'vertical',
          anchor: 'end',
          offset: 15,
          size: 'fill',
          margin: { left: 50, right: 50, top: 0, bottom: 30 },
        },
        layout: {
          horizontalAlignment: 'center',
          verticalAlignment: 'top',
        },
        text: {
          color: '{{theme.fontColor}}',
          fontFamily: '{{theme.fontName}}',
          textAlign: 'center',
        },
      },
    },
  },

  table_of_contents: {
    name: 'New Table of Contents Template',
    layout: 'table_of_contents',
    containers: {
      title: {
        type: 'text',
        bounds: {
          left: 30,
          top: 15,
          width: 940,
          height: 80,
        },
        layout: {
          horizontalAlignment: 'center',
          verticalAlignment: 'top',
        },
        text: {
          color: '{{theme.titleFontColor}}',
          fontFamily: '{{theme.titleFontName}}',
          fontWeight: 'bold',
          textAlign: 'center',
        },
      },
      content: {
        type: 'block',
        positioning: {
          relativeTo: 'title',
          axis: 'vertical',
          anchor: 'end',
          offset: 30,
          size: 'fill',
          margin: { left: 60, right: 60, top: 0, bottom: 40 },
        },
        layout: {
          distribution: 'equal',
          gap: 15,
          verticalAlignment: 'top',
          orientation: 'vertical',
        },
        childTemplate: {
          count: 'auto',
          structure: {
            type: 'block',
            layout: {
              distribution: '10/90',
              gap: 20,
              horizontalAlignment: 'left',
              orientation: 'horizontal',
            },
            children: [
              {
                type: 'text',
                label: 'label',
                numbering: true,
                text: {
                  color: '{{theme.themeColors[0]}}',
                  fontFamily: '{{theme.fontName}}',
                  fontWeight: 'bold',
                  textAlign: 'left',
                },
              },
              {
                type: 'text',
                label: 'content',
                text: {
                  color: '{{theme.fontColor}}',
                  fontFamily: '{{theme.fontName}}',
                  textAlign: 'left',
                },
              },
            ],
          },
        },
      },
    },
  },

  timeline: {
    name: 'New Timeline Template',
    layout: 'timeline',
    containers: {
      title: {
        type: 'text',
        bounds: {
          left: 30,
          top: 15,
          width: 940,
          height: 80,
        },
        layout: {
          horizontalAlignment: 'center',
          verticalAlignment: 'top',
        },
        text: {
          color: '{{theme.titleFontColor}}',
          fontFamily: '{{theme.titleFontName}}',
          fontWeight: 'bold',
          textAlign: 'center',
        },
      },
      content: {
        type: 'block',
        positioning: {
          relativeTo: 'title',
          axis: 'vertical',
          anchor: 'end',
          offset: 30,
          size: 'fill',
          margin: { left: 40, right: 40, top: 0, bottom: 40 },
        },
        layout: {
          distribution: 'equal',
          gap: 15,
          horizontalAlignment: 'left',
          orientation: 'horizontal',
        },
        childTemplate: {
          count: 'auto',
          structure: {
            type: 'block',
            layout: {
              distribution: '30/70',
              gap: 10,
              verticalAlignment: 'top',
              orientation: 'vertical',
            },
            children: [
              {
                type: 'text',
                label: 'label',
                text: {
                  color: '{{theme.themeColors[0]}}',
                  fontFamily: '{{theme.labelFontName}}',
                  fontWeight: 'bold',
                  textAlign: 'center',
                },
              },
              {
                type: 'text',
                label: 'content',
                text: {
                  color: '{{theme.fontColor}}',
                  fontFamily: '{{theme.fontName}}',
                  textAlign: 'center',
                },
              },
            ],
          },
        },
      },
    },
    graphics: [
      {
        type: 'titleLine',
        color: '{{theme.themeColors[0]}}',
        thickness: 3,
      },
    ],
  },

  pyramid: {
    name: 'New Pyramid Template',
    layout: 'pyramid',
    containers: {
      title: {
        type: 'text',
        bounds: {
          left: 30,
          top: 15,
          width: 940,
          height: 80,
        },
        layout: {
          horizontalAlignment: 'center',
          verticalAlignment: 'top',
        },
        text: {
          color: '{{theme.titleFontColor}}',
          fontFamily: '{{theme.titleFontName}}',
          fontWeight: 'bold',
          textAlign: 'center',
        },
      },
      content: {
        type: 'block',
        positioning: {
          relativeTo: 'title',
          axis: 'vertical',
          anchor: 'end',
          offset: 30,
          size: 'fill',
          margin: { left: 50, right: 50, top: 0, bottom: 30 },
        },
        layout: {
          distribution: 'equal',
          gap: 15,
          verticalAlignment: 'top',
          orientation: 'vertical',
        },
        childTemplate: {
          count: 'auto',
          structure: {
            type: 'text',
            label: 'item',
            layout: {
              horizontalAlignment: 'center',
              verticalAlignment: 'center',
            },
            border: {
              width: '{{theme.card.borderWidth}}',
              color: '{{theme.themeColors[0]}}',
              radius: '{{theme.card.borderRadius}}',
            },
            text: {
              color: '{{theme.fontColor}}',
              fontFamily: '{{theme.fontName}}',
              textAlign: 'center',
            },
          },
        },
      },
    },
  },
};

/**
 * Get the default template for a specific layout type
 * @param layoutType The layout type (e.g., 'list', 'title', etc.)
 * @returns The default template structure for that layout
 */
export function getDefaultTemplateForLayout(
  layoutType: string
): Omit<SlideTemplate, 'id' | 'createdAt' | 'updatedAt'> {
  if (layoutType in DEFAULT_TEMPLATES) {
    return DEFAULT_TEMPLATES[layoutType as LayoutType];
  }

  // Fallback for unknown layout types
  return {
    name: `New ${layoutType} Template`,
    layout: layoutType,
    containers: {},
  };
}

/**
 * Get list of available layout types
 */
export function getAvailableLayouts(): readonly string[] {
  return AVAILABLE_LAYOUTS;
}
