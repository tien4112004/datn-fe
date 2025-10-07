import type { PartialTemplateConfig } from '../../types';

export const verticalListLayoutTemplate: PartialTemplateConfig = {
  containers: {
    title: {
      type: 'text' as const,
      bounds: {
        left: 0,
        top: 15,
        width: {
          expr: 'SLIDE_WIDTH',
        },
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
        textAlign: 'center',
      },
    },
    content: {
      type: 'block' as const,
      id: 'content',
      positioning: {
        relativeTo: 'title',
        axis: 'vertical',
        anchor: 'end',
        offset: 20,
        size: 'fill',
        margin: { left: 30, right: 30, top: 0, bottom: 40 },
      },
      layout: {
        distribution: 'space-between',
        gap: 20,
        verticalAlignment: 'top',
        orientation: 'vertical',
      },
      childTemplate: {
        count: 'auto',
        wrap: {
          enabled: true,
          maxItemsPerLine: 3,
          lineCount: 3,
          wrapDistribution: 'balanced',
          lineSpacing: 20,
          alternating: false,
        },
        structure: {
          type: 'text' as const,
          label: 'item',
          layout: {
            horizontalAlignment: 'left',
            verticalAlignment: 'center',
          },
          border: {
            width: 1,
            color: '{{theme.themeColors[0]}}',
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
};
