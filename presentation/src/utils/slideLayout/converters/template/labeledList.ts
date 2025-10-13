import type { Template } from '../../types';

export const labeledListLayoutTemplate: Template = {
  id: 'horizontal-list-default',
  name: 'Horizontal List - Default',
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
};

// Variation: Horizontal List - Grid (2x2, 2x3 layout)
export const labeledListGridTemplate: Template = {
  id: 'horizontal-list-grid',
  name: 'Horizontal List - Grid',
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
          offset: 20,
          size: 'fill',
          margin: { left: 40, right: 40, top: 0, bottom: 40 },
        },
        layout: {
          distribution: 'space-around',
          gap: 20,
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
};

// Variation: Horizontal List - Single Row (no wrapping)
export const labeledListSingleRowTemplate: Template = {
  id: 'horizontal-list-single-row',
  name: 'Horizontal List - Single Row',
  config: {
    containers: {
      title: {
        type: 'text',
        bounds: {
          left: 15,
          top: 15,
          width: { expr: 'SLIDE_WIDTH - 30' },
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
};

// Variation: Horizontal List - Numbered (auto-generated sequential labels)
export const labeledListNumberedTemplate: Template = {
  id: 'horizontal-list-numbered',
  name: 'Horizontal List - Numbered',
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
            maxItemsPerLine: 5,
            lineCount: 2,
            wrapDistribution: 'balanced',
            lineSpacing: 15,
            alternating: { start: 20, end: 20 },
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
              color: '{{theme.themeColors[0]}}',
              radius: '{{theme.card.borderRadius}}',
            },
            children: [
              {
                type: 'text',
                id: 'label',
                layout: {
                  horizontalAlignment: 'center',
                  verticalAlignment: 'center',
                },
                label: 'label',
                numbering: true, // Enable auto-numbering
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
                id: 'content',
                layout: {
                  horizontalAlignment: 'center',
                  verticalAlignment: 'center',
                },
                label: 'content',
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
};

// Variation: Horizontal List - Container Border
export const horizontalListContainerBorderTemplate: Template = {
  id: 'horizontal-list-container-border',
  name: 'Horizontal List - Container Border',
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
};

// Variation: Horizontal List - Container Border Shadow
export const horizontalListNoBorderTemplate: Template = {
  id: 'horizontal-list-container-border-shadow',
  name: 'Horizontal List - Container Border Shadow',
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
          offset: 20,
          size: 'fill',
          margin: { left: 40, right: 40, top: 0, bottom: 50 },
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
                  color: '{{theme.card.textColor}}',
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
};
