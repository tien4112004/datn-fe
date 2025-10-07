import type { Template } from '../../types';

export const titleLayoutTemplate: Template = {
  id: 'title-default',
  name: 'Title - Default',
  config: {
    containers: {
      title: {
        type: 'text',
        bounds: {
          left: 0,
          top: {
            expr: 'SLIDE_HEIGHT * 0.28',
          },
          width: {
            expr: 'SLIDE_WIDTH',
          },
          height: 120,
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
      content: {
        type: 'block',
        positioning: {
          relativeTo: 'title',
          axis: 'vertical',
          anchor: 'end',
          offset: 0,
          size: 120,
          margin: { left: 30, right: 30, top: 0, bottom: 40 },
        },
        layout: {
          horizontalAlignment: 'center',
          verticalAlignment: 'top',
        },
        childTemplate: {
          count: 'auto',
          structure: {
            type: 'text',
            label: 'subtitle',
            layout: {
              horizontalAlignment: 'center',
              verticalAlignment: 'top',
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

// Variation: Top-aligned title
export const titleTopTemplate: Template = {
  id: 'title-top',
  name: 'Title - Top',
  config: {
    containers: {
      title: {
        type: 'text',
        bounds: {
          left: 0,
          top: 40,
          width: {
            expr: 'SLIDE_WIDTH',
          },
          height: 140,
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
      content: {
        type: 'block',
        positioning: {
          relativeTo: 'title',
          axis: 'vertical',
          anchor: 'end',
          offset: 10,
          size: 100,
          margin: { left: 60, right: 60, top: 0, bottom: 0 },
        },
        layout: {
          horizontalAlignment: 'center',
          verticalAlignment: 'top',
        },
        childTemplate: {
          count: 'auto',
          structure: {
            type: 'text',
            label: 'subtitle',
            layout: {
              horizontalAlignment: 'center',
              verticalAlignment: 'top',
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

// Variation: Bottom-aligned title
export const titleBottomTemplate: Template = {
  id: 'title-bottom',
  name: 'Title - Bottom',
  config: {
    containers: {
      title: {
        type: 'text',
        bounds: {
          left: 0,
          top: {
            expr: 'SLIDE_HEIGHT * 0.55',
          },
          width: {
            expr: 'SLIDE_WIDTH',
          },
          height: 130,
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
      content: {
        type: 'block',
        positioning: {
          relativeTo: 'title',
          axis: 'vertical',
          anchor: 'end',
          offset: 5,
          size: 100,
          margin: { left: 50, right: 50, top: 0, bottom: 0 },
        },
        layout: {
          horizontalAlignment: 'center',
          verticalAlignment: 'top',
        },
        childTemplate: {
          count: 'auto',
          structure: {
            type: 'text',
            label: 'subtitle',
            layout: {
              horizontalAlignment: 'center',
              verticalAlignment: 'top',
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

// Variation: Left-aligned title
export const titleLeftTemplate: Template = {
  id: 'title-left',
  name: 'Title - Left',
  config: {
    containers: {
      title: {
        type: 'text',
        bounds: {
          left: 60,
          top: {
            expr: 'SLIDE_HEIGHT * 0.3',
          },
          width: {
            expr: 'SLIDE_WIDTH - 120',
          },
          height: 120,
        },
        layout: {
          horizontalAlignment: 'left',
          verticalAlignment: 'center',
        },
        text: {
          color: '{{theme.titleFontColor}}',
          fontFamily: '{{theme.titleFontName}}',
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'left',
        },
      },
      content: {
        type: 'block',
        positioning: {
          relativeTo: 'title',
          axis: 'vertical',
          anchor: 'end',
          offset: 10,
          size: 120,
          margin: { left: 60, right: 60, top: 0, bottom: 0 },
        },
        layout: {
          horizontalAlignment: 'left',
          verticalAlignment: 'top',
        },
        childTemplate: {
          count: 'auto',
          structure: {
            type: 'text',
            label: 'subtitle',
            layout: {
              horizontalAlignment: 'left',
              verticalAlignment: 'top',
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

// Variation: Title with accent box
export const titleAccentTemplate: Template = {
  id: 'title-accent',
  name: 'Title - Accent Box',
  config: {
    containers: {
      title: {
        type: 'text',
        bounds: {
          left: {
            expr: 'center',
          },
          top: {
            expr: 'SLIDE_HEIGHT * 0.32',
          },
          width: {
            expr: 'SLIDE_WIDTH * 0.8',
          },
          height: 110,
        },
        layout: {
          horizontalAlignment: 'center',
          verticalAlignment: 'center',
        },
        background: {
          color: '{{theme.themeColors[0]}}',
        },
        border: {
          width: 0,
          color: 'transparent',
          radius: 12,
        },
        shadow: {
          h: 0,
          v: 6,
          blur: 12,
          color: 'rgba(0,0,0,0.15)',
        },
        text: {
          color: '#FFFFFF',
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
          size: 100,
          margin: { left: 50, right: 50, top: 0, bottom: 0 },
        },
        layout: {
          horizontalAlignment: 'center',
          verticalAlignment: 'top',
        },
        childTemplate: {
          count: 'auto',
          structure: {
            type: 'text',
            label: 'subtitle',
            layout: {
              horizontalAlignment: 'center',
              verticalAlignment: 'top',
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

export const transitionLayoutTemplate: Template = {
  id: 'transition',
  name: 'Transition',
  config: titleLayoutTemplate.config,
};
