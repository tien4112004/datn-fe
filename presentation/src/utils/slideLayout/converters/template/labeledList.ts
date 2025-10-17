import type { Template } from '../../types';

export const labeledListTemplates: Template[] = [
  {
    id: 'labeled-list-default',
    name: 'Labeled List - Default',
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
            distribution: 'space-around',
            gap: 25,
            horizontalAlignment: 'center',
            verticalAlignment: 'center',
            orientation: 'horizontal',
          },
          childTemplate: {
            count: 'auto',
            wrap: {
              enabled: true,
              maxItemsPerLine: 4,
              lineCount: 2,
              wrapDistribution: 'balanced',
              lineSpacing: 15,
              alternating: { start: 20, end: 20 },
            },
            structure: {
              type: 'block',
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
              children: [
                {
                  type: 'text',
                  label: 'label',
                  text: {
                    color: '{{theme.labelFontColor}}',
                    fontFamily: '{{theme.labelFontName}}',
                    fontWeight: 'bold',
                    textAlign: 'center',
                  },
                },
                {
                  type: 'text',
                  label: 'content',
                  layout: {
                    horizontalAlignment: 'center',
                    verticalAlignment: 'center',
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
  },
  {
    id: 'labeled-list-grid',
    name: 'Labeled List - Grid',
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
            margin: { left: 40, right: 40, top: 0, bottom: 40 },
          },
          layout: {
            distribution: 'space-around',
            gap: 20,
            horizontalAlignment: 'center',
            verticalAlignment: 'center',
            orientation: 'horizontal',
          },
          childTemplate: {
            count: 'auto',
            wrap: {
              enabled: true,
              maxItemsPerLine: 3,
              lineCount: 2,
              wrapDistribution: 'balanced',
              lineSpacing: 20,
              syncSize: true,
            },
            structure: {
              type: 'block',
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
              shadow: {
                h: '{{theme.card.shadow.h}}',
                v: '{{theme.card.shadow.v}}',
                blur: '{{theme.card.shadow.blur}}',
                color: '{{theme.card.shadow.color}}',
              },
              children: [
                {
                  type: 'text',
                  label: 'label',
                  layout: {
                    horizontalAlignment: 'center',
                    verticalAlignment: 'center',
                  },
                  text: {
                    color: '{{theme.labelFontColor}}',
                    fontFamily: '{{theme.labelFontName}}',
                    fontWeight: 'bold',
                    textAlign: 'center',
                  },
                },
                {
                  type: 'text',
                  label: 'content',
                  layout: {
                    horizontalAlignment: 'center',
                    verticalAlignment: 'center',
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
  },
  {
    id: 'labeled-list-single-row',
    name: 'Labeled List - Single Row',
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
            fontStyle: 'normal',
          },
        },
        content: {
          type: 'block',
          id: 'content',
          positioning: {
            relativeTo: 'title',
            axis: 'vertical',
            anchor: 'end',
            offset: 25,
            size: 'fill',
            margin: { left: 60, right: 60, top: 0, bottom: 40 },
          },
          layout: {
            distribution: 'space-around',
            gap: 20,
            horizontalAlignment: 'center',
            verticalAlignment: 'center',
            orientation: 'horizontal',
          },
          childTemplate: {
            count: 'auto',
            wrap: {
              enabled: false,
            },
            structure: {
              type: 'block',
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
              children: [
                {
                  type: 'text',
                  label: 'label',
                  text: {
                    color: '{{theme.labelFontColor}}',
                    fontFamily: '{{theme.labelFontName}}',
                    fontWeight: 'bold',
                    textAlign: 'center',
                  },
                },
                {
                  type: 'text',
                  label: 'content',
                  layout: {
                    horizontalAlignment: 'center',
                    verticalAlignment: 'center',
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
  },
  {
    id: 'labeled-list-container-border',
    name: 'Labeled List - Container Border',
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
            margin: { left: 40, right: 40, top: 0, bottom: 40 },
          },
          border: {
            width: '{{theme.card.borderWidth}}',
            color: '{{theme.themeColors[0]}}',
            radius: '{{theme.card.borderRadius}}',
          },
          layout: {
            distribution: 'space-around',
            gap: 20,
            horizontalAlignment: 'center',
            verticalAlignment: 'center',
            orientation: 'horizontal',
          },
          childTemplate: {
            count: 'auto',
            wrap: {
              enabled: true,
              maxItemsPerLine: 5,
              lineCount: 2,
              wrapDistribution: 'balanced',
              lineSpacing: 15,
              alternating: { start: 20, end: 20 },
            },
            structure: {
              type: 'block',
              layout: {
                distribution: 'equal',
                gap: 10,
                horizontalAlignment: 'center',
                verticalAlignment: 'center',
                orientation: 'vertical',
              },
              children: [
                {
                  type: 'text',
                  label: 'label',
                  layout: {
                    horizontalAlignment: 'center',
                    verticalAlignment: 'center',
                  },
                  text: {
                    color: '{{theme.labelFontColor}}',
                    fontFamily: '{{theme.labelFontName}}',
                    fontWeight: 'bold',
                    fontStyle: 'normal',
                    textAlign: 'center',
                  },
                },
                {
                  type: 'text',
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
    id: 'labeled-list-vertical-numbered',
    name: 'Labeled List - Vertical Numbered',
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
              enabled: false,
            },
            structure: {
              type: 'block',
              label: 'item',
              layout: {
                distribution: '1/3',
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
    id: 'labeled-list-vertical-simple',
    name: 'Labeled List - Vertical Simple',
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
              enabled: false,
            },
            structure: {
              type: 'block',
              label: 'item',
              layout: {
                distribution: '1/3',
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
    id: 'labeled-list-vertical-container-border',
    name: 'Labeled List - Vertical Container Border',
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
            margin: { left: 40, right: 40, top: 0, bottom: 40 },
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
              enabled: false,
            },
            structure: {
              type: 'block',
              label: 'item',
              layout: {
                distribution: '1/3',
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
    id: 'labeled-list-vertical-container-bullet',
    name: 'Labeled List - Vertical Container Bullet',
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
            pattern: '{label}: {content}',
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
            color: '{{theme.labelFontColor}}',
            fontFamily: '{{theme.fontName}}',
            fontWeight: 'normal',
            textAlign: 'left',
            lineHeight: 1.5,
          },
          children: [
            {
              type: 'text',
              id: 'label',
              label: 'label',
              text: {
                color: '{{theme.labelFontColor}}',
                fontFamily: '{{theme.labelFontName}}',
                fontWeight: 'bold',
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
              },
            },
          ],
        },
      },
    },
  },
];
