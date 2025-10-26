<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        class="tw-fixed tw-inset-0 tw-z-[5000] tw-flex tw-items-center tw-justify-center tw-border-0 tw-outline-0"
        ref="modalRef"
        v-show="visible"
        tabindex="-1"
        aria-modal="true"
        role="dialog"
        @keyup.esc="onEsc()"
      >
        <div class="tw-absolute tw-inset-0 tw-bg-black/40" @click="onClickMask()"></div>
        <Transition
          name="modal-zoom"
          @afterLeave="contentVisible = false"
          @before-enter="contentVisible = true"
        >
          <div
            class="tw-relative tw-z-[5001] tw-overflow-hidden tw-rounded-[var(--presentation-radius)] tw-bg-[var(--presentation-background)] tw-p-5 tw-shadow-sm"
            v-show="visible"
            :style="contentStyle"
          >
            <span
              class="tw-absolute tw-right-4 tw-top-4 tw-flex tw-h-5 tw-w-5 tw-cursor-pointer tw-items-center tw-justify-center"
              v-if="closeButton"
              @click="close()"
              ><IconClose
            /></span>
            <slot v-if="contentVisible"></slot>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, watch, type CSSProperties } from 'vue';
import { icons } from '@/plugins/icon';

const { IconClose } = icons;

const props = withDefaults(
  defineProps<{
    visible: boolean;
    width?: number;
    closeButton?: boolean;
    closeOnClickMask?: boolean;
    closeOnEsc?: boolean;
    contentStyle?: CSSProperties;
  }>(),
  {
    width: 480,
    closeButton: false,
    closeOnClickMask: true,
    closeOnEsc: true,
  }
);

const modalRef = ref<HTMLDivElement>();

const emit = defineEmits<{
  (event: 'update:visible', payload: boolean): void;
  (event: 'closed'): void;
}>();

const contentVisible = ref(false);

const contentStyle = computed(() => {
  return {
    width: props.width + 'px',
    ...(props.contentStyle || {}),
  };
});

watch(
  () => props.visible,
  () => {
    if (props.visible) {
      nextTick(() => modalRef.value!.focus());
    }
  }
);

const close = () => {
  emit('update:visible', false);
  emit('closed');
};

const onEsc = () => {
  if (props.visible && props.closeOnEsc) close();
};

const onClickMask = () => {
  if (props.closeOnClickMask) close();
};
</script>

<style lang="scss" scoped>
.modal-fade-enter-active {
  animation: modal-fade-enter 0.25s both ease-in;
}

.modal-fade-leave-active {
  animation: modal-fade-leave 0.25s both ease-out;
}

.modal-zoom-enter-active {
  animation: modal-zoom-enter 0.25s both cubic-bezier(0.4, 0, 0, 1.5);
}

.modal-zoom-leave-active {
  animation: modal-zoom-leave 0.25s both;
}

@keyframes modal-fade-enter {
  from {
    opacity: 0;
  }
}

@keyframes modal-fade-leave {
  to {
    opacity: 0;
  }
}

@keyframes modal-zoom-enter {
  from {
    transform: scale3d(0.3, 0.3, 0.3);
  }
}

@keyframes modal-zoom-leave {
  to {
    transform: scale3d(0.3, 0.3, 0.3);
  }
}
</style>
