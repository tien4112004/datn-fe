<template>
  <div class="link-handler" :style="{ top: height * canvasScale + 10 + 'px' }">
    <a class="link" v-if="link.type === 'web'" :href="link.target" target="_blank">{{ link.target }}</a>
    <a class="link" v-else @click="turnTarget(link.target)"
      >{{ $t('canvas.linkHandler.slidePage') }} {{ link.target }}</a
    >
    <div class="btns">
      <div class="btn" @click="openLinkDialog()">{{ $t('canvas.linkHandler.replace') }}</div>
      <Divider type="vertical" />
      <div class="btn" @click="removeLink(elementInfo)">{{ $t('canvas.linkHandler.remove') }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useMainStore, useSlidesStore } from '@/store';
import type { PPTElement, PPTElementLink } from '@/types/slides';
import useLink from '@/hooks/useLink';
import Divider from '@/components/Divider.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
  elementInfo: PPTElement;
  link: PPTElementLink;
  openLinkDialog: () => void;
}>();

const mainStore = useMainStore();
const slidesStore = useSlidesStore();
const { canvasScale } = storeToRefs(mainStore);
const { slides } = storeToRefs(slidesStore);
const { removeLink } = useLink();
const height = computed(() => (props.elementInfo.type === 'line' ? 0 : props.elementInfo.height));

const turnTarget = (slideId: string) => {
  const targetIndex = slides.value.findIndex((item) => item.id === slideId);
  if (targetIndex !== -1) {
    mainStore.setActiveElementIdList([]);
    slidesStore.updateSlideIndex(targetIndex);
  }
};
</script>

<style lang="scss" scoped>
.link-handler {
  height: 30px;
  position: absolute;
  left: 0;
  font-size: 12px;
  padding: 0 10px;
  background-color: var(--presentation-background);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -2px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  color: var(--presentation-primary);
}
.link {
  max-width: 300px;
  margin-right: 20px;
  word-break: keep-all;
  white-space: nowrap;
  cursor: pointer;

  @include ellipsis-oneline();
}
.btns {
  display: flex;
  align-items: center;

  .btn {
    word-break: keep-all;
    cursor: pointer;
  }
}
</style>
