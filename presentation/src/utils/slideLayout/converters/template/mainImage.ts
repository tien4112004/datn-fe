import type { Template } from '../../types';

export const mainImageTemplates: Template[] = [
  {
    id: 'main-image-default',
    name: 'Main Image - Default',
    config: {
      containers: {
        image: {
          type: 'image',
          bounds: {
            width: {
              expr: 'SLIDE_WIDTH * 0.6',
              max: 'SLIDE_HEIGHT * 0.5 * (3/2)',
            },
            height: {
              expr: 'SLIDE_WIDTH * 0.6 * (2/3)',
              max: 'SLIDE_HEIGHT * 0.5',
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
            height: {
              expr: 'SLIDE_HEIGHT - image.top - image.height - 40 - 40',
            },
            left: {
              expr: 'center',
            },
            top: {
              expr: 'after',
              relativeTo: 'image',
              offset: 40,
            },
          },
          layout: {
            distribution: 'equal',
            gap: 10,
            horizontalAlignment: 'center',
            verticalAlignment: 'center',
            orientation: 'vertical',
          },
          childTemplate: {
            count: 'auto',
            structure: {
              type: 'text',
              label: 'content',
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
      },
    },
  },
  {
    id: 'main-image-centered',
    name: 'Main Image - Centered with Caption',
    config: {
      containers: {
        image: {
          type: 'image',
          bounds: {
            width: {
              expr: 'SLIDE_WIDTH * 0.75',
              max: 'SLIDE_HEIGHT * 0.65 * (16/9)',
            },
            height: {
              expr: 'SLIDE_WIDTH * 0.75 * (9/16)',
              max: 'SLIDE_HEIGHT * 0.65',
            },
            left: {
              expr: 'center',
            },
            top: {
              expr: 'SLIDE_HEIGHT * 0.15',
            },
          },
        },
        content: {
          type: 'text',
          label: 'content',
          bounds: {
            width: {
              expr: 'SLIDE_WIDTH * 0.7',
            },
            height: 80,
            left: {
              expr: 'center',
            },
            top: {
              expr: 'image.top + image.height + 25',
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
  },
  {
    id: 'main-image-left',
    name: 'Main Image - Left',
    config: {
      containers: {
        image: {
          type: 'image',
          bounds: {
            width: {
              expr: 'SLIDE_WIDTH * 0.5',
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
              expr: 'SLIDE_WIDTH * 0.5 - 60',
            },
            height: 200,
            left: {
              expr: 'SLIDE_WIDTH * 0.5 + 30',
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
  },
  {
    id: 'main-image-title-overlay',
    name: 'Main Image - Title Overlay',
    config: {
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
          background: {
            color: 'rgba(0, 0, 0, 0.6)',
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
  },
  {
    id: 'main-image-top',
    name: 'Main Image - Top',
    config: {
      containers: {
        image: {
          type: 'image',
          bounds: {
            width: {
              expr: 'SLIDE_WIDTH',
              max: 'SLIDE_HEIGHT * (16/9)',
            },
            height: {
              expr: 'SLIDE_HEIGHT * 0.6',
              max: 'SLIDE_HEIGHT',
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
  },
  {
    id: 'main-image-right',
    name: 'Main Image - Right',
    config: {
      containers: {
        content: {
          type: 'text',
          label: 'content',
          bounds: {
            width: {
              expr: 'SLIDE_WIDTH * 0.5 - 60',
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
              expr: 'SLIDE_WIDTH * 0.5',
            },
            height: {
              expr: 'SLIDE_HEIGHT',
            },
            left: {
              expr: 'SLIDE_WIDTH * 0.5',
            },
            top: 0,
          },
        },
      },
    },
  },
  {
    id: 'main-image-bottom',
    name: 'Main Image - Bottom',
    config: {
      containers: {
        content: {
          type: 'text',
          label: 'content',
          bounds: {
            width: {
              expr: 'SLIDE_WIDTH * 0.9',
            },
            height: {
              expr: 'SLIDE_HEIGHT * 0.35',
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
              expr: 'SLIDE_HEIGHT * 0.6',
            },
            left: 0,
            top: {
              expr: 'SLIDE_HEIGHT * 0.4',
            },
          },
        },
      },
    },
  },
  {
    id: 'main-image-framed',
    name: 'Main Image - Framed',
    config: {
      containers: {
        image: {
          type: 'image',
          bounds: {
            width: {
              expr: 'SLIDE_WIDTH * 0.65',
              max: 'SLIDE_HEIGHT * 0.55 * (3/2)',
            },
            height: {
              expr: 'SLIDE_WIDTH * 0.65 * (2/3)',
              max: 'SLIDE_HEIGHT * 0.55',
            },
            left: {
              expr: 'center',
            },
            top: {
              expr: 'center',
              offset: -30,
            },
          },
          border: {
            width: '{{theme.card.borderWidth}}',
            color: '{{theme.themeColors[0]}}',
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
            height: 90,
            left: {
              expr: 'center',
            },
            top: {
              expr: 'image.top + image.height + 35',
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
  },
];
