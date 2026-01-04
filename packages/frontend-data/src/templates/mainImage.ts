import type { SlideTemplate } from '@aiprimary/core';

export const mainImageTemplates: SlideTemplate[] = [
  {
    layout: 'main_image',
    id: 'main-image-default',
    name: 'Main Image - Default',
    parameters: [
      {
        key: 'IMAGE_RATIO',
        label: 'Image Ratio',
        defaultValue: 0.5,
        min: 0.2,
        max: 0.7,
        step: 0.05,
        description: 'Proportion of slide width occupied by the main image',
      },
      {
        key: 'SPACING',
        label: 'Spacing (px)',
        defaultValue: 20,
        min: 0,
        max: 100,
        step: 5,
        description: 'Spacing from image to content block',
      },
    ],
    containers: {
      image: {
        type: 'image',
        bounds: {
          width: {
            expr: 'SLIDE_WIDTH * IMAGE_RATIO',
          },
          height: {
            expr: 'SLIDE_WIDTH * IMAGE_RATIO * (2/3)',
          },
          left: {
            expr: 'center',
            offset: 0,
          },
          top: {
            expr: 'center',
            offset: -20,
          },
        },
      },
      content: {
        type: 'block',
        bounds: {
          width: {
            expr: 'SLIDE_WIDTH * 0.8',
          },
          height: 240,
          left: {
            expr: 'center',
          },
          top: {
            expr: 'image.top + image.height + SPACING',
          },
        },
        childTemplate: {
          count: 'auto',
          structure: {
            type: 'text',
            label: 'content',
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
              fontSizeRange: { minSize: 20, maxSize: 28 },
            },
          },
        },
      },
    },
  },
  {
    layout: 'main_image',
    id: 'main-image-left',
    name: 'Main Image - Left',
    parameters: [
      {
        key: 'IMAGE_RATIO',
        label: 'Image Ratio',
        defaultValue: 0.5,
        min: 0.2,
        max: 0.7,
        step: 0.05,
        description: 'Proportion of slide width occupied by the main image',
      },
    ],
    containers: {
      image: {
        type: 'image',
        bounds: {
          width: {
            expr: 'SLIDE_WIDTH * IMAGE_RATIO',
          },
          height: {
            expr: 'SLIDE_HEIGHT',
          },
          left: 0,
          top: 0,
        },
      },
      content: {
        type: 'text',
        label: 'content',
        bounds: {
          width: {
            expr: 'SLIDE_WIDTH - image.width - 60',
          },
          height: 200,
          left: {
            expr: 'image.width + 30',
          },
          top: {
            expr: 'SLIDE_HEIGHT * 0.5 - 100',
          },
        },
        layout: {
          horizontalAlignment: 'center',
          verticalAlignment: 'center',
        },
        text: {
          color: '{{theme.titleFontColor}}',
          fontFamily: '{{theme.titleFontName}}',
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'center',
        },
      },
    },
  },
  {
    layout: 'main_image',
    id: 'main-image-title-overlay',
    name: 'Main Image - Title Overlay',
    containers: {
      image: {
        type: 'image',
        bounds: {
          width: {
            expr: 'SLIDE_WIDTH',
          },
          height: {
            expr: 'SLIDE_HEIGHT',
          },
          left: 0,
          top: 0,
        },
      },
      content: {
        type: 'text',
        label: 'content',
        bounds: {
          width: {
            expr: 'SLIDE_WIDTH * 0.9',
          },
          height: 160,
          left: {
            expr: 'center',
          },
          top: {
            expr: 'SLIDE_HEIGHT * 0.8 - 80',
          },
        },
        layout: {
          horizontalAlignment: 'center',
          verticalAlignment: 'center',
        },
        border: {
          width: 0,
          radius: '{{theme.card.borderRadius}}',
          color: 'transparent',
        },
        text: {
          color: '{{theme.titleFontColor}}',
          fontFamily: '{{theme.titleFontName}}',
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'center',
          fontSizeRange: { minSize: 24, maxSize: 32 },
        },
        zIndex: 1,
      },
    },
  },
  {
    layout: 'main_image',
    id: 'main-image-top',
    name: 'Main Image - Top',
    parameters: [
      {
        key: 'IMAGE_RATIO',
        label: 'Image Ratio',
        defaultValue: 0.5,
        min: 0.2,
        max: 0.7,
        step: 0.05,
        description: 'Proportion of slide width occupied by the main image',
      },
    ],
    containers: {
      image: {
        type: 'image',
        bounds: {
          width: {
            expr: 'SLIDE_WIDTH',
          },
          height: {
            expr: 'SLIDE_HEIGHT * IMAGE_RATIO',
          },
          left: 0,
          top: 0,
        },
      },
      content: {
        type: 'text',
        label: 'content',
        bounds: {
          width: {
            expr: 'SLIDE_WIDTH * 0.9',
          },
          height: {
            expr: 'SLIDE_HEIGHT - image.height',
          },
          left: {
            expr: 'center',
          },
          top: {
            expr: 'image.top + image.height + 20',
          },
        },
        text: {
          color: '{{theme.titleFontColor}}',
          fontFamily: '{{theme.titleFontName}}',
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'center',
        },
      },
    },
  },
  {
    layout: 'main_image',
    id: 'main-image-right',
    name: 'Main Image - Right',
    parameters: [
      {
        key: 'IMAGE_RATIO',
        label: 'Image Ratio',
        defaultValue: 0.5,
        min: 0.2,
        max: 0.7,
        step: 0.05,
        description: 'Proportion of slide width occupied by the main image',
      },
    ],
    containers: {
      content: {
        type: 'text',
        label: 'content',
        bounds: {
          width: {
            expr: 'SLIDE_WIDTH * (1 - IMAGE_RATIO) - 60',
          },
          height: 300,
          left: 30,
          top: {
            expr: 'SLIDE_HEIGHT * 0.5 - 100',
          },
        },
        layout: {
          horizontalAlignment: 'center',
          verticalAlignment: 'center',
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
            expr: 'SLIDE_WIDTH * IMAGE_RATIO',
          },
          height: {
            expr: 'SLIDE_HEIGHT',
          },
          left: {
            expr: 'content.width + 60',
          },
          top: 0,
        },
      },
    },
  },
  {
    layout: 'main_image',
    id: 'main-image-bottom',
    name: 'Main Image - Bottom',
    parameters: [
      {
        key: 'IMAGE_RATIO',
        label: 'Image Ratio',
        defaultValue: 0.5,
        min: 0.2,
        max: 0.7,
        step: 0.05,
        description: 'Proportion of slide width occupied by the main image',
      },
    ],
    containers: {
      content: {
        type: 'text',
        label: 'content',
        bounds: {
          width: {
            expr: 'SLIDE_WIDTH * 0.9',
          },
          height: {
            expr: 'SLIDE_HEIGHT * (1 - IMAGE_RATIO) - 50',
          },
          left: {
            expr: 'center',
          },
          top: 30,
        },
        layout: {
          horizontalAlignment: 'center',
          verticalAlignment: 'center',
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
            expr: 'SLIDE_WIDTH',
          },
          height: {
            expr: 'SLIDE_HEIGHT * IMAGE_RATIO',
          },
          left: 0,
          top: {
            expr: 'content.top + content.height + 20',
          },
        },
      },
    },
  },
  {
    layout: 'main_image',
    id: 'main-image-framed',
    name: 'Main Image - Framed',
    parameters: [
      {
        key: 'IMAGE_RATIO',
        label: 'Image Ratio',
        defaultValue: 0.65,
        min: 0.2,
        max: 0.7,
        step: 0.05,
        description: 'Proportion of slide width occupied by the main image',
      },
      {
        key: 'SPACING',
        label: 'Spacing (px)',
        defaultValue: 20,
        min: 0,
        max: 100,
        step: 5,
        description: 'Spacing from image to content block',
      },
    ],
    containers: {
      image: {
        type: 'image',
        bounds: {
          width: {
            expr: 'SLIDE_WIDTH * IMAGE_RATIO',
          },
          height: {
            expr: 'SLIDE_WIDTH * IMAGE_RATIO * (2/3)',
          },
          left: {
            expr: 'center',
          },
          top: {
            expr: 'center',
            offset: -20,
          },
        },
        border: {
          width: '{{theme.card.borderWidth}}',
          color: '{{theme.outline.color}}',
          radius: '{{theme.card.borderRadius}}',
        },
        shadow: {
          h: '{{theme.card.shadow.h}}',
          v: '{{theme.card.shadow.v}}',
          blur: '{{theme.card.shadow.blur}}',
          color: '{{theme.card.shadow.color}}',
        },
      },
      content: {
        type: 'text',
        label: 'content',
        bounds: {
          width: {
            expr: 'SLIDE_WIDTH * 0.75',
          },
          height: 240,
          left: {
            expr: 'center',
          },
          top: {
            expr: 'image.top + image.height + SPACING',
          },
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
    },
  },
];
