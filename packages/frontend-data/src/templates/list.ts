import type { SlideTemplate } from '@aiprimary/core';

export const listTemplates: SlideTemplate[] = [
  {
    layout: 'list',
    id: 'list-default',
    name: 'List - Bordered Items Grid',
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
            width: {
              expr: 'SLIDE_WIDTH - SIDE_PADDING * 2',
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
            margin: { left: 0, right: 0, top: 0, bottom: 40 },
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
    layout: 'list',
    id: 'list-compact',
    name: 'List - Simple Grid',
    parameters: [
      {
        key: 'SIDE_PADDING',
        label: 'Side Padding (px)',
        defaultValue: 40,
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
            margin: { left: 0, right: 0, top: 0, bottom: 40 },
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
    layout: 'list',
    id: 'list-cards',
    name: 'List - Staggered Shadowed Cards',
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
    ],
    config: {
      containers: {
        title: {
          type: 'text',
          bounds: {
            left: { expr: 'SIDE_PADDING' },
            top: 10,
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
            offset: 25,
            size: 'fill',
            margin: { left: 0, right: 0, top: 0, bottom: 50 },
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
    layout: 'list',
    id: 'list-numbered',
    name: 'List - Numbered Grid with Bordered Content',
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
          type: 'block',
          positioning: {
            relativeTo: 'title',
            axis: 'vertical',
            anchor: 'end',
            offset: 15,
            size: 'fill',
            margin: { left: 0, right: 0, top: 0, bottom: 40 },
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
    layout: 'list',
    id: 'list-numbered-compact',
    name: 'List - Simple Numbered Grid',
    parameters: [
      {
        key: 'SIDE_PADDING',
        label: 'Side Padding (px)',
        defaultValue: 40,
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
            margin: { left: 0, right: 0, top: 0, bottom: 40 },
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
                distribution: '1/5',
                gap: 8,
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
    layout: 'list',
    id: 'list-numbered-cards',
    name: 'List - Staggered Numbered Shadowed Cards',
    parameters: [
      {
        key: 'SIDE_PADDING',
        label: 'Side Padding (px)',
        defaultValue: 40,
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
            margin: { left: 0, right: 0, top: 0, bottom: 50 },
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
    layout: 'list',
    id: 'list-container-border',
    name: 'List - Framed Grid',
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
            margin: { left: 0, right: 0, top: 0, bottom: 50 },
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
    layout: 'list',
    id: 'list-container-border-numbered',
    name: 'List - Framed Numbered Grid',
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
          id: 'title',
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
          id: 'content',
          type: 'block',
          positioning: {
            relativeTo: 'title',
            axis: 'vertical',
            anchor: 'end',
            offset: 20,
            size: 'fill',
            margin: { left: 0, right: 0, top: 0, bottom: 50 },
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
  {
    layout: 'list',
    id: 'list-container-bullet',
    name: 'List - Container Bullet',
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
            margin: { left: 0, right: 0, top: 0, bottom: 40 },
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
            fontSizeRange: { minSize: 15, maxSize: 22 },
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
