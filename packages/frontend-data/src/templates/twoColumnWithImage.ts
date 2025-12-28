import type { SlideTemplate } from '@aiprimary/core';

export const twoColumnWithImageTemplates: SlideTemplate[] = [
  {
    layout: 'two_column_with_image',
    id: 'two-column-with-image',
    name: 'Two Column with Image',
    parameters: [
      {
        key: 'SIDE_PADDING',
        label: 'Side Padding (px)',
        defaultValue: 40,
        min: 0,
        max: 50,
        step: 1,
        description: 'Left/right slide padding',
      },
      {
        key: 'COLUMN_SPACING',
        label: 'Column Spacing (px)',
        defaultValue: 40,
        min: 0,
        max: 200,
        step: 1,
        description: 'Horizontal spacing between columns',
      },
      {
        key: 'IMAGE_WIDTH',
        label: 'Image Width (px)',
        defaultValue: 400,
        min: 200,
        max: 600,
        step: 50,
        description: 'Width of the image in pixels',
      },
    ],
    config: {
      containers: {
        title: {
          type: 'text',
          bounds: {
            left: {
              expr: 'SIDE_PADDING',
            },
            top: 15,
            width: {
              expr: 'SLIDE_WIDTH - SIDE_PADDING * 2',
            },
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
            fontStyle: 'normal',
            textAlign: 'center',
          },
        },
        image: {
          type: 'image',
          bounds: {
            width: {
              expr: 'IMAGE_WIDTH',
            },
            height: 300,
            left: {
              expr: 'SIDE_PADDING',
            },
            top: { expr: 'after', relativeTo: 'title', offset: 20 },
          },
        },
        content: {
          type: 'block',
          bounds: {
            left: {
              expr: 'SIDE_PADDING + IMAGE_WIDTH + COLUMN_SPACING',
            },
            top: {
              expr: 'image.top',
            },
            width: {
              expr: 'SLIDE_WIDTH - SIDE_PADDING * 2 - IMAGE_WIDTH - COLUMN_SPACING',
            },
            height: {
              expr: 'SLIDE_HEIGHT - image.top - 40',
            },
          },
          layout: {
            distribution: 'space-between',
            gap: 20,
            horizontalAlignment: 'center',
            verticalAlignment: 'top',
            orientation: 'vertical',
          },
          childTemplate: {
            count: 'auto',
            structure: {
              type: 'text',
              label: 'item',
              border: {
                width: '{{theme.card.borderWidth}}',
                color: '{{theme.themeColors[0]}}',
                radius: '{{theme.card.borderRadius}}',
              },
              text: {
                color: '{{theme.fontColor}}',
                fontFamily: '{{theme.fontName}}',
                fontWeight: 'normal',
                fontStyle: 'normal',
              },
            },
          },
        },
      },
    },
  },
  {
    layout: 'two_column_with_image',
    id: 'two-column-left-big-image',
    name: 'Two Column - Left Big Image',
    parameters: [
      {
        key: 'IMAGE_RATIO',
        label: 'Image Width Ratio',
        defaultValue: 0.5,
        min: 0.2,
        max: 0.6,
        step: 0.05,
        description: 'Width of image as ratio of slide width',
      },
      {
        key: 'SIDE_PADDING',
        label: 'Side Padding (px)',
        defaultValue: 20,
        min: 0,
        max: 50,
        step: 1,
        description: 'Left/right slide padding',
      },
    ],
    config: {
      containers: {
        image: {
          type: 'image',
          bounds: {
            left: 0,
            top: 0,
            width: {
              expr: 'SLIDE_WIDTH * IMAGE_RATIO',
            },
            height: {
              expr: 'SLIDE_HEIGHT',
            },
          },
          border: {
            width: 0,
            color: 'transparent',
            radius: 0,
          },
        },
        title: {
          type: 'text',
          bounds: {
            left: {
              expr: 'SLIDE_WIDTH * IMAGE_RATIO + SIDE_PADDING',
            },
            top: 20,
            width: {
              expr: 'SLIDE_WIDTH * (1 - IMAGE_RATIO) - SIDE_PADDING * 2',
            },
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
            fontStyle: 'normal',
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
            gap: 18,
            horizontalAlignment: 'left',
            verticalAlignment: 'top',
            orientation: 'vertical',
          },
          childTemplate: {
            count: 'auto',
            structure: {
              type: 'text',
              label: 'item',
              layout: {
                horizontalAlignment: 'left',
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
                fontWeight: 'normal',
                fontStyle: 'normal',
                textAlign: 'left',
              },
            },
          },
        },
      },
    },
  },
  {
    layout: 'two_column_with_image',
    id: 'two-column-right-big-image',
    name: 'Two Column - Right Big Image',
    parameters: [
      {
        key: 'IMAGE_RATIO',
        label: 'Image Width Ratio',
        defaultValue: 0.4,
        min: 0.2,
        max: 0.6,
        step: 0.05,
        description: 'Width of image as ratio of slide width',
      },
      {
        key: 'SIDE_PADDING',
        label: 'Side Padding (px)',
        defaultValue: 40,
        min: 0,
        max: 50,
        step: 1,
        description: 'Left/right slide padding',
      },
    ],
    config: {
      containers: {
        image: {
          type: 'image',
          bounds: {
            left: {
              expr: 'SLIDE_WIDTH * (1 - IMAGE_RATIO)',
            },
            top: 0,
            width: {
              expr: 'SLIDE_WIDTH * IMAGE_RATIO',
            },
            height: {
              expr: 'SLIDE_HEIGHT',
            },
          },
          border: {
            width: 0,
            color: 'transparent',
            radius: 0,
          },
        },
        title: {
          type: 'text',
          bounds: {
            left: {
              expr: 'SIDE_PADDING',
            },
            top: 20,
            width: {
              expr: 'SLIDE_WIDTH * (1 - IMAGE_RATIO) - SIDE_PADDING * 2',
            },
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
            fontStyle: 'normal',
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
            gap: 18,
            horizontalAlignment: 'left',
            verticalAlignment: 'top',
            orientation: 'vertical',
          },
          childTemplate: {
            count: 'auto',
            structure: {
              type: 'text',
              label: 'item',
              border: {
                width: '{{theme.card.borderWidth}}',
                color: '{{theme.themeColors[0]}}',
                radius: '{{theme.card.borderRadius}}',
              },
              text: {
                color: '{{theme.fontColor}}',
                fontFamily: '{{theme.fontName}}',
                fontWeight: 'normal',
                fontStyle: 'normal',
                textAlign: 'left',
              },
            },
          },
        },
      },
    },
  },
  {
    layout: 'two_column_with_image',
    id: 'two-column-right-image',
    name: 'Two Column - Right Image',
    parameters: [
      {
        key: 'SIDE_PADDING',
        label: 'Side Padding (px)',
        defaultValue: 40,
        min: 0,
        max: 50,
        step: 1,
        description: 'Left/right slide padding',
      },
      {
        key: 'COLUMN_SPACING',
        label: 'Column Spacing (px)',
        defaultValue: 40,
        min: 0,
        max: 200,
        step: 1,
        description: 'Horizontal spacing between columns',
      },
      {
        key: 'IMAGE_RATIO',
        label: 'Image Width Ratio',
        defaultValue: 0.45,
        min: 0.3,
        max: 0.6,
        step: 0.05,
        description: 'Width of image as ratio of available space (content fills remaining)',
      },
    ],
    config: {
      containers: {
        title: {
          type: 'text',
          bounds: {
            left: {
              expr: 'SIDE_PADDING',
            },
            top: 15,
            width: {
              expr: 'SLIDE_WIDTH - SIDE_PADDING * 2',
            },
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
            fontStyle: 'normal',
            textAlign: 'center',
          },
        },
        content: {
          type: 'block',
          bounds: {
            left: { expr: 'SIDE_PADDING' },
            top: { expr: 'title.top + title.height + 20' },
            width: { expr: '(SLIDE_WIDTH - SIDE_PADDING * 2 - COLUMN_SPACING) * (1 - IMAGE_RATIO)' },
            height: { expr: 'SLIDE_HEIGHT - title.top - title.height - 60' },
          },
          layout: {
            distribution: 'space-between',
            gap: 20,
            horizontalAlignment: 'left',
            verticalAlignment: 'top',
            orientation: 'vertical',
          },
          childTemplate: {
            count: 'auto',
            structure: {
              type: 'text',
              label: 'item',
              border: {
                width: '{{theme.card.borderWidth}}',
                color: '{{theme.themeColors[0]}}',
                radius: '{{theme.card.borderRadius}}',
              },
              text: {
                color: '{{theme.fontColor}}',
                fontFamily: '{{theme.fontName}}',
                fontWeight: 'normal',
                fontStyle: 'normal',
                textAlign: 'left',
              },
            },
          },
        },
        image: {
          type: 'image',
          bounds: {
            width: { expr: '(SLIDE_WIDTH - SIDE_PADDING * 2 - COLUMN_SPACING) * IMAGE_RATIO' },
            height: { expr: 'content.height * 0.8' },
            left: { expr: 'content.left + content.width + COLUMN_SPACING' },
            top: { expr: 'content.top + content.height * 0.1' },
          },
          shadow: {
            h: '{{theme.card.shadow.h}}',
            v: '{{theme.card.shadow.v}}',
            blur: '{{theme.card.shadow.blur}}',
            color: '{{theme.card.shadow.color}}',
          },
        },
      },
    },
  },
  {
    layout: 'two_column_with_image',
    id: 'two-column-with-image-container-border',
    name: 'Two Column with Image - Container Border',
    parameters: [
      {
        key: 'SIDE_PADDING',
        label: 'Side Padding (px)',
        defaultValue: 20,
        min: 0,
        max: 50,
        step: 1,
        description: 'Left/right slide padding',
      },
      {
        key: 'IMAGE_WIDTH',
        label: 'Image Width (px)',
        defaultValue: 360,
        min: 200,
        max: 500,
        step: 40,
        description: 'Width of the image in pixels',
      },
    ],
    config: {
      containers: {
        title: {
          type: 'text',
          bounds: {
            left: {
              expr: 'SIDE_PADDING',
            },
            top: 15,
            width: {
              expr: 'SLIDE_WIDTH - SIDE_PADDING * 2',
            },
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
            fontStyle: 'normal',
            textAlign: 'center',
          },
        },
        image: {
          type: 'image',
          bounds: {
            width: {
              expr: 'IMAGE_WIDTH',
            },
            height: 300,
            left: {
              expr: 'SIDE_PADDING + ((SLIDE_WIDTH - SIDE_PADDING * 2) / 2 - IMAGE_WIDTH) / 2',
            },
            top: {
              expr: 'after',
              relativeTo: 'title',
              offset: 20,
            },
          },
          shadow: {
            h: '{{theme.card.shadow.h}}',
            v: '{{theme.card.shadow.v}}',
            blur: '{{theme.card.shadow.blur}}',
            color: '{{theme.card.shadow.color}}',
          },
        },
        content: {
          type: 'block',
          bounds: {
            left: {
              expr: 'SIDE_PADDING + (SLIDE_WIDTH - SIDE_PADDING * 2) / 2',
            },
            top: {
              expr: 'image.top',
            },
            width: {
              expr: '(SLIDE_WIDTH - SIDE_PADDING * 2) / 2 - 30',
            },
            height: {
              expr: 'SLIDE_HEIGHT - image.top - 50',
            },
          },
          layout: {
            distribution: 'space-between',
            gap: 15,
            horizontalAlignment: 'center',
            verticalAlignment: 'top',
            orientation: 'vertical',
          },
          childTemplate: {
            count: 'auto',
            structure: {
              type: 'text',
              label: 'item',
              border: {
                width: '{{theme.card.borderWidth}}',
                color: '{{theme.themeColors[0]}}',
                radius: '{{theme.card.borderRadius}}',
              },
              text: {
                color: '{{theme.fontColor}}',
                fontFamily: '{{theme.fontName}}',
                fontWeight: 'normal',
                fontStyle: 'normal',
                textAlign: 'left',
              },
            },
          },
        },
      },
    },
  },
  {
    layout: 'two_column_with_image',
    id: 'two-column-left-big-image-container-border',
    name: 'Two Column - Left Big Image Container Border',
    parameters: [
      {
        key: 'IMAGE_RATIO',
        label: 'Image Width Ratio',
        defaultValue: 0.4,
        min: 0.2,
        max: 0.6,
        step: 0.05,
        description: 'Width of image as ratio of slide width',
      },
      {
        key: 'SIDE_PADDING',
        label: 'Side Padding (px)',
        defaultValue: 30,
        min: 0,
        max: 50,
        step: 1,
        description: 'Left/right content padding',
      },
    ],
    config: {
      containers: {
        image: {
          type: 'image',
          bounds: {
            left: 0,
            top: 0,
            width: {
              expr: 'SLIDE_WIDTH * IMAGE_RATIO',
            },
            height: {
              expr: 'SLIDE_HEIGHT',
            },
          },
          border: {
            width: 0,
            color: 'transparent',
            radius: 0,
          },
        },
        title: {
          type: 'text',
          bounds: {
            left: {
              expr: 'SLIDE_WIDTH * IMAGE_RATIO + SIDE_PADDING',
            },
            top: 20,
            width: {
              expr: 'SLIDE_WIDTH * (1 - IMAGE_RATIO) - SIDE_PADDING * 2',
            },
            height: 90,
          },
          layout: {
            horizontalAlignment: 'center',
            verticalAlignment: 'top',
          },
          text: {
            color: '{{theme.titleFontColor}}',
            fontFamily: '{{theme.titleFontName}}',
            fontWeight: 'bold',
            fontStyle: 'normal',
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
            gap: 15,
            horizontalAlignment: 'left',
            verticalAlignment: 'top',
            orientation: 'vertical',
          },
          childTemplate: {
            count: 'auto',
            structure: {
              type: 'text',
              label: 'item',
              layout: {
                horizontalAlignment: 'left',
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
                fontWeight: 'normal',
                fontStyle: 'normal',
                textAlign: 'left',
              },
            },
          },
        },
      },
    },
  },
  {
    layout: 'two_column_with_image',
    id: 'two-column-with-image-container-bullet',
    name: 'Two Column with Image - Container Bullet',
    parameters: [
      {
        key: 'IMAGE_RATIO',
        label: 'Image Width Ratio',
        defaultValue: 0.6,
        min: 0.2,
        max: 0.6,
        step: 0.05,
        description: 'Width of image as ratio of slide width',
      },
    ],
    config: {
      containers: {
        image: {
          type: 'image',
          bounds: {
            left: 0,
            top: 0,
            width: {
              expr: 'SLIDE_WIDTH * IMAGE_RATIO',
            },
            height: {
              expr: 'SLIDE_HEIGHT',
            },
          },
          border: {
            width: 0,
            color: 'transparent',
            radius: 0,
          },
        },
        title: {
          type: 'text',
          bounds: {
            left: {
              expr: 'SLIDE_WIDTH * IMAGE_RATIO + 30',
            },
            top: 20,
            width: {
              expr: 'SLIDE_WIDTH * (1 - IMAGE_RATIO) - 60',
            },
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
            fontStyle: 'normal',
            textAlign: 'center',
          },
        },
        content: {
          type: 'text',
          combined: {
            enabled: true,
            pattern: '{item}',
            wrapping: false,
          },
          layout: {
            verticalAlignment: 'top',
          },
          positioning: {
            relativeTo: 'title',
            axis: 'vertical',
            anchor: 'end',
            offset: 20,
            size: 'fill',
            margin: { left: 0, right: 0, top: 0, bottom: 40 },
          },
          border: {
            width: '{{theme.card.borderWidth}}',
            color: '{{theme.themeColors[0]}}',
            radius: '{{theme.card.borderRadius}}',
          },
          text: {
            color: '{{theme.fontColor}}',
            fontFamily: '{{theme.fontName}}',
            fontWeight: 'normal',
            textAlign: 'left',
            lineHeight: 1.5,
          },
          children: [
            {
              type: 'text',
              id: 'item',
              label: 'item',
              text: {
                color: '{{theme.fontColor}}',
                fontFamily: '{{theme.fontName}}',
                fontWeight: 'normal',
              },
            },
          ],
        },
      },
    },
  },
];
