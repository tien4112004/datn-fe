import type { PartialTemplateConfig } from '../../types';

export const titleLayoutTemplate: PartialTemplateConfig = {
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
          type: 'text' as const,
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
};

export const transitionLayoutTemplate = titleLayoutTemplate;
