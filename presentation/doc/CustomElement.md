````markdown
## How to Create a Custom Element

Let’s use the **Web Page Element** as an example to walk through the process of adding a new element type.

> Full source code is at: https://github.com/pipipi-pikachu/PPTist/tree/document-demo  
> **Note:** Due to version changes, the code in this doc and the repo may not run out-of-the-box; this is intended to illustrate the approach.

---

### 1. Define the Element’s Data Structure and Register Its Type

First, add the new element type and its interface in your slide-types file:

```typescript
// types/slides.ts

export const enum ElementTypes {
  TEXT = 'text',
  IMAGE = 'image',
  SHAPE = 'shape',
  LINE = 'line',
  CHART = 'chart',
  TABLE = 'table',
  LATEX = 'latex',
  VIDEO = 'video',
  AUDIO = 'audio',
  FRAME = 'frame', // new
}

// Define the new element’s shape
export interface PPTFrameElement extends PPTBaseElement {
  type: 'frame';
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
  url: string; // the webpage URL
}

// Add it to the union of all element types
export type PPTElement =
  | PPTTextElement
  | PPTImageElement
  | PPTShapeElement
  | PPTLineElement
  | PPTChartElement
  | PPTTableElement
  | PPTLatexElement
  | PPTVideoElement
  | PPTAudioElement
  | PPTFrameElement;
```
````

Next, in your element-config files, add its display name and minimum size:

```typescript
// configs/element

export const ELEMENT_TYPE_ZH = {
  text: '文本',
  image: '图片',
  shape: '形状',
  line: '线条',
  chart: '图表',
  table: '表格',
  video: '视频',
  audio: '音频',
  frame: '网页', // new
};

export const MIN_SIZE = {
  text: 20,
  image: 20,
  shape: 15,
  chart: 200,
  table: 20,
  video: 250,
  audio: 20,
  frame: 200, // new
};
```

---

### 2. Build the Vue Component for the New Element

Create the editable version of your Frame element:

```html
<!-- src/views/components/element/FrameElement/index.vue -->

<template>
  <div
    class="editable-element-frame"
    :style="{
      top: elementInfo.top + 'px',
      left: elementInfo.left + 'px',
      width: elementInfo.width + 'px',
      height: elementInfo.height + 'px'
    }"
  >
    <div class="rotate-wrapper" :style="{ transform: `rotate(${elementInfo.rotate}deg)` }">
      <div
        class="element-content"
        v-contextmenu="contextmenus"
        @mousedown="e => handleSelect(e)"
        @touchstart="e => handleSelect(e)"
      >
        <iframe
          :src="elementInfo.url"
          :width="elementInfo.width"
          :height="elementInfo.height"
          frameborder="0"
          allowfullscreen
        ></iframe>

        <!-- Resize/drag handles -->
        <div class="drag-handler top"></div>
        <div class="drag-handler bottom"></div>
        <div class="drag-handler left"></div>
        <div class="drag-handler right"></div>

        <!-- Transparent mask when not selected -->
        <div
          class="mask"
          v-if="currentElementId !== elementInfo.id"
          @mousedown="e => handleSelect(e, false)"
          @touchstart="e => handleSelect(e, false)"
        ></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { PropType } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useMainStore } from '@/store';
  import { PPTFrameElement } from '@/types/slides';
  import type { ContextmenuItem } from '@/components/Contextmenu/types';

  const props = defineProps<{
    elementInfo: PPTFrameElement;
    selectElement: (e: MouseEvent | TouchEvent, el: PPTFrameElement, movable?: boolean) => void;
    contextmenus?: () => ContextmenuItem[] | null;
  }>();

  const { currentElementId } = storeToRefs(useMainStore());

  function handleSelect(e: MouseEvent | TouchEvent, movable = true) {
    e.stopPropagation();
    props.selectElement(e, props.elementInfo, movable);
  }
</script>

<style scoped lang="scss">
  .editable-element-frame {
    position: absolute;
  }
  .element-content {
    width: 100%;
    height: 100%;
    cursor: move;
  }
  .drag-handler {
    position: absolute;
    &.top {
      height: 20px;
      left: 0;
      right: 0;
      top: 0;
    }
    &.bottom {
      height: 20px;
      left: 0;
      right: 0;
      bottom: 0;
    }
    &.left {
      width: 20px;
      top: 0;
      bottom: 0;
      left: 0;
    }
    &.right {
      width: 20px;
      top: 0;
      bottom: 0;
      right: 0;
    }
  }
  .mask {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }
</style>
```

You’ll also need a simpler, non-editable version—for thumbnails and presentation mode:

```html
<!-- src/views/components/element/FrameElement/BaseFrameElement.vue -->

<template>
  <div
    class="base-element-frame"
    :style="{
      top: elementInfo.top + 'px',
      left: elementInfo.left + 'px',
      width: elementInfo.width + 'px',
      height: elementInfo.height + 'px'
    }"
  >
    <div class="rotate-wrapper" :style="{ transform: `rotate(${elementInfo.rotate}deg)` }">
      <iframe
        :src="elementInfo.url"
        :width="elementInfo.width"
        :height="elementInfo.height"
        frameborder="0"
        allowfullscreen
      ></iframe>
      <div class="mask"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { PropType } from 'vue';
  import { PPTFrameElement } from '@/types/slides';

  const props = defineProps<{ elementInfo: PPTFrameElement }>();
</script>

<style scoped lang="scss">
  .base-element-frame {
    position: absolute;
  }
  .element-content {
    width: 100%;
    height: 100%;
  }
  .mask {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }
</style>
```

> **Tip:** For simple elements, the editable and base versions look almost identical. For complex ones, they can differ significantly—so tailor your approach as needed.

---

### 3. Integrate the Component into Your Editor

Import and map the new component in your editable-element loader:

```html
<!-- src/views/Editor/Canvas/EditableElement.vue -->

<script lang="ts" setup>
  import FrameElement from '@/views/components/element/FrameElement/index.vue';
  // ...other imports...

  const componentMap = {
    [ElementTypes.IMAGE]: ImageElement,
    [ElementTypes.TEXT]: TextElement,
    // ...
    [ElementTypes.FRAME]: FrameElement, // new
  };

  const currentComponent = computed(() => componentMap[props.elementInfo.type] || null);
</script>
```

And ensure your “operate” (resize/rotate) controls include it:

```html
<!-- src/views/Editor/Canvas/Operate/index.vue -->

<script lang="ts" setup>
  const operateMap = {
    [ElementTypes.IMAGE]: ImageOperate,
    [ElementTypes.TEXT]: TextOperate,
    // ...
    [ElementTypes.FRAME]: CommonElementOperate, // new
  };

  const OperateComponent = computed(() => operateMap[props.elementInfo.type] || null);
</script>
```

---

### 4. Add a Style Panel for the New Element

In your sidebar toolbar, include a panel so users can edit the frame’s URL:

```html
<!-- src/views/Editor/Toolbar/ElementStylePanel/FrameStylePanel.vue -->

<template>
  <div class="frame-style-panel">
    <div class="row">
      <label>Webpage URL:</label>
      <input v-model:value="url" placeholder="Enter URL" />
      <button @click="applyUrl">Apply</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useMainStore, useSlidesStore } from '@/store';
  import useHistorySnapshot from '@/hooks/useHistorySnapshot';

  const url = ref('');
  const { currentElementId } = storeToRefs(useMainStore());
  const slidesStore = useSlidesStore();
  const { addHistorySnapshot } = useHistorySnapshot();

  function applyUrl() {
    if (!currentElementId.value) return;
    slidesStore.updateElement({
      id: currentElementId.value,
      props: { url: url.value },
    });
    addHistorySnapshot();
  }
</script>
```

And register it alongside other panels:

```html
<script lang="ts" setup>
  import FrameStylePanel from './FrameStylePanel.vue';
  // ...other imports...

  const stylePanelMap = {
    [ElementTypes.TEXT]: TextStylePanel,
    // ...
    [ElementTypes.FRAME]: FrameStylePanel, // new
  };
</script>
```

---

### 5. Provide a Creation Method

Implement a helper to spawn a new frame element:

```typescript
// src/hooks/useCreateElement.ts

export function useCreateElement() {
  // ...
  function createFrameElement(url: string) {
    createElement({
      type: 'frame',
      id: nanoid(10),
      width: 800,
      height: 480,
      rotate: 0,
      left: (VIEWPORT_SIZE - 800) / 2,
      top: (VIEWPORT_SIZE * viewportRatio.value - 480) / 2,
      url,
    });
  }

  return {
    // ...other creators...
    createFrameElement,
  };
}
```

Then add an “Insert Web Page” button to your canvas toolbar:

```html
<!-- src/views/Editor/CanvasTool/index.vue -->

<template>
  <div class="canvas-tool">
    <span class="handler-item" @click="createFrameElement('https://v3.cn.vuejs.org/')">
      Insert Web Page
    </span>
    <!-- ...other handlers... -->
  </div>
</template>

<script lang="ts" setup>
  const { createFrameElement } = useCreateElement();
</script>
```

Clicking “Insert Web Page” will place your custom frame element onto the canvas.

---

## Summary

That completes the basic process for adding a custom element. The main work lies in defining its data structure and building its Vue components; the rest follows the existing patterns. If you need export support or theme integration for your new element, extend those modules in a similar fashion.
