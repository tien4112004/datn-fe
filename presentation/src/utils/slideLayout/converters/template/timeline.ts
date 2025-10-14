import type { Template } from '../../types';
import type { StraightTimeline, AlternatingTimeline, WrappingTimeline } from '../../graphics/types';

const straightTimelineTemplate: Template = {
  id: 'timeline-straight',
  name: 'Timeline - Straight',
  config: {
    containers: {
      title: {
        type: 'text',
        bounds: {
          left: 0,
          top: 15,
          width: { expr: 'SLIDE_WIDTH' },
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
            lineCount: 'auto',
            wrapDistribution: 'top-heavy',
            lineSpacing: 40,
            syncSize: true,
            snake: true,
            zigzag: true,
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
    } as WrappingTimeline,
  ],
};

/**
 * Template 3: Stepped Timeline
 * Zigzag progression with vertical steps
 */
const steppedTimelineTemplate: Template = {
  id: 'timeline-stepped',
  name: 'Timeline - Stepped',
  config: {
    containers: {
      title: {
        type: 'text',
        bounds: {
          left: 0,
          top: 15,
          width: { expr: 'SLIDE_WIDTH' },
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
          offset: 60,
          size: 'fill',
          margin: { left: 20, right: 20, bottom: 100 },
        },

        layout: {
          orientation: 'horizontal',
          distribution: 'equal',
          gap: 60,
          verticalAlignment: 'center',
        },
        childTemplate: {
          count: 'auto',
          structure: {
            type: 'block',
            layout: {
              orientation: 'vertical',
              gap: 8,
              horizontalAlignment: 'center',
            },
            children: [
              {
                type: 'text',
                label: 'label',
                text: {
                  fontSizeRange: { minSize: 14, maxSize: 18 },
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
                  fontSizeRange: { minSize: 11, maxSize: 15 },
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
      type: 'alternatingTimeline',
      containerId: 'content',
      thickness: 3,
      branchLength: 10,
    } as AlternatingTimeline,
  ],
};

// Export all templates
export const timelineTemplates: Template[] = [straightTimelineTemplate, steppedTimelineTemplate];
