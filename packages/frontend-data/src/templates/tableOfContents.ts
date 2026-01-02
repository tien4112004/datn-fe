import type { SlideTemplate } from '@aiprimary/core';

export const tableOfContentsTemplates: SlideTemplate[] = [
  {
    layout: 'table_of_contents',
    id: 'table-of-contents-two-column',
    name: 'TOC - Card Grid',
    parameters: [
      {
        key: 'SIDE_PADDING',
        label: 'Side Padding (px)',
        defaultValue: 20,
        min: 0,
        max: 100,
        step: 5,
        description: 'Left/right slide padding',
      },
      {
        key: 'MAX_ITEMS_PER_LINE',
        label: 'Items Per Line',
        defaultValue: 2,
        min: 1,
        max: 6,
        step: 1,
        description: 'Number of columns',
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
          distribution: 'space-around',
          gap: 20,
          horizontalAlignment: 'left',
          verticalAlignment: 'top',
          orientation: 'horizontal',
        },
        childTemplate: {
          count: 'auto',
          wrap: {
            enabled: true,
            maxItemsPerLine: 'MAX_ITEMS_PER_LINE',
            lineCount: 'auto',
            wrapDistribution: 'balanced',
            lineSpacing: 10,
            syncSize: true,
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
              color: '{{theme.outline.color}}',
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
                  fontSizeRange: { minSize: 18, maxSize: 28 },
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
                  fontSizeRange: { minSize: 18, maxSize: 26 },
                },
              },
            ],
          },
        },
      },
    },
  },
  {
    layout: 'table_of_contents',
    id: 'table-of-contents-container-border',
    name: 'TOC - Bordered Container',
    parameters: [
      {
        key: 'SIDE_PADDING',
        label: 'Side Padding (px)',
        defaultValue: 20,
        min: 0,
        max: 100,
        step: 5,
        description: 'Left/right slide padding',
      },
      {
        key: 'MAX_ITEMS_PER_LINE',
        label: 'Items Per Line',
        defaultValue: 2,
        min: 1,
        max: 6,
        step: 1,
        description: 'Number of items per row',
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
        border: {
          width: '{{theme.card.borderWidth}}',
          color: '{{theme.outline.color}}',
          radius: '{{theme.card.borderRadius}}',
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
            maxItemsPerLine: 'MAX_ITEMS_PER_LINE',
            lineCount: 2,
            wrapDistribution: 'balanced',
            lineSpacing: 18,
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
                  fontSizeRange: { minSize: 16, maxSize: 28 },
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
  {
    layout: 'table_of_contents',
    id: 'table-of-contents-container-bullet',
    name: 'TOC - Bullet List',
    parameters: [
      {
        key: 'SIDE_PADDING',
        label: 'Side Padding (px)',
        defaultValue: 20,
        min: 0,
        max: 100,
        step: 5,
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
  {
    layout: 'table_of_contents',
    id: 'table-of-contents-flexible',
    name: 'TOC - Flexible Grid',
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
          offset: 20,
          size: 'fill',
          margin: { left: 60, right: 60, top: 0, bottom: 40 },
        },
        layout: {
          distribution: 'space-around',
          gap: 25,
          horizontalAlignment: 'left',
          verticalAlignment: 'top',
          orientation: 'vertical',
        },
        childTemplate: {
          count: 'auto',
          wrap: {
            enabled: true,
            maxItemsPerLine: 'MAX_ITEMS_PER_LINE',
            lineCount: 2,
            wrapDistribution: 'balanced',
            lineSpacing: 20,
            syncSize: true,
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
                  horizontalAlignment: 'center',
                  verticalAlignment: 'center',
                },
                text: {
                  color: '{{theme.labelFontColor}}',
                  fontFamily: '{{theme.labelFontName}}',
                  fontWeight: 'bold',
                  textAlign: 'center',
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
                  fontSizeRange: { minSize: 18, maxSize: 26 },
                },
              },
            ],
          },
        },
      },
    },
  },
];
