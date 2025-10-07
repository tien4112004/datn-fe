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
              color: '{{theme.titleFontColor}}',
              fontFamily: '{{theme.titleFontName}}',
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

// Variation: Centered image with caption below
export const mainImageCenteredTemplate: Template = {
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
          fontWeight: 'normal',
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
          fontWeight: 'normal',
          fontStyle: 'normal',
          textAlign: 'center',
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
          color: '{{theme.titleFontColor}}',
          fontFamily: '{{theme.titleFontName}}',
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'center',
        },
      },
    },
  },
};

export const mainImageTopTemplate: Template = {
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
            expr: 'SLIDE_HEIGHT - image.height - 40',
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
          fontWeight: 'normal',
          fontStyle: 'normal',
          textAlign: 'center',
        },
      },
    },
  },
};
