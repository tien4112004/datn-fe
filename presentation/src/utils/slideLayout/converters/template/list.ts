import type { Template } from '../../types';

export const listTemplates: Template[] = [
  {
    id: 'list-default',
    name: 'List - Bordered Items Grid',
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
          type: 'block',
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
              maxItemsPerLine: 4,
              lineCount: 'auto',
              wrapDistribution: 'balanced',
              lineSpacing: 20,
              syncSize: true,
            },
            structure: {
              type: 'text',
              label: 'item',
              layout: {
                distribution: 'equal',
                gap: 10,
                horizontalAlignment: 'center',
                verticalAlignment: 'center',
                orientation: 'vertical',
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
                fontStyle: 'normal',
                textAlign: 'left',
                fontSizeRange: { minSize: 15, maxSize: 22 },
              },
            },
          },
        },
      },
    },
  },
  {
    id: 'list-compact',
    name: 'List - Simple Grid',
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
            offset: 15,
            size: 'fill',
            margin: { left: 40, right: 40, top: 0, bottom: 40 },
          },
          layout: {
            distribution: 'equal',
            gap: 15,
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
              lineSpacing: 16,
              syncSize: true,
            },
            structure: {
              type: 'text',
              label: 'item',
              border: {
                width: 1,
                color: '{{theme.themeColors[0]}}',
                radius: '{{theme.card.borderRadius}}',
              },
              text: {
                color: '{{theme.fontColor}}',
                fontFamily: '{{theme.fontName}}',
                fontWeight: 'normal',
                textAlign: 'left',
                fontSizeRange: { minSize: 15, maxSize: 22 },
              },
            },
          },
        },
      },
    },
  },
  {
    id: 'list-cards',
    name: 'List - Staggered Shadowed Cards',
    config: {
      containers: {
        title: {
          type: 'text',
          bounds: {
            left: 0,
            top: 10,
            width: { expr: 'SLIDE_WIDTH' },
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
            offset: 25,
            size: 'fill',
            margin: { left: 40, right: 40, top: 0, bottom: 50 },
          },
          layout: {
            distribution: 'equal',
            gap: 20,
            verticalAlignment: 'top',
            orientation: 'vertical',
          },
          childTemplate: {
            count: 'auto',
            wrap: {
              enabled: true,
              maxItemsPerLine: 5,
              lineCount: 2,
              wrapDistribution: 'top-heavy',
              lineSpacing: 20,
              syncSize: true,
              alternating: { start: 15, end: -15 },
            },
            structure: {
              type: 'text',
              label: 'item',
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
              text: {
                color: '{{theme.fontColor}}',
                fontFamily: '{{theme.fontName}}',
                fontWeight: 'normal',
                textAlign: 'center',
                fontSizeRange: { minSize: 15, maxSize: 22 },
              },
            },
          },
        },
      },
    },
  },
  {
    id: 'list-numbered',
    name: 'List - Numbered Grid with Bordered Content',
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
            distribution: 'space-between',
            gap: 15,
            verticalAlignment: 'top',
            orientation: 'vertical',
          },
          childTemplate: {
            count: 'auto',
            wrap: {
              enabled: true,
              maxItemsPerLine: 4,
              lineCount: 'auto',
              wrapDistribution: 'balanced',
              lineSpacing: 16,
              syncSize: true,
            },
            structure: {
              type: 'block',
              label: 'item',
              layout: {
                distribution: '1/5',
                gap: 15,
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
                    textAlign: 'right',
                    fontSizeRange: { minSize: 16, maxSize: 24 },
                  },
                },
                {
                  type: 'text',
                  id: 'content',
                  label: 'content',
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
                    fontSizeRange: { minSize: 15, maxSize: 22 },
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
    id: 'list-numbered-compact',
    name: 'List - Simple Numbered Grid',
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
            offset: 15,
            size: 'fill',
            margin: { left: 100, right: 100, top: 0, bottom: 40 },
          },
          layout: {
            distribution: 'space-between',
            gap: 12,
            verticalAlignment: 'top',
            horizontalAlignment: 'center',
            orientation: 'vertical',
          },
          childTemplate: {
            count: 'auto',
            wrap: {
              enabled: true,
              maxItemsPerLine: 5,
              lineCount: 'auto',
              wrapDistribution: 'balanced',
              lineSpacing: 16,
              syncSize: false,
            },
            structure: {
              type: 'block',
              label: 'item',
              layout: {
                distribution: '1/6',
                gap: 12,
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
                  layout: {
                    horizontalAlignment: 'center',
                    verticalAlignment: 'center',
                  },
                  text: {
                    color: '{{theme.themeColors[0]}}',
                    fontFamily: '{{theme.labelFontName}}',
                    fontWeight: 'bold',
                    textAlign: 'right',
                    fontSizeRange: { minSize: 14, maxSize: 20 },
                  },
                },
                {
                  type: 'text',
                  id: 'content',
                  label: 'content',
                  layout: {
                    horizontalAlignment: 'left',
                    verticalAlignment: 'center',
                  },
                  text: {
                    color: '{{theme.fontColor}}',
                    fontFamily: '{{theme.fontName}}',
                    fontWeight: 'normal',
                    textAlign: 'left',
                    fontSizeRange: { minSize: 15, maxSize: 22 },
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
    id: 'list-numbered-cards',
    name: 'List - Staggered Numbered Shadowed Cards',
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
            margin: { left: 50, right: 50, top: 0, bottom: 50 },
          },
          layout: {
            distribution: 'equal',
            gap: 18,
            verticalAlignment: 'top',
            orientation: 'vertical',
          },
          childTemplate: {
            count: 'auto',
            wrap: {
              enabled: true,
              maxItemsPerLine: 4,
              lineCount: 2,
              wrapDistribution: 'top-heavy',
              lineSpacing: 20,
              syncSize: true,
              alternating: { start: 15, end: -15 },
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
                    color: '{{theme.card.textColor}}',
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
                    horizontalAlignment: 'left',
                    verticalAlignment: 'center',
                  },
                  text: {
                    color: '{{theme.card.textColor}}',
                    fontFamily: '{{theme.fontName}}',
                    fontWeight: 'normal',
                    textAlign: 'left',
                    fontSizeRange: { minSize: 15, maxSize: 22 },
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
    id: 'list-container-border',
    name: 'List - Framed Grid',
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
            color: '{{theme.themeColors[0]}}',
            radius: '{{theme.card.borderRadius}}',
          },
          layout: {
            distribution: 'equal',
            gap: 15,
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
              lineSpacing: 16,
              syncSize: true,
            },
            structure: {
              type: 'text',
              label: 'item',
              text: {
                color: '{{theme.fontColor}}',
                fontFamily: '{{theme.fontName}}',
                fontWeight: 'normal',
                textAlign: 'center',
                fontSizeRange: { minSize: 15, maxSize: 22 },
              },
            },
          },
        },
      },
    },
  },
  {
    id: 'list-container-border-numbered',
    name: 'List - Framed Numbered Grid',
    config: {
      containers: {
        title: {
          id: 'title',
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
          id: 'content',
          type: 'block',
          positioning: {
            relativeTo: 'title',
            axis: 'vertical',
            anchor: 'end',
            offset: 20,
            size: 'fill',
            margin: { left: 70, right: 70, top: 0, bottom: 50 },
          },
          border: {
            width: '{{theme.card.borderWidth}}',
            color: '{{theme.themeColors[0]}}',
            radius: '{{theme.card.borderRadius}}',
          },
          layout: {
            distribution: 'equal',
            gap: 10,
            verticalAlignment: 'top',
            orientation: 'vertical',
          },
          childTemplate: {
            count: 'auto',
            wrap: {
              enabled: true,
              maxItemsPerLine: 4,
              lineCount: 'auto',
              wrapDistribution: 'balanced',
              lineSpacing: 16,
              syncSize: true,
            },
            structure: {
              id: 'item',
              type: 'block',
              label: 'item',
              layout: {
                distribution: '1/5',
                gap: 12,
                horizontalAlignment: 'left',
                verticalAlignment: 'top',
                orientation: 'horizontal',
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
                    textAlign: 'right',
                    fontSizeRange: { minSize: 14, maxSize: 20 },
                  },
                },
                {
                  type: 'text',
                  id: 'content',
                  label: 'content',
                  layout: {
                    horizontalAlignment: 'left',
                    verticalAlignment: 'center',
                  },
                  text: {
                    color: '{{theme.fontColor}}',
                    fontFamily: '{{theme.fontName}}',
                    fontWeight: 'normal',
                    textAlign: 'left',
                    fontSizeRange: { minSize: 15, maxSize: 22 },
                  },
                },
              ],
            },
          },
        },
      },
    },
  },
];
