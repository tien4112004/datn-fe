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

// Variation: Left-aligned title
export const titleLeftAlignTemplate: Template = {
  id: 'title-left-align',
  name: 'Title - Left Aligned',
  config: {
    containers: {
      title: {
        type: 'text',
        bounds: {
          left: 40,
          top: {
            expr: 'SLIDE_HEIGHT * 0.28',
          },
          width: {
            expr: 'SLIDE_WIDTH - 80',
          },
          height: 140,
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
          offset: 0,
          size: 100,
          margin: { left: 0, right: 0, top: 0, bottom: 0 },
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

// Variation: Right-aligned title
export const titleRightAlignTemplate: Template = {
  id: 'title-right-align',
  name: 'Title - Right Aligned',
  config: {
    containers: {
      title: {
        type: 'text',
        bounds: {
          left: 80,
          top: {
            expr: 'SLIDE_HEIGHT * 0.28',
          },
          width: {
            expr: 'SLIDE_WIDTH - 125',
          },
          height: 140,
        },
        layout: {
          horizontalAlignment: 'right',
          verticalAlignment: 'center',
        },
        text: {
          color: '{{theme.titleFontColor}}',
          fontFamily: '{{theme.titleFontName}}',
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'right',
        },
      },
      content: {
        type: 'block',
        positioning: {
          relativeTo: 'title',
          axis: 'vertical',
          anchor: 'end',
          offset: 0,
          size: 100,
          margin: { left: 0, right: 0, top: 0, bottom: 0 },
        },
        layout: {
          horizontalAlignment: 'right',
          verticalAlignment: 'top',
        },
        childTemplate: {
          count: 'auto',
          structure: {
            type: 'text',
            label: 'subtitle',
            layout: {
              horizontalAlignment: 'right',
              verticalAlignment: 'top',
            },
            text: {
              color: '{{theme.fontColor}}',
              fontFamily: '{{theme.fontName}}',
              fontWeight: 'normal',
              fontStyle: 'normal',
              textAlign: 'right',
            },
          },
        },
      },
    },
  },
};
