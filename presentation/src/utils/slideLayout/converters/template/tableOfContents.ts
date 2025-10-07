import type { PartialTemplateConfig } from '../../types';

export const tableOfContentsLayoutTemplate: PartialTemplateConfig = {
  containers: {
    title: {
      type: 'text',
      bounds: {
        left: 15,
        top: 15,
        width: {
          expr: 'SLIDE_WIDTH - 30',
        },
        height: 100,
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
      // Using relative positioning - positioned below title
      positioning: {
        relativeTo: 'title',
        axis: 'vertical',
        anchor: 'end',
        offset: 20,
        size: 'fill',
        margin: { left: 60, right: 60, top: 0, bottom: 40 },
      },
      layout: {
        distribution: 'space-between',
        gap: 25,
        horizontalAlignment: 'left',
        verticalAlignment: 'top',
        orientation: 'vertical',
      },
      childTemplate: {
        count: 'auto',
        wrap: {
          enabled: true,
          maxItemsPerLine: 4,
          lineCount: 2,
          wrapDistribution: 'balanced',
          lineSpacing: 20,
          alternating: false,
        },
        structure: {
          type: 'text',
          label: 'item',
          layout: {
            horizontalAlignment: 'left',
            verticalAlignment: 'top',
          },
          text: {
            color: '{{theme.fontColor}}',
            fontFamily: '{{theme.fontName}}',
            fontWeight: 'normal',
            fontStyle: 'normal',
          },
        },
      },
    },
  },
};
