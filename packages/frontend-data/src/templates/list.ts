import type { SlideTemplate } from '@aiprimary/core';

export const listTemplates: SlideTemplate[] = [
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
              distribution: 'maxLabel/fill',
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
                text: {
                  color: '{{theme.labelFontColor}}',
                  fontFamily: '{{theme.labelFontName}}',
                  fontWeight: 'bold',
                  textAlign: 'right',
                  fontSizeRange: { minSize: 16, maxSize: 28 },
                },
              },
              {
                type: 'text',
                id: 'content',
                label: 'content',
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
                  fontSizeRange: { minSize: 15, maxSize: 24 },
                },
              },
            ],
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
              distribution: 'maxLabel/fill',
              gap: 10,
              horizontalAlignment: 'left',
              verticalAlignment: 'center',
              orientation: 'horizontal',
            },
            border: {
              width: '{{theme.card.borderWidth}}',
              color: '{{theme.outline.color}}',
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
                  fontSizeRange: { minSize: 16, maxSize: 28 },
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
                  fontSizeRange: { minSize: 15, maxSize: 24 },
                },
              },
            ],
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
          color: '{{theme.outline.color}}',
          radius: '{{theme.card.borderRadius}}',
        },
        text: {
          color: '{{theme.fontColor}}',
          fontFamily: '{{theme.fontName}}',
          fontWeight: 'normal',
          textAlign: 'left',
          lineHeight: 1.5,
          fontSizeRange: { minSize: 15, maxSize: 28 },
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
              fontSizeRange: { minSize: 15, maxSize: 28 },
            },
          },
        ],
      },
    },
  },
  {
    layout: 'list',
    id: 'list-flexible',
    name: 'List - Flexible Grid',
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
      {
        key: 'MAX_ITEMS_PER_LINE',
        label: 'Max Items Per Line',
        defaultValue: 4,
        min: 1,
        max: 6,
        step: 1,
        description: 'Maximum number of items per row',
      },
    ],
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
            maxItemsPerLine: 'MAX_ITEMS_PER_LINE',
            lineCount: 2,
            wrapDistribution: 'balanced',
            lineSpacing: 15,
            alternating: { start: 20, end: 20 },
          },
          structure: {
            type: 'text',
            label: 'item',
            border: {
              width: '{{theme.card.borderWidth}}',
              color: '{{theme.outline.color}}',
              radius: '{{theme.card.borderRadius}}',
            },
            layout: {
              horizontalAlignment: 'center',
              verticalAlignment: 'center',
            },
            text: {
              color: '{{theme.fontColor}}',
              fontFamily: '{{theme.fontName}}',
              fontWeight: 'normal',
              textAlign: 'center',
              fontSizeRange: { minSize: 15, maxSize: 24 },
            },
          },
        },
      },
    },
  },
  {
    layout: 'list',
    id: 'list-flexible-numbered',
    name: 'List - Flexible Numbered Grid',
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
      {
        key: 'MAX_ITEMS_PER_LINE',
        label: 'Max Items Per Line',
        defaultValue: 4,
        min: 1,
        max: 6,
        step: 1,
        description: 'Maximum number of items per row',
      },
    ],
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
            maxItemsPerLine: 'MAX_ITEMS_PER_LINE',
            lineCount: 2,
            wrapDistribution: 'balanced',
            lineSpacing: 15,
            alternating: { start: 20, end: 20 },
          },
          structure: {
            type: 'block',
            layout: {
              distribution: 'maxLabel/fill',
              gap: 10,
              horizontalAlignment: 'center',
              verticalAlignment: 'center',
              orientation: 'horizontal',
            },
            border: {
              width: '{{theme.card.borderWidth}}',
              color: '{{theme.outline.color}}',
              radius: '{{theme.card.borderRadius}}',
            },
            children: [
              {
                type: 'text',
                label: 'label',
                numbering: true,
                layout: {
                  horizontalAlignment: 'right',
                  verticalAlignment: 'center',
                },
                text: {
                  color: '{{theme.labelFontColor}}',
                  fontFamily: '{{theme.labelFontName}}',
                  fontWeight: 'bold',
                  textAlign: 'right',
                  fontSizeRange: { minSize: 16, maxSize: 28 },
                },
              },
              {
                type: 'text',
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
                  fontSizeRange: { minSize: 15, maxSize: 24 },
                },
              },
            ],
          },
        },
      },
    },
  },
];
