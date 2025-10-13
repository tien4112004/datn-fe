import type { Template } from '../../types';

export const twoColumnWithImageTemplates: Template[] = [
  {
    id: 'two-column-with-image',
    name: 'Two Column with Image',
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
        image: {
          type: 'image',
          bounds: {
            width: 400,
            height: 300,
            left: {
              expr: '15 + ((SLIDE_WIDTH - 30) / 2 - 400) / 2',
            },
            top: {
              expr: 'after',
              relativeTo: 'title',
              offset: 20,
            },
          },
        },
        content: {
          type: 'block',
          bounds: {
            left: {
              expr: '15 + (SLIDE_WIDTH - 30) / 2',
            },
            top: {
              expr: 'image.top',
            },
            width: {
              expr: '(SLIDE_WIDTH - 30) / 2',
            },
            height: {
              expr: 'SLIDE_HEIGHT - image.top - 40',
            },
          },
          layout: {
            distribution: 'space-between',
            gap: 20,
            horizontalAlignment: 'center',
            verticalAlignment: 'top',
            orientation: 'vertical',
          },
          childTemplate: {
            count: 'auto',
            structure: {
              type: 'text',
              label: 'item',
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
              },
            },
          },
        },
      },
    },
  },
  {
    id: 'two-column-left-big-image',
    name: 'Two Column - Left Big Image',
    config: {
      containers: {
        image: {
          type: 'image',
          bounds: {
            left: 0,
            top: 0,
            width: {
              expr: 'SLIDE_WIDTH * 0.4',
            },
            height: {
              expr: 'SLIDE_HEIGHT',
            },
          },
          border: {
            width: 0,
            color: 'transparent',
            radius: 0,
          },
        },
        title: {
          type: 'text',
          bounds: {
            left: {
              expr: 'image.width + 30',
            },
            top: 20,
            width: {
              expr: 'SLIDE_WIDTH - image.width - 60',
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
            margin: { left: 0, right: 0, top: 0, bottom: 40 },
          },
          layout: {
            distribution: 'space-between',
            gap: 18,
            horizontalAlignment: 'left',
            verticalAlignment: 'top',
            orientation: 'vertical',
          },
          childTemplate: {
            count: 'auto',
            structure: {
              type: 'text',
              label: 'item',
              layout: {
                horizontalAlignment: 'left',
                verticalAlignment: 'center',
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
              },
            },
          },
        },
      },
    },
  },
  {
    id: 'two-column-right-big-image',
    name: 'Two Column - Right Big Image',
    config: {
      containers: {
        image: {
          type: 'image',
          bounds: {
            left: {
              expr: 'SLIDE_WIDTH * 0.6',
            },
            top: 0,
            width: {
              expr: 'SLIDE_WIDTH * 0.4',
            },
            height: {
              expr: 'SLIDE_HEIGHT',
            },
          },
          border: {
            width: 0,
            color: 'transparent',
            radius: 0,
          },
        },
        title: {
          type: 'text',
          bounds: {
            left: 30,
            top: 20,
            width: {
              expr: 'SLIDE_WIDTH * 0.6 - 60',
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
            margin: { left: 0, right: 0, top: 0, bottom: 40 },
          },
          layout: {
            distribution: 'space-between',
            gap: 18,
            horizontalAlignment: 'left',
            verticalAlignment: 'top',
            orientation: 'vertical',
          },
          childTemplate: {
            count: 'auto',
            structure: {
              type: 'text',
              label: 'item',
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
              },
            },
          },
        },
      },
    },
  },
  {
    id: 'two-column-right-image',
    name: 'Two Column - Right Image',
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
            textAlign: 'center',
          },
        },
        content: {
          type: 'block',
          bounds: {
            left: 30,
            top: {
              expr: 'title.top + title.height + 20',
            },
            width: {
              expr: '(SLIDE_WIDTH - 60) * 0.5',
            },
            height: {
              expr: 'SLIDE_HEIGHT - title.top - title.height - 60',
            },
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
            structure: {
              type: 'text',
              label: 'item',
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
              },
            },
          },
        },
        image: {
          type: 'image',
          bounds: {
            width: {
              expr: '(SLIDE_WIDTH - 60) * 0.45',
            },
            height: {
              expr: '(SLIDE_HEIGHT - title.top - title.height - 60) * 0.8',
            },
            left: {
              expr: 'content.left + content.width + 40',
            },
            top: {
              expr: 'content.top + (SLIDE_HEIGHT - title.top - title.height - 60) * 0.1',
            },
          },

          shadow: {
            h: '{{theme.card.shadow.h}}',
            v: '{{theme.card.shadow.v}}',
            blur: '{{theme.card.shadow.blur}}',
            color: '{{theme.card.shadow.color}}',
          },
        },
      },
    },
  },
  {
    id: 'two-column-with-image-container-border',
    name: 'Two Column with Image - Container Border',
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
            textAlign: 'center',
          },
        },
        image: {
          type: 'image',
          bounds: {
            width: 360,
            height: 300,
            left: {
              expr: '15 + ((SLIDE_WIDTH - 30) / 2 - 360) / 2',
            },
            top: {
              expr: 'after',
              relativeTo: 'title',
              offset: 20,
            },
          },
          shadow: {
            h: '{{theme.card.shadow.h}}',
            v: '{{theme.card.shadow.v}}',
            blur: '{{theme.card.shadow.blur}}',
            color: '{{theme.card.shadow.color}}',
          },
        },
        content: {
          type: 'block',
          bounds: {
            left: {
              expr: '15 + (SLIDE_WIDTH - 30) / 2',
            },
            top: {
              expr: 'image.top',
            },
            width: {
              expr: '(SLIDE_WIDTH - 30) / 2 - 30',
            },
            height: {
              expr: 'SLIDE_HEIGHT - image.top - 50',
            },
          },
          border: {
            width: '{{theme.card.borderWidth}}',
            color: '{{theme.themeColors[0]}}',
            radius: '{{theme.card.borderRadius}}',
          },
          layout: {
            distribution: 'space-between',
            gap: 15,
            horizontalAlignment: 'center',
            verticalAlignment: 'top',
            orientation: 'vertical',
          },
          childTemplate: {
            count: 'auto',
            structure: {
              type: 'text',
              label: 'item',
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
  },
  {
    id: 'two-column-left-big-image-container-border',
    name: 'Two Column - Left Big Image Container Border',
    config: {
      containers: {
        image: {
          type: 'image',
          bounds: {
            left: 0,
            top: 0,
            width: {
              expr: 'SLIDE_WIDTH * 0.4',
            },
            height: {
              expr: 'SLIDE_HEIGHT',
            },
          },
          border: {
            width: 0,
            color: 'transparent',
            radius: 0,
          },
        },
        title: {
          type: 'text',
          bounds: {
            left: {
              expr: 'image.width + 30',
            },
            top: 20,
            width: {
              expr: 'SLIDE_WIDTH - image.width - 60',
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
            margin: { left: 0, right: 0, top: 0, bottom: 40 },
          },
          border: {
            width: '{{theme.card.borderWidth}}',
            color: '{{theme.themeColors[0]}}',
            radius: '{{theme.card.borderRadius}}',
          },
          layout: {
            distribution: 'space-between',
            gap: 15,
            horizontalAlignment: 'left',
            verticalAlignment: 'top',
            orientation: 'vertical',
          },
          childTemplate: {
            count: 'auto',
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
  },
  {
    id: 'two-column-right-big-image-container-border',
    name: 'Two Column - Right Big Image Container Border',
    config: {
      containers: {
        image: {
          type: 'image',
          bounds: {
            left: {
              expr: 'SLIDE_WIDTH * 0.6',
            },
            top: 0,
            width: {
              expr: 'SLIDE_WIDTH * 0.4',
            },
            height: {
              expr: 'SLIDE_HEIGHT',
            },
          },
        },
        title: {
          type: 'text',
          bounds: {
            left: 30,
            top: 20,
            width: {
              expr: 'SLIDE_WIDTH * 0.6 - 60',
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
            margin: { left: 0, right: 0, top: 0, bottom: 50 },
          },
          shadow: {
            h: '{{theme.card.shadow.h}}',
            v: '{{theme.card.shadow.v}}',
            blur: '{{theme.card.shadow.blur}}',
            color: '{{theme.card.shadow.color}}',
          },
          border: {
            width: 0,
            color: 'transparent',
            radius: '{{theme.card.borderRadius}}',
          },
          background: {
            color: '{{theme.card.backgroundColor}}',
          },
          layout: {
            distribution: 'space-between',
            gap: 15,
            horizontalAlignment: 'left',
            verticalAlignment: 'top',
            orientation: 'vertical',
          },
          childTemplate: {
            count: 'auto',
            structure: {
              type: 'text',
              label: 'item',
              text: {
                color: '{{theme.card.textColor}}',
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
  },
];
