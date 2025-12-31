import type { SlideTemplate } from '@aiprimary/core';

export const twoColumnTemplates: SlideTemplate[] = [
  {
    layout: 'two_column',
    id: 'two-column-compact',
    name: 'Two Column - Compact',
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
              border: {
                width: '{{theme.card.borderWidth}}',
                color: '{{theme.card.borderColor}}',
                radius: '{{theme.card.borderRadius}}',
              },
              children: [
                {
                  type: 'text',
                  label: 'item',
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
  },
  {
    layout: 'two_column',
    id: 'two-column-container-border',
    name: 'Two Column - Container Border',
    parameters: [
      {
        key: 'SIDE_PADDING',
        label: 'Side Padding (px)',
        defaultValue: 50,
        min: 0,
        max: 50,
        step: 1,
        description: 'Left/right content padding',
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
            margin: { left: 50, right: 50, top: 0, bottom: 50 },
          },
          border: {
            width: '{{theme.card.borderWidth}}',
            color: '{{theme.outline.color}}',
            radius: '{{theme.card.borderRadius}}',
          },
          layout: {
            distribution: 'space-between',
            gap: 25,
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
                    textAlign: 'center',
                    fontSizeRange: { minSize: 15, maxSize: 24 },
                  },
                },
              ],
            },
          },
        },
      },
    },
  },
  {
    layout: 'two_column',
    id: 'two-column-bordered-items',
    name: 'Two Column - Each Column Border',
    parameters: [
      {
        key: 'SIDE_PADDING',
        label: 'Side Padding (px)',
        defaultValue: 30,
        min: 0,
        max: 50,
        step: 1,
        description: 'Left/right slide padding',
      },
      {
        key: 'COLUMN_SPACING',
        label: 'Column Spacing (px)',
        defaultValue: 60,
        min: 0,
        max: 200,
        step: 1,
        description: 'Horizontal spacing between columns',
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
        leftColumn: {
          type: 'block',
          bounds: {
            left: { expr: 'SIDE_PADDING' },
            top: {
              expr: 'title.top + title.height + 20',
            },
            width: {
              expr: '(SLIDE_WIDTH - SIDE_PADDING * 2 - COLUMN_SPACING) / 2',
            },
            height: {
              expr: 'SLIDE_HEIGHT - title.top - title.height - 55',
            },
          },
          border: {
            width: '{{theme.card.borderWidth}}',
            color: '{{theme.outline.color}}',
            radius: '{{theme.card.borderRadius}}',
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
            structure: {
              type: 'text',
              label: 'item',
              text: {
                color: '{{theme.fontColor}}',
                fontFamily: '{{theme.fontName}}',
                fontWeight: 'normal',
                textAlign: 'right',
                fontSizeRange: { minSize: 15, maxSize: 24 },
              },
            },
          },
        },
        rightColumn: {
          type: 'block',
          bounds: {
            left: {
              expr: 'leftColumn.left + leftColumn.width + COLUMN_SPACING',
            },
            top: {
              expr: 'leftColumn.top',
            },
            width: {
              expr: 'leftColumn.width',
            },
            height: {
              expr: 'leftColumn.height',
            },
          },
          border: {
            width: '{{theme.card.borderWidth}}',
            color: '{{theme.outline.color}}',
            radius: '{{theme.card.borderRadius}}',
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
            structure: {
              type: 'text',
              label: 'item',
              text: {
                color: '{{theme.fontColor}}',
                fontFamily: '{{theme.fontName}}',
                fontWeight: 'normal',
                textAlign: 'left',
                fontSizeRange: { minSize: 15, maxSize: 24 },
              },
            },
          },
        },
      },
    },
    graphics: [
      {
        type: 'contentSeparator',
        orientation: 'vertical',
        containers: ['leftColumn', 'rightColumn'],
        color: '{{theme.themeColors[0]}}',
      },
    ],
  },
  {
    layout: 'two_column',
    id: 'two-column-container-bullet',
    name: 'Two Column - Container Bullet',
    parameters: [
      {
        key: 'SIDE_PADDING',
        label: 'Side Padding (px)',
        defaultValue: 40,
        min: 0,
        max: 50,
        step: 1,
        description: 'Left/right content padding',
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
            height: 110,
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
          type: 'text',
          combined: {
            enabled: true,
            pattern: '{item}',
            wrapping: true,
            twoColumn: true,
          },
          layout: {
            verticalAlignment: 'center',
          },
          positioning: {
            relativeTo: 'title',
            axis: 'vertical',
            anchor: 'end',
            offset: 20,
            size: 'fill',
            margin: { left: 40, right: 40, top: 0, bottom: 40 },
          },
          border: {
            width: '{{theme.card.borderWidth}}',
            color: '{{theme.outline.color}}',
            radius: '{{theme.card.borderRadius}}',
          },
          text: {
            color: '{{theme.fontColor}}',
            fontFamily: '{{theme.fontName}}',
            fontWeight: 'normal',
            textAlign: 'left',
            lineHeight: 1.5,
          },
          children: [
            {
              type: 'text',
              id: 'item',
              label: 'item',
              text: {
                color: '{{theme.fontColor}}',
                fontFamily: '{{theme.fontName}}',
                fontWeight: 'normal',
              },
            },
          ],
        },
      },
    },
  },
];
