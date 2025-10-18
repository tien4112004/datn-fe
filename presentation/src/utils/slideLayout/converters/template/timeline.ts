import type { Template } from '../../types';

const straightTimelineTemplate: Template = {
  id: 'timeline-straight',
  name: 'Timeline - Straight',
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
        positioning: {
          relativeTo: 'title',
          axis: 'vertical',
          anchor: 'end',
          offset: 0,
          size: 'fill',
          margin: { left: 50, right: 50, bottom: 40 },
        },
        layout: {
          orientation: 'horizontal',
          distribution: 'equal',
          gap: 80,
          verticalAlignment: 'top',
        },
        childTemplate: {
          count: 'auto',
          wrap: {
            enabled: true,
            maxItemsPerLine: 4,
            lineCount: 2,
            wrapDistribution: 'balanced',
            lineSpacing: 40,
            syncSize: true,
            snake: true,
          },
          structure: {
            type: 'block',
            layout: {
              orientation: 'vertical',
              gap: -10,
              horizontalAlignment: 'center',
              verticalAlignment: 'center',
            },
            border: {
              color: '{{theme.borderColor}}',
              width: '{{theme.card.borderWidth}}',
              radius: '{{theme.card.borderRadius}}',
            },
            children: [
              {
                type: 'text',
                label: 'label',
                text: {
                  fontSizeRange: { minSize: 16, maxSize: 20 },
                  fontWeight: 'bold',
                  color: '{{theme.themeColors[0]}}',
                  fontFamily: '{{theme.labelFontName}}',
                  textAlign: 'center',
                },
              },
              {
                type: 'text',
                label: 'content',
                text: {
                  fontSizeRange: { minSize: 12, maxSize: 16 },
                  color: '{{theme.fontColor}}',
                  fontFamily: '{{theme.fontName}}',
                  textAlign: 'center',
                },
              },
            ],
          },
        },
      },
    },
  },
  graphics: [
    {
      type: 'wrappingTimeline',
      containerId: 'content',
      thickness: 3,
    },
  ],
};

/**
 * Template 2: Alternating Timeline
 * Alternating timeline with zigzag layout - items alternate between two rows
 * with vertical branches connecting to a central horizontal line
 */
const alternatingTimelineTemplate: Template = {
  id: 'timeline-alternating',
  name: 'Timeline - Alternating',
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
        positioning: {
          relativeTo: 'title',
          axis: 'vertical',
          anchor: 'end',
          offset: 10,
          size: 'fill',
          margin: { left: 20, right: 20, bottom: 20 },
        },
        layout: {
          orientation: 'horizontal',
          distribution: 'equal',
          gap: 60,
          verticalAlignment: 'center',
        },
        childTemplate: {
          count: 'auto',
          wrap: {
            enabled: true,
            zigzag: true,
            lineSpacing: 120,
            reverseOddRowChildren: true,
          },
          structure: {
            type: 'block',
            layout: {
              orientation: 'vertical',
              gap: 10,
              horizontalAlignment: 'center',
              verticalAlignment: 'bottom',
            },
            children: [
              {
                type: 'text',
                label: 'content',
                text: {
                  fontSizeRange: { minSize: 11, maxSize: 15 },
                  color: '{{theme.fontColor}}',
                  fontFamily: '{{theme.fontName}}',
                  textAlign: 'center',
                },
              },
              {
                type: 'text',
                label: 'label',
                border: {
                  color: '{{theme.borderColor}}',
                  width: '{{theme.card.borderWidth}}',
                  radius: '{{theme.card.borderRadius}}',
                },
                text: {
                  fontSizeRange: { minSize: 14, maxSize: 18 },
                  fontWeight: 'bold',
                  color: '{{theme.themeColors[0]}}',
                  fontFamily: '{{theme.labelFontName}}',
                  textAlign: 'center',
                },
              },
            ],
          },
        },
      },
    },
  },
  graphics: [
    {
      type: 'alternatingTimeline',
      containerId: 'content',
      thickness: 3,
      branchLength: 40,
    },
  ],
};

/**
 * Template 3: ZigZag Timeline
 * Diagonal arrows connecting items in zigzag layout
 * Creates a dynamic visual flow with alternating diagonal connections
 */
const zigZagTimelineTemplate: Template = {
  id: 'timeline-zigzag',
  name: 'Timeline - ZigZag',
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
        positioning: {
          relativeTo: 'title',
          axis: 'vertical',
          anchor: 'end',
          offset: 10,
          size: 'fill',
          margin: { left: 30, right: 30, bottom: 30 },
        },
        layout: {
          orientation: 'horizontal',
          distribution: 'equal',
          gap: 60,
          verticalAlignment: 'center',
        },
        childTemplate: {
          count: 'auto',
          wrap: {
            enabled: true,
            zigzag: true,
            lineSpacing: 120,
          },
          structure: {
            type: 'block',
            layout: {
              orientation: 'vertical',
              gap: 10,
              horizontalAlignment: 'center',
            },
            border: {
              color: '{{theme.borderColor}}',
              width: '{{theme.card.borderWidth}}',
              radius: '{{theme.card.borderRadius}}',
            },
            children: [
              {
                type: 'text',
                label: 'label',
                text: {
                  fontSizeRange: { minSize: 14, maxSize: 18 },
                  fontWeight: 'bold',
                  color: '{{theme.themeColors[1]}}',
                  fontFamily: '{{theme.labelFontName}}',
                  textAlign: 'center',
                },
              },
              {
                type: 'text',
                label: 'content',
                text: {
                  fontSizeRange: { minSize: 12, maxSize: 16 },
                  color: '{{theme.fontColor}}',
                  fontFamily: '{{theme.fontName}}',
                  textAlign: 'center',
                },
              },
            ],
          },
        },
      },
    },
  },
  graphics: [
    {
      type: 'zigzagTimeline',
      containerId: 'content',
      thickness: 3,
    },
  ],
};

// Export all templates
export const timelineTemplates: Template[] = [
  straightTimelineTemplate,
  alternatingTimelineTemplate,
  zigZagTimelineTemplate,
];
