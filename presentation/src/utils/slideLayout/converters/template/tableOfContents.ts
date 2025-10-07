import type { Template } from '../../types';

export const tableOfContentsLayoutTemplate: Template = {
  id: 'table-of-contents-default',
  name: 'Table of Contents - Default',
  config: {
    containers: {
      title: {
        type: 'text',
        bounds: {
          left: 15,
          top: 15,
          width: {
            expr: 'SLIDE_WIDTH - 30',
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
            alternating: false,
          },
          structure: {
            type: 'text',
            label: 'item',
            layout: {
              horizontalAlignment: 'left',
              verticalAlignment: 'top',
            },
            text: {
              color: '{{theme.fontColor}}',
              fontFamily: '{{theme.fontName}}',
              fontWeight: 'normal',
              fontStyle: 'normal',
            },
          },
        },
      },
    },
  },
};

// Variation: Grid layout (equal-sized boxes in a grid)
export const tableOfContentsGridTemplate: Template = {
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
              radius: 10,
            },
            background: {
              color: 'rgba({{theme.themeColors[0]}}, 0.05)',
            },
            text: {
              color: '{{theme.fontColor}}',
              fontFamily: '{{theme.fontName}}',
              fontWeight: 'normal',
              fontStyle: 'normal',
              textAlign: 'center',
            },
          },
        },
      },
    },
  },
};

// Variation: Two-column layout
export const tableOfContentsTwoColumnTemplate: Template = {
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
          orientation: 'vertical',
        },
        childTemplate: {
          count: 'auto',
          wrap: {
            enabled: true,
            maxItemsPerLine: 2,
            lineCount: 'auto',
            wrapDistribution: 'balanced',
            lineSpacing: 25,
            alternating: false,
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
              fontStyle: 'normal',
              textAlign: 'left',
            },
          },
        },
      },
    },
  },
};

// Variation: Numbered list
export const tableOfContentsNumberedTemplate: Template = {
  id: 'table-of-contents-numbered',
  name: 'Table of Contents - Numbered',
  config: {
    containers: {
      title: {
        type: 'text',
        bounds: {
          left: 15,
          top: 20,
          width: {
            expr: 'SLIDE_WIDTH - 30',
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
          offset: 20,
          size: 'fill',
          margin: { left: 100, right: 100, top: 0, bottom: 40 },
        },
        layout: {
          distribution: 'space-around',
          gap: 15,
          horizontalAlignment: 'left',
          verticalAlignment: 'center',
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
              width: 1,
              color: '{{theme.themeColors[0]}}',
              radius: 6,
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
