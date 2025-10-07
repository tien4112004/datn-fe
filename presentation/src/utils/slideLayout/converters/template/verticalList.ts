import type { Template } from '../../types';

export const verticalListLayoutTemplate: Template = {
  id: 'vertical-list-default',
  name: 'Vertical List - Default',
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
            maxItemsPerLine: 3,
            lineCount: 3,
            wrapDistribution: 'balanced',
            lineSpacing: 20,
            alternating: false,
          },
          structure: {
            type: 'text',
            label: 'item',
            layout: {
              horizontalAlignment: 'left',
              verticalAlignment: 'center',
            },
            border: {
              width: 1,
              color: '{{theme.themeColors[0]}}',
            },
            text: {
              color: '{{theme.fontColor}}',
              fontFamily: '{{theme.fontName}}',
              fontWeight: 'normal',
              fontStyle: 'normal',
              textAlign: 'left',
            },
          },
        },
      },
    },
  },
};

// Variation: Vertical List - Compact (no borders, tighter spacing)
export const verticalListCompactTemplate: Template = {
  id: 'vertical-list-compact',
  name: 'Vertical List - Compact',
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
          margin: { left: 80, right: 80, top: 0, bottom: 40 },
        },
        layout: {
          distribution: 'space-between',
          gap: 12,
          verticalAlignment: 'top',
          orientation: 'vertical',
        },
        childTemplate: {
          count: 'auto',
          wrap: {
            enabled: false,
          },
          structure: {
            type: 'text',
            label: 'item',
            layout: {
              horizontalAlignment: 'left',
              verticalAlignment: 'center',
            },
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
};

// Variation: Vertical List - Cards (larger borders, shadow effect)
export const verticalListCardsTemplate: Template = {
  id: 'vertical-list-cards',
  name: 'Vertical List - Cards',
  config: {
    containers: {
      title: {
        type: 'text',
        bounds: {
          left: 0,
          top: 20,
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
            maxItemsPerLine: 3,
            lineCount: 'auto',
            wrapDistribution: 'balanced',
            lineSpacing: 20,
            alternating: false,
          },
          structure: {
            type: 'text',
            label: 'item',
            layout: {
              horizontalAlignment: 'center',
              verticalAlignment: 'center',
            },
            border: {
              width: 2,
              color: '{{theme.themeColors[0]}}',
              radius: 12,
            },
            shadow: {
              h: 0,
              v: 4,
              blur: 8,
              color: 'rgba(0,0,0,0.1)',
            },
            text: {
              color: '{{theme.fontColor}}',
              fontFamily: '{{theme.fontName}}',
              fontWeight: 'normal',
              textAlign: 'center',
            },
          },
        },
      },
    },
  },
};

// Variation: Vertical List - Numbered (with bullet numbering)
export const verticalListNumberedTemplate: Template = {
  id: 'vertical-list-numbered',
  name: 'Vertical List - Numbered',
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
          margin: { left: 80, right: 80, top: 0, bottom: 40 },
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
            enabled: false,
          },
          structure: {
            type: 'text',
            label: 'item',
            layout: {
              horizontalAlignment: 'left',
              verticalAlignment: 'center',
            },
            border: {
              width: 1.5,
              color: '{{theme.themeColors[0]}}',
              radius: 8,
            },
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
};
