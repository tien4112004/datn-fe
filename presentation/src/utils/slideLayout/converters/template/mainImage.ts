import type { PartialTemplateConfig } from '../../types';

export const mainImageLayoutTemplate: PartialTemplateConfig = {
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
};
