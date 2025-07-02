## Canvas and Elements

#### Basic Structure of the Editor

```

└── Editor
├── Top Menu Bar
├── Left Navigation Bar
├── Right Sidebar
├── Upper Insert/Toolbar
├── Bottom Speaker Notes
└── Canvas
├── Viewport
│ ├── Editable Elements
│ └── Mouse Selection Box
│
└── Canvas Tools
├── Guide Lines
├── Rulers
├── Element Control Handles (e.g., drag/resize points)
├── Snap Alignment Lines
└── Viewport Background

```

#### Core Principles of the Canvas

We’ll focus on the relatively complex **Canvas** part. Each element on the canvas is described by a set of data, for example:

```typescript
interface PPTBaseElement {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
}
```

As the names imply, `left` is the element’s distance from the canvas’s top-left corner; `width` is its width; and so on.

The key thing to know is that the viewport defaults to a base ratio of 1000 px wide by 562.5 px tall. No matter the actual size of the canvas or viewport, an element defined as `{ width: 1000px, height: 562.5px, left: 0, top: 0 }` will always exactly fill the viewport.

The implementation is straightforward: if the viewport’s actual width is, say, 1200 px, you compute a scale factor of 1200 / 1000 = 1.2, then render all elements at 1.2× their base size. Likewise, the **thumbnail view** and the **presentation view** are simply viewports at different actual sizes.

#### Element Data on the Canvas

Beyond position and size, elements can carry additional properties. For example, a text element might be defined as:

```typescript
interface PPTTextElement {
  type: 'text';
  id: string;
  left: number;
  top: number;
  lock?: boolean;
  groupId?: string;
  width: number;
  height: number;
  link?: string;
  content: string;
  rotate: number;
  defaultFontName: string;
  defaultColor: string;
  outline?: PPTElementOutline;
  fill?: string;
  lineHeight?: number;
  wordSpace?: number;
  opacity?: number;
  shadow?: PPTElementShadow;
}
```

You can use `rotate` to indicate the text box’s rotation angle, `opacity` for its transparency level, and so on. In practice, rendering the element component simply reads these data fields, and editing an element is just modifying them.

That covers the fundamental composition of the canvas.
