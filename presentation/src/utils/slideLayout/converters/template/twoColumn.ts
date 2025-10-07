import type { Template } from '../../types';

export const twoColumnLayoutTemplate: Template = {
  id: 'two-column-default',
  name: 'Two Column - Default',
  config: {
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
          size: 'fill',
          margin: { left: 30, right: 30, top: 0, bottom: 40 },
        },
        layout: {
          distribution: 'space-between',
          gap: 20,
          horizontalAlignment: 'left',
          verticalAlignment: 'top',
          orientation: 'vertical',
        },
        childTemplate: {
          count: 'auto',
          wrap: {
            enabled: true,
            maxItemsPerLine: 5,
            lineCount: 'auto',
            wrapDistribution: 'balanced',
            lineSpacing: 30,
          },
          structure: {
            type: 'block',
            layout: {
              verticalAlignment: 'center',
              horizontalAlignment: 'center',
            },
            children: [
              {
                type: 'text',
                label: 'item',
                border: {
                  color: '{{theme.themeColors[0]}}',
                  width: 1,
                  radius: 8,
                },
                text: {
                  color: '{{theme.fontColor}}',
                  fontFamily: '{{theme.fontName}}',
                  fontWeight: 'normal',
                  textAlign: 'left',
                },
              },
            ],
          },
        },
      },
    },
  },
};

// Variation: Two Column - Cards (alternating)
export const twoColumnSplitTemplate: Template = {
  id: 'two-column-cards',
  name: 'Two Column - Cards',
  config: {
    containers: {
      title: {
        type: 'text',
        bounds: {
          left: 0,
          top: 15,
          width: { expr: 'SLIDE_WIDTH' },
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
          size: 'fill',
          margin: { left: 40, right: 40, top: 0, bottom: 40 },
        },
        layout: {
          distribution: 'space-around',
          gap: 20,
          horizontalAlignment: 'center',
          verticalAlignment: 'top',
          orientation: 'vertical',
        },
        childTemplate: {
          count: 'auto',
          wrap: {
            enabled: true,
            maxItemsPerLine: 5,
            lineCount: 'auto',
            wrapDistribution: 'balanced',
            lineSpacing: 35,
          },
          structure: {
            type: 'block',
            layout: {
              verticalAlignment: 'center',
              horizontalAlignment: 'center',
            },
            border: {
              color: '{{theme.themeColors[0]}}',
              width: 1,
              radius: 10,
            },
            children: [
              {
                type: 'text',
                label: 'item',

                shadow: {
                  h: 0,
                  v: 3,
                  blur: 8,
                  color: 'rgba(0,0,0,0.1)',
                },
                text: {
                  color: '{{theme.fontColor}}',
                  fontFamily: '{{theme.fontName}}',
                  fontWeight: 'normal',
                  textAlign: 'center',
                },
              },
            ],
          },
        },
      },
    },
  },
};

// Variation: Two Column - Compact (tight spacing)
export const twoColumnAsymmetricTemplate: Template = {
  id: 'two-column-compact',
  name: 'Two Column - Compact',
  config: {
    containers: {
      title: {
        type: 'text',
        bounds: {
          left: 15,
          top: 15,
          width: { expr: 'SLIDE_WIDTH - 30' },
          height: 90,
        },
        layout: {
          horizontalAlignment: 'center',
          verticalAlignment: 'top',
        },
        text: {
          color: '{{theme.titleFontColor}}',
          fontFamily: '{{theme.titleFontName}}',
          fontWeight: 'bold',
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
          size: 'fill',
          margin: { left: 60, right: 60, top: 0, bottom: 40 },
        },
        layout: {
          distribution: 'equal',
          gap: 12,
          horizontalAlignment: 'left',
          verticalAlignment: 'top',
          orientation: 'vertical',
        },
        childTemplate: {
          count: 'auto',
          wrap: {
            enabled: true,
            maxItemsPerLine: 5,
            lineCount: 'auto',
            wrapDistribution: 'balanced',
            lineSpacing: 25,
          },
          structure: {
            type: 'block',
            layout: {
              verticalAlignment: 'center',
              horizontalAlignment: 'center',
            },
            children: [
              {
                type: 'text',
                label: 'item',
                text: {
                  color: '{{theme.fontColor}}',
                  fontFamily: '{{theme.fontName}}',
                  fontWeight: 'normal',
                  textAlign: 'left',
                },
              },
            ],
          },
        },
      },
    },
  },
};
