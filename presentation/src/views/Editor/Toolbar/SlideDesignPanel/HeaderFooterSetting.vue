<template>
  <div class="page-number-setting">
    <div class="title">{{ $t('styling.slide.design.headerFooter.title') }}</div>

    <div class="hint">{{ $t('styling.slide.design.headerFooter.placeholderHint') }}</div>

    <div class="setting-row">
      <Checkbox v-model:value="enableHeaderFooter">
        {{ $t('styling.slide.design.headerFooter.enabled') }}
      </Checkbox>
    </div>

    <template v-if="enableHeaderFooter">
      <div class="setting-row">
        <Checkbox v-model:value="skipTitlePage">
          {{ $t('styling.slide.design.headerFooter.skipTitlePage') }}
        </Checkbox>
      </div>

      <datalist id="headerFooterPlaceholderList">
        <option v-for="option in placeholderOptions" :key="option.value" :value="option.value"></option>
      </datalist>

      <div class="header-footer-grid">
        <div class="section">
          <div class="section-title">{{ $t('styling.slide.design.headerFooter.header') }}</div>
          <div class="row">
            <div class="part">
              <div class="part-label">{{ $t('styling.slide.design.headerFooter.left') }}</div>
              <input
                v-model="headerLeft"
                :placeholder="placeholder"
                list="headerFooterPlaceholderList"
                class="tw-h-9 tw-w-full tw-rounded-md tw-border tw-border-gray-300 tw-bg-transparent tw-px-3 tw-text-sm focus-visible:tw-border-blue-500 focus-visible:tw-ring-blue-500/50"
              />
            </div>
            <div class="part">
              <div class="part-label">{{ $t('styling.slide.design.headerFooter.center') }}</div>
              <input
                v-model="headerCenter"
                :placeholder="placeholder"
                list="headerFooterPlaceholderList"
                class="tw-h-9 tw-w-full tw-rounded-md tw-border tw-border-gray-300 tw-bg-transparent tw-px-3 tw-text-sm focus-visible:tw-border-blue-500 focus-visible:tw-ring-blue-500/50"
              />
            </div>
            <div class="part">
              <div class="part-label">{{ $t('styling.slide.design.headerFooter.right') }}</div>
              <input
                v-model="headerRight"
                :placeholder="placeholder"
                list="headerFooterPlaceholderList"
                class="tw-h-9 tw-w-full tw-rounded-md tw-border tw-border-gray-300 tw-bg-transparent tw-px-3 tw-text-sm focus-visible:tw-border-blue-500 focus-visible:tw-ring-blue-500/50"
              />
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">{{ $t('styling.slide.design.headerFooter.footer') }}</div>
          <div class="row">
            <div class="part">
              <div class="part-label">{{ $t('styling.slide.design.headerFooter.left') }}</div>
              <input
                v-model="footerLeft"
                :placeholder="placeholder"
                list="headerFooterPlaceholderList"
                class="tw-h-9 tw-w-full tw-rounded-md tw-border tw-border-gray-300 tw-bg-transparent tw-px-3 tw-text-sm focus-visible:tw-border-blue-500 focus-visible:tw-ring-blue-500/50"
              />
            </div>
            <div class="part">
              <div class="part-label">{{ $t('styling.slide.design.headerFooter.center') }}</div>
              <input
                v-model="footerCenter"
                :placeholder="placeholder"
                list="headerFooterPlaceholderList"
                class="tw-h-9 tw-w-full tw-rounded-md tw-border tw-border-gray-300 tw-bg-transparent tw-px-3 tw-text-sm focus-visible:tw-border-blue-500 focus-visible:tw-ring-blue-500/50"
              />
            </div>
            <div class="part">
              <div class="part-label">{{ $t('styling.slide.design.headerFooter.right') }}</div>
              <input
                v-model="footerRight"
                :placeholder="placeholder"
                list="headerFooterPlaceholderList"
                class="tw-h-9 tw-w-full tw-rounded-md tw-border tw-border-gray-300 tw-bg-transparent tw-px-3 tw-text-sm focus-visible:tw-border-blue-500 focus-visible:tw-ring-blue-500/50"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="preview">
        <div class="preview-header">
          <div class="part left">
            <input class="preview-input" :value="headerPreview.left" readonly />
          </div>
          <div class="part center">
            <input class="preview-input" :value="headerPreview.center" readonly />
          </div>
          <div class="part right">
            <input class="preview-input" :value="headerPreview.right" readonly />
          </div>
        </div>
        <div class="preview-slide">
          <div class="preview-slide-label">{{ $t('styling.slide.design.headerFooter.preview') }}</div>
        </div>
        <div class="preview-footer">
          <div class="part left">
            <input class="preview-input" :value="footerPreview.left" readonly />
          </div>
          <div class="part center">
            <input class="preview-input" :value="footerPreview.center" readonly />
          </div>
          <div class="part right">
            <input class="preview-input" :value="footerPreview.right" readonly />
          </div>
        </div>
      </div>
    </template>

    <Button class="btn" type="primary" @click="applySettings">{{
      $t('styling.slide.design.confirm')
    }}</Button>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useSlidesStore } from '@/store';
import { renderHeaderFooterPlaceholder } from '@/utils/headerFooter';
import { computed, ref, onMounted } from 'vue';
import useHistorySnapshot from '@/hooks/useHistorySnapshot';
import Checkbox from '@/components/Checkbox.vue';
import Button from '@/components/Button.vue';

const emit = defineEmits<{
  (event: 'close'): void;
}>();

const slidesStore = useSlidesStore();
const { headerFooterSettings } = storeToRefs(slidesStore);
const { addHistorySnapshot } = useHistorySnapshot();

const enableHeaderFooter = ref(false);
const skipTitlePage = ref(true);

const headerLeft = ref('');
const headerCenter = ref('');
const headerRight = ref('');
const footerLeft = ref('');
const footerCenter = ref('');
const footerRight = ref('');

const placeholder = '{page}';

const placeholderOptions = [
  { label: '{page}', value: '{page}' },
  { label: '{date}', value: '{date}' },
  { label: '{time}', value: '{time}' },
  { label: '{datetime}', value: '{datetime}' },
];

// Initialize from store settings
onMounted(() => {
  enableHeaderFooter.value = headerFooterSettings.value.enabled;
  skipTitlePage.value = headerFooterSettings.value.skipTitlePage;
  headerLeft.value = headerFooterSettings.value.header.left;
  headerCenter.value = headerFooterSettings.value.header.center;
  headerRight.value = headerFooterSettings.value.header.right;
  footerLeft.value = headerFooterSettings.value.footer.left;
  footerCenter.value = headerFooterSettings.value.footer.center;
  footerRight.value = headerFooterSettings.value.footer.right;
});

const renderPlaceholder = (text: string) => renderHeaderFooterPlaceholder(text, 1); // preview always uses page 1
const headerPreview = computed(() => ({
  left: renderPlaceholder(headerLeft.value),
  center: renderPlaceholder(headerCenter.value),
  right: renderPlaceholder(headerRight.value),
}));

const footerPreview = computed(() => ({
  left: renderPlaceholder(footerLeft.value),
  center: renderPlaceholder(footerCenter.value),
  right: renderPlaceholder(footerRight.value),
}));

const applySettings = () => {
  slidesStore.setHeaderFooterSettings({
    enabled: enableHeaderFooter.value,
    skipTitlePage: skipTitlePage.value,
    header: {
      left: headerLeft.value,
      center: headerCenter.value,
      right: headerRight.value,
    },
    footer: {
      left: footerLeft.value,
      center: footerCenter.value,
      right: footerRight.value,
    },
  });

  addHistorySnapshot();
  emit('close');
};
</script>

<style lang="scss" scoped>
.page-number-setting {
  display: flex;
  flex-direction: column;
}

.title {
  margin-bottom: 15px;
  font-size: 17px;
  font-weight: 700;
}

.subtitle {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
  margin-top: 8px;
}

.setting-row {
  margin-bottom: 12px;
  padding: 10px;
  background-color: color-mix(in srgb, var(--presentation-border) 10%, transparent);
  border-radius: var(--presentation-radius);
}

.position-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 15px;
}

.position-option {
  cursor: pointer;
  padding: 8px;
  border: 2px solid var(--presentation-border);
  border-radius: var(--presentation-radius);
  transition: all 0.2s;
  text-align: center;

  &:hover {
    border-color: var(--presentation-primary);
    background-color: color-mix(in srgb, var(--presentation-primary) 5%, transparent);
  }

  &.selected {
    border-color: var(--presentation-primary);
    background-color: color-mix(in srgb, var(--presentation-primary) 10%, transparent);
  }
}

.position-preview {
  margin-bottom: 6px;
}

.preview-page {
  width: 70px;
  height: 50px;
  margin: 0 auto;
  border: 1px solid var(--presentation-border);
  border-radius: 2px;
  position: relative;
  background-color: var(--presentation-background);
}

.preview-number {
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: var(--presentation-primary);
  border-radius: 2px;
}

.position-label {
  font-size: 12px;
}

.header-footer-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  font-weight: 600;
  margin-bottom: 8px;
}

.hint {
  font-size: 12px;
  color: var(--presentation-text-muted);
  margin-bottom: 8px;
}

.row {
  display: flex;
  gap: 12px;
}

.part {
  flex: 1;
}

.part-label {
  margin-bottom: 6px;
  font-size: 12px;
  color: var(--presentation-text-muted);
}

.toolbar {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 12px;
}

.preview {
  border: 1px solid var(--presentation-border);
  border-radius: var(--presentation-radius);
  padding: 12px;
  margin-top: 12px;
  background-color: var(--presentation-background);
}

.preview-header,
.preview-footer {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 12px;
  font-size: 12px;
  padding: 4px 0;
  align-items: center;
}

.preview-header .part,
.preview-footer .part {
  min-width: 0;
}

.preview-header .part.left,
.preview-footer .part.left {
  justify-self: start;
}

.preview-header .part.center,
.preview-footer .part.center {
  justify-self: center;
}

.preview-header .part.right,
.preview-footer .part.right {
  justify-self: end;
}

.preview-slide {
  height: 100px;
  border: 1px dashed var(--presentation-border);
  border-radius: var(--presentation-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px 0;
  background: var(--presentation-background);
}

.preview-slide-label {
  font-size: 12px;
  color: var(--presentation-text-muted);
}

.preview-input {
  width: 100%;
  max-width: 220px;
  padding: 6px 8px;
  border: 1px solid var(--presentation-border);
  border-radius: var(--presentation-radius);
  background-color: var(--presentation-background);
  color: var(--presentation-text);
  font-size: 12px;
  line-height: 1.4;
  box-sizing: border-box;
}

.preview-header .part.left .preview-input,
.preview-footer .part.left .preview-input {
  text-align: left;
}

.preview-header .part.center .preview-input,
.preview-footer .part.center .preview-input {
  text-align: center;
}

.preview-header .part.right .preview-input,
.preview-footer .part.right .preview-input {
  text-align: right;
}

.btn {
  width: 100%;
  margin-top: 12px;
}
</style>
