import type { Template } from '../../types';
import type { ContentSeparator } from '../../graphics/types';

export const twoColumnTemplates: Template[] = [
  {
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
  },
  {
    id: 'two-column-container-border',
    name: 'Two Column - Container Border',
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
            margin: { left: 50, right: 50, top: 0, bottom: 50 },
          },
          border: {
            width: 1,
            color: '{{theme.themeColors[0]}}',
            radius: 20,
            directions: ['top', 'right', 'bottom'],
          },
          layout: {
            distribution: 'space-between',
            gap: 18,
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
    id: 'two-column-container-border-shadow',
    name: 'Two Column - Container Border Shadow',
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
            offset: 25,
            size: 'fill',
            margin: { left: 60, right: 60, top: 0, bottom: 60 },
          },
          border: {
            width: 0,
            color: '{{theme.themeColors[0]}}',
            radius: '{{theme.card.borderRadius}}',
          },
          shadow: {
            h: '{{theme.card.shadow.h}}',
            v: '{{theme.card.shadow.v}}',
            blur: '{{theme.card.shadow.blur}}',
            color: '{{theme.card.shadow.color}}',
          },
          background: {
            color: '{{theme.card.backgroundColor}}',
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
                  text: {
                    color: '{{theme.card.textColor}}',
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
    id: 'two-column-container-border-left',
    name: 'Two Column - Container Border Left',
    config: {
      containers: {
        title: {
          type: 'text',
          bounds: {
            left: 15,
            top: 15,
            width: { expr: 'SLIDE_WIDTH - 30' },
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
            margin: { left: 45, right: 45, top: 0, bottom: 45 },
          },
          border: {
            width: '{{theme.card.borderWidth}}',
            color: '{{theme.themeColors[0]}}',
            radius: '{{theme.card.borderRadius}}',
          },
          layout: {
            distribution: 'space-between',
            gap: 15,
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
                horizontalAlignment: 'left',
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
  },
  {
    id: 'two-column-bordered-items',
    name: 'Two Column - Each Column Border',
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
        leftColumn: {
          type: 'block',
          bounds: {
            left: 40,
            top: {
              expr: 'title.top + title.height + 20',
            },
            width: {
              expr: '(SLIDE_WIDTH - 120) / 2',
            },
            height: {
              expr: 'SLIDE_HEIGHT - title.top - title.height - 60',
            },
          },
          border: {
            width: '{{theme.card.borderWidth}}',
            color: '{{theme.themeColors[0]}}',
            radius: '{{theme.card.borderRadius}}',
          },
          layout: {
            distribution: 'space-between',
            gap: 15,
            horizontalAlignment: 'center',
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
              },
            },
          },
        },
        rightColumn: {
          type: 'block',
          bounds: {
            left: {
              expr: 'leftColumn.left + leftColumn.width + 40',
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
            color: '{{theme.themeColors[0]}}',
            radius: '{{theme.card.borderRadius}}',
          },
          layout: {
            distribution: 'space-between',
            gap: 15,
            horizontalAlignment: 'center',
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
      } as ContentSeparator,
    ],
  },
  {
    id: 'two-column-bordered-items-shadow',
    name: 'Two Column - Each Column Border Shadow',
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
        leftColumn: {
          type: 'block',
          bounds: {
            left: 50,
            top: {
              expr: 'title.top + title.height + 25',
            },
            width: {
              expr: '(SLIDE_WIDTH - 140) / 2',
            },
            height: {
              expr: 'SLIDE_HEIGHT - title.top - title.height - 75',
            },
          },
          border: {
            width: '{{theme.card.borderWidth}}',
            color: '{{theme.themeColors[0]}}',
            radius: '{{theme.card.borderRadius}}',
          },
          shadow: {
            h: '{{theme.card.shadow.h}}',
            v: '{{theme.card.shadow.v}}',
            blur: '{{theme.card.shadow.blur}}',
            color: '{{theme.card.shadow.color}}',
          },
          background: {
            color: '{{theme.card.backgroundColor}}',
          },
          layout: {
            distribution: 'space-between',
            gap: 15,
            horizontalAlignment: 'center',
            verticalAlignment: 'top',
            orientation: 'vertical',
          },
          childTemplate: {
            count: 'auto',
            structure: {
              type: 'text',
              label: 'item',
              text: {
                color: '{{theme.card.textColor}}',
                fontFamily: '{{theme.fontName}}',
                fontWeight: 'normal',
                textAlign: 'left',
              },
            },
          },
        },
        rightColumn: {
          type: 'block',
          bounds: {
            left: {
              expr: 'leftColumn.left + leftColumn.width + 40',
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
            color: '{{theme.themeColors[0]}}',
            radius: '{{theme.card.borderRadius}}',
          },
          shadow: {
            h: '{{theme.card.shadow.h}}',
            v: '{{theme.card.shadow.v}}',
            blur: '{{theme.card.shadow.blur}}',
            color: '{{theme.card.shadow.color}}',
          },
          background: {
            color: '{{theme.card.backgroundColor}}',
          },
          layout: {
            distribution: 'space-between',
            gap: 15,
            horizontalAlignment: 'center',
            verticalAlignment: 'top',
            orientation: 'vertical',
          },
          childTemplate: {
            count: 'auto',
            structure: {
              type: 'text',
              label: 'item',
              text: {
                color: '{{theme.card.textColor}}',
                fontFamily: '{{theme.fontName}}',
                fontWeight: 'normal',
                textAlign: 'left',
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
      } as ContentSeparator,
    ],
  },
  {
    id: 'two-column-bordered-items-compact',
    name: 'Two Column - Each Column Border Compact',
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
        leftColumn: {
          type: 'block',
          bounds: {
            left: 35,
            top: {
              expr: 'title.top + title.height + 20',
            },
            width: {
              expr: '(SLIDE_WIDTH - 100) / 2',
            },
            height: {
              expr: 'SLIDE_HEIGHT - title.top - title.height - 55',
            },
          },
          border: {
            width: '{{theme.card.borderWidth}}',
            color: '{{theme.themeColors[0]}}',
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
              },
            },
          },
        },
        rightColumn: {
          type: 'block',
          bounds: {
            left: {
              expr: 'leftColumn.left + leftColumn.width + 30',
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
            color: '{{theme.themeColors[0]}}',
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
      } as ContentSeparator,
    ],
  },
  {
    id: 'two-column-container-bullet',
    name: 'Two Column - Container Bullet',
    config: {
      containers: {
        title: {
          type: 'text',
          bounds: {
            left: 0,
            top: 15,
            width: { expr: 'SLIDE_WIDTH' },
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
            color: '{{theme.themeColors[0]}}',
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
