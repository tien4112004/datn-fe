import type { SlideTemplate } from '@aiprimary/core';

export const labeledListTemplates: SlideTemplate[] = [
  {
    layout: 'labeled_list',
    id: 'labeled-list-flexible',
    name: 'Labeled List - Flexible Grid',
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
              orientation: 'vertical',
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
                layout: {
                  verticalAlignment: 'bottom',
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
                  verticalAlignment: 'top',
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
  {
    layout: 'labeled_list',
    id: 'labeled-list-vertical-numbered',
    name: 'Labeled List - Vertical Numbered',
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
              distribution: 'maxLabel/fill',
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
    layout: 'labeled_list',
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
              distribution: 'maxLabel/fill',
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
                  color: '{{theme.labelFontColor}}',
                  fontFamily: '{{theme.labelFontName}}',
                  fontWeight: 'bold',
                  textAlign: 'right',
                  fontSizeRange: { minSize: 14, maxSize: 26 },
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
    layout: 'labeled_list',
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
          color: '{{theme.outline.color}}',
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
];
