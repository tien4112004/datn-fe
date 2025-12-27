<template>
  <div class="image-lib-panel">
    <div class="tools">
      <Input
        class="input"
        v-model:value="searchWord"
        :placeholder="t('panels.imageLibrary.searchPlaceholder')"
        @enter="search()"
      >
        <template #prefix>
          <Popover class="more-icon" trigger="click" v-model:value="orientationVisible">
            <template #content>
              <PopoverMenuItem
                center
                v-for="item in orientationOptions"
                :key="item.key"
                @click="
                  setOrientation(item.key);
                  orientationVisible = false;
                "
                >{{ item.label }}</PopoverMenuItem
              >
            </template>
            <div class="search-orientation">{{ orientationMap[orientation] }} <IconDown :size="14" /></div>
          </Popover>
        </template>
        <template #suffix>
          <div class="search-btn" @click="search()"><IconSearch /></div>
        </template>
      </Input>
    </div>

    <div class="imgs-wrap">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <div class="loading-text">{{ t('panels.imageLibrary.loading') }}</div>
      </div>
      <ImageWaterfallViewer v-else :list="imgs" :columnSpacing="5" :columnWidth="160">
        <template v-slot:default="props">
          <div class="img-item">
            <img :src="props.src" />
            <div class="mask">
              <Button type="primary" size="small" @click="createImageElement(props.src)">{{
                t('panels.imageLibrary.insert')
              }}</Button>
            </div>
          </div>
        </template>
      </ImageWaterfallViewer>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import api from '@/services';
import useCreateElement from '@/hooks/useCreateElement';
import message from '@/utils/message';
import Button from '@/components/Button.vue';
import ImageWaterfallViewer from '@/components/ImageWaterfallViewer.vue';
import Input from '@/components/Input.vue';
import Popover from '@/components/Popover.vue';
import PopoverMenuItem from '@/components/PopoverMenuItem.vue';

const { t } = useI18n();

interface ImageItem {
  id: number;
  width: number;
  height: number;
  src: string;
}

type Orientation = 'landscape' | 'portrait' | 'square' | 'all';

const { createImageElement } = useCreateElement();

const imgs = ref<ImageItem[]>([]);
const loading = ref(false);
const orientationVisible = ref(false);
const searchWord = ref('');
const orientation = ref<Orientation>('all');
const orientationOptions = ref<
  {
    key: Orientation;
    label: string;
  }[]
>([]);

const orientationMap = ref<{ [key: string]: string }>({});

// Initialize orientation options with translations
const initOrientationOptions = () => {
  orientationOptions.value = [
    { key: 'all', label: t('panels.imageLibrary.orientations.all') },
    { key: 'landscape', label: t('panels.imageLibrary.orientations.landscape') },
    { key: 'portrait', label: t('panels.imageLibrary.orientations.portrait') },
    { key: 'square', label: t('panels.imageLibrary.orientations.square') },
  ];
  orientationMap.value = {
    all: t('panels.imageLibrary.orientations.all'),
    landscape: t('panels.imageLibrary.orientations.landscape'),
    portrait: t('panels.imageLibrary.orientations.portrait'),
    square: t('panels.imageLibrary.orientations.square'),
  };
};

onMounted(() => {
  initOrientationOptions();
  search(t('panels.imageLibrary.defaultSearch'));
});

const search = (q?: string) => {
  const query = q || searchWord.value;
  if (!query) return message.error(t('panels.imageLibrary.errorNoQuery'));
  loading.value = true;

  api
    .searchImage({
      query,
      per_page: 50,
      orientation: orientation.value,
    })
    .then((ret) => {
      imgs.value = ret.data;
      loading.value = false;
    })
    .catch(() => {
      loading.value = false;
    });
};

const setOrientation = (value: Orientation) => {
  orientation.value = value;
  if (searchWord.value) search();
};
</script>

<style lang="scss" scoped>
.image-lib-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.tools {
  flex-shrink: 0;
  margin-bottom: 10px;
}
.search-orientation {
  color: #999;
  padding-left: 5px;
  cursor: pointer;
}
.search-btn {
  width: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  &:hover {
    color: var(--presentation-primary);
  }
}
.imgs-wrap {
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
}
.img-item {
  border-radius: 4px;
  overflow: hidden;
  position: relative;

  &:hover .mask {
    display: flex;
  }

  .mask {
    position: absolute;
    inset: 0;
    display: none;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.25);
  }
}
.loading-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #999;
}
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--presentation-primary, #5b9bd5);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spinner 0.8s linear infinite;
}
.loading-text {
  margin-top: 12px;
  font-size: 13px;
}
@keyframes spinner {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
