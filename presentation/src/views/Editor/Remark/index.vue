<template>
  <div class="remark">
    <div class="resize-handler" @mousedown="($event) => resize($event)">
      <div class="resize-indicator">
        <div class="resize-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
    <Editor :value="remark" ref="editorRef" @update="(value) => handleInput(value)" />
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useSlidesStore } from '@/store';

import Editor from './Editor.vue';

const props = defineProps<{
  height: number;
}>();

const emit = defineEmits<{
  (event: 'update:height', payload: number): void;
}>();

const slidesStore = useSlidesStore();
const { currentSlide } = storeToRefs(slidesStore);

const editorRef = ref<InstanceType<typeof Editor>>();
watch(
  () => currentSlide.value.id,
  () => {
    nextTick(() => {
      editorRef.value!.updateTextContent();
    });
  },
  {
    immediate: true,
  }
);

const remark = computed(() => currentSlide.value?.remark || '');

const handleInput = (content: string) => {
  slidesStore.updateSlide({ remark: content });
};

const resize = (e: MouseEvent) => {
  let isMouseDown = true;
  const startPageY = e.pageY;
  const originHeight = props.height;

  document.onmousemove = (e) => {
    if (!isMouseDown) return;

    const currentPageY = e.pageY;

    const moveY = currentPageY - startPageY;
    let newHeight = -moveY + originHeight;

    if (newHeight < 40) newHeight = 40;
    if (newHeight > 360) newHeight = 360;

    emit('update:height', newHeight);
  };

  document.onmouseup = () => {
    isMouseDown = false;
    document.onmousemove = null;
    document.onmouseup = null;
  };
};
</script>

<style lang="scss" scoped>
.remark {
  position: relative;
  border-top: 1px solid $borderColor;
}

.resize-handler {
  height: 12px;
  position: absolute;
  top: -6px;
  left: 0;
  right: 0;
  cursor: n-resize;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;

  &:hover {
    .resize-indicator {
      opacity: 1;
      transform: scale(1.1);
    }
  }
}

.resize-indicator {
  padding: 2px 8px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  opacity: 0.6;
  transition: all 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.1);

  .resize-dots {
    display: flex;
    gap: 2px;
    align-items: center;

    span {
      width: 3px;
      height: 3px;
      background: rgba(0, 0, 0, 0.4);
      border-radius: 50%;
      display: block;
      transition: background 0.2s ease;
    }
  }
}

.resize-handler:hover {
  .resize-indicator {
    background: rgba(0, 0, 0, 0.08);
    border-color: rgba(0, 0, 0, 0.15);

    .resize-dots span {
      background: rgba(0, 0, 0, 0.6);
    }
  }
}

.resize-handler:active {
  .resize-indicator {
    background: rgba(0, 0, 0, 0.12);
    transform: scale(1.05);

    .resize-dots span {
      background: rgba(0, 0, 0, 0.8);
    }
  }
}
</style>
