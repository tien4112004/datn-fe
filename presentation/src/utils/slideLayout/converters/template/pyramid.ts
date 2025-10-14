import type { TrapezoidPyramid } from '../../graphics/types';
import type { Template } from '../../types';

const trapezoidPyramidTemplate: Template = {
  id: 'pyramid-triangle',
  name: 'Pyramid - Triangle',
  config: {
    containers: {
      title: {
        type: 'text',
        bounds: {
          left: 0,
          top: 15,
          width: { expr: 'SLIDE_WIDTH' },
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
                  fontSizeRange: { minSize: 14, maxSize: 18 },
                  fontWeight: 'bold',
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
  },
  graphics: [
    {
      type: 'trapezoidPyramid',
      containerId: 'content',
    } as TrapezoidPyramid,
  ],
};

const invertedTrapezoidPyramidTemplate: Template = {
  id: 'pyramid-inverted-triangle',
  name: 'Pyramid - Inverted Triangle',
  config: {
    containers: {
      title: {
        type: 'text',
        bounds: {
          left: 0,
          top: 15,
          width: { expr: 'SLIDE_WIDTH' },
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
                  fontSizeRange: { minSize: 14, maxSize: 18 },
                  fontWeight: 'bold',
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
  },
  graphics: [
    {
      type: 'trapezoidPyramid',
      containerId: 'content',
      reverse: true,
    } as TrapezoidPyramid,
  ],
};

export const pyramidTemplates: Template[] = [trapezoidPyramidTemplate, invertedTrapezoidPyramidTemplate];
