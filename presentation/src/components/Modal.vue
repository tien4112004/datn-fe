<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        class="tw-fixed tw-inset-0 tw-z-[10000] tw-flex tw-items-center tw-justify-center"
        ref="modalRef"
        v-show="visible"
        tabindex="-1"
        aria-modal="true"
        role="dialog"
        @keyup.esc="onEsc()"
      >
        <div class="tw-absolute tw-inset-0 tw-bg-black/50" @click="onClickMask()"></div>
        <Transition
          name="modal-zoom"
          @afterLeave="contentVisible = false"
          @before-enter="contentVisible = true"
        >
          <div
            class="tw-relative tw-z-[10001] tw-overflow-hidden tw-rounded tw-bg-background tw-p-6 tw-shadow-lg tw-duration-200"
            v-show="visible"
            :style="contentStyle"
          >
            <span
              class="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground tw-absolute tw-right-4 tw-top-4 tw-flex tw-h-5 tw-w-5 tw-cursor-pointer tw-items-center tw-justify-center tw-rounded-xs tw-opacity-70 tw-transition-opacity hover:tw-opacity-100 focus:tw-outline-hidden focus:tw-ring-2 focus:tw-ring-offset-2 disabled:tw-pointer-events-none"
              v-if="closeButton"
              @click="close()"
            >
              <IconClose class="tw-size-4" />
            </span>
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
