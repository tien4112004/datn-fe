import type { Template } from '../../types';

export const mainImageLayoutTemplate: Template = {
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
              color: '{{theme.fontColor}}',
              fontFamily: '{{theme.fontName}}',
              fontWeight: 'normal',
              fontStyle: 'normal',
              textAlign: 'center',
            },
          },
        },
      },
    },
  },
};

// Variation: Full-bleed image (fills entire slide with caption overlay)
export const mainImageFullBleedTemplate: Template = {
  id: 'main-image-full-bleed',
  name: 'Main Image - Full Bleed',
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
        bounds: {
          width: {
            expr: 'SLIDE_WIDTH * 0.8',
          },
          height: 100,
          left: {
            expr: 'center',
          },
          top: {
            expr: 'SLIDE_HEIGHT - 150',
          },
        },
        layout: {
          horizontalAlignment: 'center',
          verticalAlignment: 'center',
        },
        text: {
          color: '#FFFFFF',
          fontFamily: '{{theme.fontName}}',
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'center',
        },
      },
    },
  },
};

// Variation: Split layout (image on left, content on right)
export const mainImageSplitTemplate: Template = {
  id: 'main-image-split',
  name: 'Main Image - Split',
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
        type: 'block',
        bounds: {
          width: {
            expr: 'SLIDE_WIDTH * 0.5 - 60',
          },
          height: {
            expr: 'SLIDE_HEIGHT - 80',
          },
          left: {
            expr: 'SLIDE_WIDTH * 0.5 + 30',
          },
          top: 40,
        },
        layout: {
          distribution: 'space-around',
          gap: 20,
          horizontalAlignment: 'left',
          verticalAlignment: 'center',
          orientation: 'vertical',
        },
        childTemplate: {
          count: 'auto',
          structure: {
            type: 'text',
            label: 'content',
            layout: {
              horizontalAlignment: 'left',
              verticalAlignment: 'center',
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
};

// Variation: Large image with title overlay
export const mainImageWithTitleOverlayTemplate: Template = {
  id: 'main-image-title-overlay',
  name: 'Main Image - Title Overlay',
  config: {
    containers: {
      image: {
        type: 'image',
        bounds: {
          width: {
            expr: 'SLIDE_WIDTH * 0.85',
          },
          height: {
            expr: 'SLIDE_HEIGHT * 0.7',
          },
          left: {
            expr: 'center',
          },
          top: {
            expr: 'center',
            offset: -10,
          },
        },
        border: {
          width: 2,
          color: '{{theme.themeColors[0]}}',
          radius: 8,
        },
        shadow: {
          h: 0,
          v: 8,
          blur: 16,
          color: 'rgba(0,0,0,0.15)',
        },
      },
      content: {
        type: 'text',
        bounds: {
          width: {
            expr: 'SLIDE_WIDTH * 0.7',
          },
          height: 80,
          left: {
            expr: 'center',
          },
          top: {
            expr: 'image.top + 30',
          },
        },
        layout: {
          horizontalAlignment: 'center',
          verticalAlignment: 'center',
        },
        text: {
          color: '#FFFFFF',
          fontFamily: '{{theme.fontName}}',
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'center',
        },
      },
    },
  },
};
