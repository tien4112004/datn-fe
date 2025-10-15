import type { Template } from '../../types';

export const tableOfContentsTemplates: Template[] = [
  {
    id: 'table-of-contents-default',
    name: 'Table of Contents - Default',
    parameters: [
      {
        key: 'SIDE_PADDING',
        label: 'Side Padding (px)',
        defaultValue: 20,
        min: 0,
        max: 200,
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
            width: {
              expr: 'SLIDE_WIDTH - SIDE_PADDING * 2',
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
            },
            structure: {
              type: 'block',
              label: 'item',
              layout: {
                distribution: '1/5',
                gap: 10,
                horizontalAlignment: 'left',
                verticalAlignment: 'center',
                orientation: 'horizontal',
              },
              border: {
                width: '{{theme.card.borderWidth}}',
                color: '{{theme.themeColors[0]}}',
                radius: '{{theme.card.borderRadius}}',
              },
              children: [
                {
                  type: 'text',
                  id: 'label',
                  label: 'label',
                  numbering: true,
                  text: {
                    color: '{{theme.labelFontColor}}',
                    fontFamily: '{{theme.labelFontName}}',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    fontSizeRange: { minSize: 16, maxSize: 24 },
                  },
                },
                {
                  type: 'text',
                  id: 'content',
                  label: 'content',
                  text: {
                    color: '{{theme.fontColor}}',
                    fontFamily: '{{theme.fontName}}',
                    fontWeight: 'normal',
                    fontStyle: 'normal',
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
    id: 'table-of-contents-grid',
    name: 'Table of Contents - Grid',
    config: {
      containers: {
        title: {
          type: 'text',
          bounds: {
            left: 0,
            top: 20,
            width: {
              expr: 'SLIDE_WIDTH',
            },
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
            offset: 30,
            size: 'fill',
            margin: { left: 50, right: 50, top: 0, bottom: 50 },
          },
          layout: {
            distribution: 'equal',
            gap: 20,
            horizontalAlignment: 'center',
            verticalAlignment: 'center',
            orientation: 'vertical',
          },
          childTemplate: {
            count: 'auto',
            wrap: {
              enabled: true,
              maxItemsPerLine: 3,
              lineCount: 'auto',
              wrapDistribution: 'balanced',
              lineSpacing: 20,
              syncSize: true,
            },
            structure: {
              type: 'block',
              label: 'item',
              layout: {
                distribution: '1/4',
                gap: -10,
                horizontalAlignment: 'center',
                verticalAlignment: 'center',
                orientation: 'horizontal',
              },
              border: {
                width: '{{theme.card.borderWidth}}',
                color: '{{theme.themeColors[0]}}',
                radius: '{{theme.card.borderRadius}}',
              },
              children: [
                {
                  type: 'text',
                  id: 'label',
                  label: 'label',
                  numbering: true,
                  layout: {
                    horizontalAlignment: 'center',
                    verticalAlignment: 'center',
                  },
                  text: {
                    color: '{{theme.themeColors[0]}}',
                    fontFamily: '{{theme.labelFontName}}',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    fontSizeRange: { minSize: 16, maxSize: 24 },
                  },
                },
                {
                  type: 'text',
                  id: 'content',
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
              ],
            },
          },
        },
      },
    },
  },
  {
    id: 'table-of-contents-two-column',
    name: 'Table of Contents - Two Column',
    config: {
      containers: {
        title: {
          type: 'text',
          bounds: {
            left: 0,
            top: 15,
            width: {
              expr: 'SLIDE_WIDTH',
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
            offset: 25,
            size: 'fill',
            margin: { left: 80, right: 80, top: 0, bottom: 40 },
          },
          layout: {
            distribution: 'space-between',
            gap: 20,
            horizontalAlignment: 'left',
            verticalAlignment: 'top',
            orientation: 'horizontal',
          },
          childTemplate: {
            count: 'auto',
            wrap: {
              enabled: true,
              maxItemsPerLine: 4,
              lineCount: 'auto',
              wrapDistribution: 'balanced',
              lineSpacing: 10,
            },
            structure: {
              type: 'block',
              label: 'item',
              layout: {
                distribution: 'equal',
                gap: -5,
                horizontalAlignment: 'center',
                verticalAlignment: 'center',
                orientation: 'vertical',
              },
              border: {
                width: '{{theme.card.borderWidth}}',
                color: '{{theme.themeColors[0]}}',
                radius: '{{theme.card.borderRadius}}',
              },
              children: [
                {
                  type: 'text',
                  id: 'label',
                  label: 'label',
                  numbering: true,
                  text: {
                    color: '{{theme.labelFontColor}}',
                    fontFamily: '{{theme.labelFontName}}',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    fontSizeRange: { minSize: 18, maxSize: 26 },
                  },
                },
                {
                  type: 'text',
                  id: 'content',
                  label: 'content',
                  text: {
                    color: '{{theme.fontColor}}',
                    fontFamily: '{{theme.fontName}}',
                    fontWeight: 'normal',
                    fontStyle: 'normal',
                    textAlign: 'center',
                    fontSizeRange: { minSize: 18, maxSize: 24 },
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
    id: 'table-of-contents-container-border',
    name: 'Table of Contents - Container Border',
    config: {
      containers: {
        title: {
          type: 'text',
          bounds: {
            left: 0,
            top: 15,
            width: {
              expr: 'SLIDE_WIDTH',
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
            margin: { left: 80, right: 80, top: 0, bottom: 40 },
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
              maxItemsPerLine: 4,
              lineCount: 2,
              wrapDistribution: 'balanced',
              lineSpacing: 18,
            },
            structure: {
              type: 'block',
              label: 'item',
              layout: {
                distribution: '1/5',
                gap: 10,
                horizontalAlignment: 'left',
                verticalAlignment: 'center',
                orientation: 'horizontal',
              },
              children: [
                {
                  type: 'text',
                  id: 'label',
                  label: 'label',
                  numbering: true,
                  text: {
                    color: '{{theme.labelFontColor}}',
                    fontFamily: '{{theme.labelFontName}}',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    fontSizeRange: { minSize: 16, maxSize: 24 },
                  },
                },
                {
                  type: 'text',
                  id: 'content',
                  label: 'content',
                  text: {
                    color: '{{theme.fontColor}}',
                    fontFamily: '{{theme.fontName}}',
                    fontWeight: 'normal',
                    fontStyle: 'normal',
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
    id: 'table-of-contents-container-border-shadow',
    name: 'Table of Contents - Container Border Shadow',
    config: {
      containers: {
        title: {
          type: 'text',
          bounds: {
            left: 0,
            top: 15,
            width: {
              expr: 'SLIDE_WIDTH',
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
            margin: { left: 80, right: 80, top: 0, bottom: 50 },
          },
          border: {
            width: 0,
            color: 'transparent',
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
            gap: 20,
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
              lineSpacing: 18,
            },
            structure: {
              type: 'block',
              label: 'item',
              layout: {
                distribution: '1/6',
                gap: 10,
                horizontalAlignment: 'left',
                verticalAlignment: 'center',
                orientation: 'horizontal',
              },
              children: [
                {
                  type: 'text',
                  id: 'label',
                  label: 'label',
                  numbering: true,
                  text: {
                    color: '{{theme.labelFontColor}}',
                    fontFamily: '{{theme.labelFontName}}',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    fontSizeRange: { minSize: 16, maxSize: 24 },
                  },
                },
                {
                  type: 'text',
                  id: 'content',
                  label: 'content',
                  text: {
                    color: '{{theme.card.textColor}}',
                    fontFamily: '{{theme.fontName}}',
                    fontWeight: 'normal',
                    fontStyle: 'normal',
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
    id: 'table-of-contents-container-bullet',
    name: 'Table of Contents - Container Bullet',
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
            pattern: '{content}',
            ordered: true,
            wrapping: true,
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
              id: 'content',
              label: 'content',
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
