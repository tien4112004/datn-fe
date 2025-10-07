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
        // Using relative positioning - positioned below title
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
          horizontalAlignment: 'center',
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
            lineSpacing: 15,
            alternating: true,
          },
          structure: {
            type: 'text',
            label: 'item',
            layout: {
              distribution: 'equal',
              horizontalAlignment: 'left',
              verticalAlignment: 'top',
            },
            text: {
              color: '{{theme.fontColor}}',
              fontFamily: '{{theme.fontName}}',
              fontWeight: 'normal',
              fontStyle: 'normal',
              lineHeight: 1.7,
            },
            border: {
              color: '{{theme.themeColors[0]}}',
              width: 1,
              radius: 8,
            },
          },
        },
      },
    },
  },
};

// Variation: Two Column - Split 50/50
export const twoColumnSplitTemplate: Template = {
  id: 'two-column-split',
  name: 'Two Column - Split 50/50',
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
          margin: { left: 30, right: 30, top: 0, bottom: 40 },
        },
        layout: {
          distribution: '50/50',
          gap: 30,
          orientation: 'horizontal',
        },
        children: [
          {
            type: 'block',
            layout: {
              distribution: 'equal',
              gap: 20,
              verticalAlignment: 'top',
              orientation: 'vertical',
            },
            childTemplate: {
              count: 'auto',
              structure: {
                type: 'text',
                label: 'item',
                layout: {
                  horizontalAlignment: 'left',
                  verticalAlignment: 'center',
                },
                border: {
                  color: '{{theme.themeColors[0]}}',
                  width: 1,
                  radius: 6,
                },
                text: {
                  color: '{{theme.fontColor}}',
                  fontFamily: '{{theme.fontName}}',
                  fontWeight: 'normal',
                },
              },
            },
          },
          {
            type: 'block',
            layout: {
              distribution: 'equal',
              gap: 20,
              verticalAlignment: 'top',
              orientation: 'vertical',
            },
            childTemplate: {
              count: 'auto',
              structure: {
                type: 'text',
                label: 'item',
                layout: {
                  horizontalAlignment: 'left',
                  verticalAlignment: 'center',
                },
                border: {
                  color: '{{theme.themeColors[1]}}',
                  width: 1,
                  radius: 6,
                },
                text: {
                  color: '{{theme.fontColor}}',
                  fontFamily: '{{theme.fontName}}',
                  fontWeight: 'normal',
                },
              },
            },
          },
        ],
      },
    },
  },
};

// Variation: Two Column - 70/30 split
export const twoColumnAsymmetricTemplate: Template = {
  id: 'two-column-asymmetric',
  name: 'Two Column - Asymmetric 70/30',
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
          horizontalAlignment: 'left',
          verticalAlignment: 'top',
        },
        text: {
          color: '{{theme.titleFontColor}}',
          fontFamily: '{{theme.titleFontName}}',
          fontWeight: 'bold',
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
          distribution: '70/30',
          gap: 25,
          orientation: 'horizontal',
        },
        children: [
          {
            type: 'block',
            layout: {
              distribution: 'equal',
              gap: 18,
              verticalAlignment: 'top',
              orientation: 'vertical',
            },
            childTemplate: {
              count: 'auto',
              structure: {
                type: 'text',
                label: 'item',
                layout: {
                  horizontalAlignment: 'left',
                  verticalAlignment: 'center',
                },
                text: {
                  color: '{{theme.fontColor}}',
                  fontFamily: '{{theme.fontName}}',
                  fontWeight: 'normal',
                },
              },
            },
          },
          {
            type: 'block',
            layout: {
              distribution: 'space-around',
              gap: 18,
              verticalAlignment: 'center',
              orientation: 'vertical',
            },
            childTemplate: {
              count: 'auto',
              structure: {
                type: 'text',
                label: 'item',
                layout: {
                  horizontalAlignment: 'center',
                  verticalAlignment: 'center',
                },
                border: {
                  color: '{{theme.themeColors[0]}}',
                  width: 2,
                  radius: 10,
                },
                text: {
                  color: '{{theme.fontColor}}',
                  fontFamily: '{{theme.fontName}}',
                  fontWeight: 'bold',
                  textAlign: 'center',
                },
              },
            },
          },
        ],
      },
    },
  },
};
