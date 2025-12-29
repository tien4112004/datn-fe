import type { SlideTemplate } from '@aiprimary/core';

const trapezoidPyramidTemplate: SlideTemplate = {
  layout: 'pyramid',
  id: 'pyramid-triangle',
  name: 'Pyramid - Triangle',
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
  ],
  config: {
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
          fontStyle: 'normal',
        },
      },
      content: {
        type: 'block',
        positioning: {
          relativeTo: 'title',
          axis: 'vertical',
          anchor: 'end',
          offset: 10,
          size: 'fill',
          margin: { left: 30, right: 30, bottom: 30 },
        },
        layout: {
          orientation: 'horizontal',
          distribution: 'equal',
          gap: 10,
          verticalAlignment: 'center',
        },
        childTemplate: {
          count: 'auto',
          wrap: {
            enabled: true,
            pyramid: {
              enabled: true,
              widthRatio: 0.4,
            },
          },
          structure: {
            type: 'block',
            layout: {
              verticalAlignment: 'center',
            },
            children: [
              {
                type: 'text',
                label: 'item',
                text: {
                  fontSizeRange: { minSize: 14, maxSize: 24 },
                  fontWeight: 'bold',
                  color: '#fff',
                  fontFamily: '{{theme.fontName}}',
                  textAlign: 'center',
                },
              },
            ],
          },
        },
      },
    },
  },
  graphics: [
    {
      type: 'trapezoidPyramid',
      containerId: 'content',
    },
  ],
};

const invertedTrapezoidPyramidTemplate: SlideTemplate = {
  layout: 'pyramid',
  id: 'pyramid-inverted-triangle',
  name: 'Pyramid - Inverted Triangle',
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
  ],
  config: {
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
          fontStyle: 'normal',
        },
      },
      content: {
        type: 'block',
        positioning: {
          relativeTo: 'title',
          axis: 'vertical',
          anchor: 'end',
          offset: 10,
          size: 'fill',
          margin: { left: 30, right: 30, bottom: 30 },
        },
        layout: {
          orientation: 'horizontal',
          distribution: 'equal',
          gap: 10,
          verticalAlignment: 'center',
        },
        childTemplate: {
          count: 'auto',
          wrap: {
            enabled: true,
            pyramid: {
              enabled: true,
              widthRatio: 0.4,
              inverted: true,
            },
          },
          structure: {
            type: 'block',
            layout: {
              verticalAlignment: 'center',
            },
            children: [
              {
                type: 'text',
                label: 'item',
                text: {
                  fontSizeRange: { minSize: 14, maxSize: 24 },
                  fontWeight: 'bold',
                  color: '#fff',
                  fontFamily: '{{theme.fontName}}',
                  textAlign: 'center',
                },
              },
            ],
          },
        },
      },
    },
  },
  graphics: [
    {
      type: 'trapezoidPyramid',
      containerId: 'content',
      reverse: true,
    },
  ],
};

const trapezoidPyramidFillTemplate: SlideTemplate = {
  layout: 'pyramid',
  id: 'pyramid-fill',
  name: 'Pyramid - Fill',
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
  ],
  config: {
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
          fontStyle: 'normal',
        },
      },
      content: {
        type: 'block',
        positioning: {
          relativeTo: 'title',
          axis: 'vertical',
          anchor: 'end',
          offset: 10,
          size: 'fill',
          margin: { left: 30, right: 30, bottom: 30 },
        },
        layout: {
          orientation: 'horizontal',
          distribution: 'equal',
          gap: 10,
          verticalAlignment: 'center',
        },
        childTemplate: {
          count: 'auto',
          wrap: {
            enabled: true,
            pyramid: {
              enabled: true,
              widthRatio: 0.4,
            },
          },
          structure: {
            type: 'block',
            layout: {
              verticalAlignment: 'center',
            },
            children: [
              {
                type: 'text',
                label: 'item',
                text: {
                  fontSizeRange: { minSize: 14, maxSize: 24 },
                  fontWeight: 'bold',
                  color: '#fff',
                  fontFamily: '{{theme.fontName}}',
                  textAlign: 'center',
                },
              },
            ],
          },
        },
      },
    },
  },
  graphics: [
    {
      type: 'trapezoidPyramid',
      containerId: 'content',
      colors: ['{{theme.themeColors[1]}}'],
    },
  ],
};

const invertedTrapezoidPyramidFillTemplate: SlideTemplate = {
  layout: 'pyramid',
  id: 'pyramid-fill-inverted',
  name: 'Pyramid - Fill Inverted',
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
  ],
  config: {
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
          fontStyle: 'normal',
        },
      },
      content: {
        type: 'block',
        positioning: {
          relativeTo: 'title',
          axis: 'vertical',
          anchor: 'end',
          offset: 10,
          size: 'fill',
          margin: { left: 30, right: 30, bottom: 30 },
        },
        layout: {
          orientation: 'horizontal',
          distribution: 'equal',
          gap: 10,
          verticalAlignment: 'center',
        },
        childTemplate: {
          count: 'auto',
          wrap: {
            enabled: true,
            pyramid: {
              enabled: true,
              widthRatio: 0.4,
              inverted: true,
            },
          },
          structure: {
            type: 'block',
            layout: {
              verticalAlignment: 'center',
            },
            children: [
              {
                type: 'text',
                label: 'item',
                text: {
                  fontSizeRange: { minSize: 14, maxSize: 24 },
                  fontWeight: 'bold',
                  color: '#fff',
                  fontFamily: '{{theme.fontName}}',
                  textAlign: 'center',
                },
              },
            ],
          },
        },
      },
    },
  },
  graphics: [
    {
      type: 'trapezoidPyramid',
      containerId: 'content',
      reverse: true,
      colors: ['{{theme.themeColors[0]}}'],
    },
  ],
};

export const pyramidTemplates: SlideTemplate[] = [
  trapezoidPyramidTemplate,
  invertedTrapezoidPyramidTemplate,
  trapezoidPyramidFillTemplate,
  invertedTrapezoidPyramidFillTemplate,
];
