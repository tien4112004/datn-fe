<template>
  <div class="image-lib-panel">
    <!-- Tab Selector -->
    <Tabs v-model:value="activeTab" :tabs="tabOptions" class="tabs-container" />

    <!-- Pexels Tab Content -->
    <div v-if="activeTab === 'pexels'" class="tab-content">
      <div class="tools">
        <Input
          class="input"
          v-model:value="searchWord"
          :placeholder="t('panels.imageLibrary.searchPlaceholder')"
          @enter="searchPexels()"
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
            <div class="search-btn" @click="searchPexels()"><IconSearch /></div>
          </template>
        </Input>
      </div>

      <div class="imgs-wrap">
        <div v-if="pexelsLoading" class="loading-state">
          <div class="spinner"></div>
          <div class="loading-text">{{ t('panels.imageLibrary.loading') }}</div>
        </div>
        <ImageWaterfallViewer v-else :list="pexelsImages" :columnSpacing="5" :columnWidth="160">
          <template v-slot:default="props">
            <div class="img-item">
              <img :src="props.src" />
              <div class="mask">
                <Button type="primary" size="small" @click="createImageElement(props.src)">
                  {{ t('panels.imageLibrary.insert') }}
                </Button>
              </div>
            </div>
          </template>
        </ImageWaterfallViewer>
      </div>
    </div>

    <!-- My Images Tab Content -->
    <div v-if="activeTab === 'myImages'" class="tab-content">
      <div class="imgs-wrap" ref="myImagesScrollContainer" @scroll="onMyImagesScroll">
        <!-- Initial Loading -->
        <div v-if="myImagesLoading && myImages.length === 0" class="loading-state">
          <div class="spinner"></div>
          <div class="loading-text">{{ t('panels.imageLibrary.loading') }}</div>
        </div>

        <!-- Empty State -->
        <div v-else-if="!myImagesLoading && myImages.length === 0" class="empty-state">
          <div class="empty-text">{{ t('panels.imageLibrary.emptyStates.noImages') }}</div>
        </div>

        <!-- Image Grid -->
        <ImageWaterfallViewer v-else :list="myImages" :columnSpacing="5" :columnWidth="160">
          <template v-slot:default="props">
            <div class="img-item">
              <img :src="props.src" />
              <div class="mask">
                <Button type="primary" size="small" @click="createImageElement(props.src)">
                  {{ t('panels.imageLibrary.insert') }}
                </Button>
              </div>
            </div>
          </template>
        </ImageWaterfallViewer>

        <!-- Load More Indicator -->
        <div v-if="loadingMore" class="loading-more">
          <div class="spinner-small"></div>
          <span>{{ t('panels.imageLibrary.loading') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { getImageApi } from '@/services/image/api';
import useCreateElement from '@/hooks/useCreateElement';
import message from '@/utils/message';
import Button from '@/components/Button.vue';
import ImageWaterfallViewer from '@/components/ImageWaterfallViewer.vue';
import Input from '@/components/Input.vue';
import Popover from '@/components/Popover.vue';
import PopoverMenuItem from '@/components/PopoverMenuItem.vue';
import Tabs from '@/components/Tabs.vue';

const { t } = useI18n();
const imageApi = getImageApi();

// Common types
interface PexelsImageItem {
  id: number;
  width: number;
  height: number;
  src: string;
}

interface MyImageItem {
  id: number;
  url: string;
  originalFilename?: string;
}

type Orientation = 'landscape' | 'portrait' | 'square' | 'all';
type TabKey = 'pexels' | 'myImages';

const { createImageElement } = useCreateElement();

// Tab Management
const activeTab = ref<TabKey>('pexels');
const tabOptions = computed(() => [
  { key: 'pexels', label: t('panels.imageLibrary.tabs.pexels') },
  { key: 'myImages', label: t('panels.imageLibrary.tabs.myImages') },
]);

// Pexels Tab State
const pexelsImages = ref<PexelsImageItem[]>([]);
const pexelsLoading = ref(false);
const orientationVisible = ref(false);
const searchWord = ref('');
const orientation = ref<Orientation>('all');
const orientationOptions = ref<{ key: Orientation; label: string }[]>([]);
const orientationMap = ref<{ [key: string]: string }>({});

// My Images Tab State
const myImages = ref<any[]>([]);
const myImagesLoading = ref(false);
const loadingMore = ref(false);
const myImagesScrollContainer = ref<HTMLElement | null>(null);
const currentPage = ref(1);
const totalPages = ref(1);
const hasMore = computed(() => currentPage.value < totalPages.value);

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

// Pexels Search
const searchPexels = (q?: string) => {
  const query = q || searchWord.value;
  if (!query) return message.error(t('panels.imageLibrary.errorNoQuery'));
  pexelsLoading.value = true;

  imageApi
    .searchImage({
      query,
      per_page: 50,
      orientation: orientation.value,
    })
    .then((ret: any) => {
      pexelsImages.value = ret.data;
      pexelsLoading.value = false;
    })
    .catch(() => {
      pexelsLoading.value = false;
    });
};

const setOrientation = (value: Orientation) => {
  orientation.value = value;
  if (searchWord.value) searchPexels();
};

// My Images Functions
const loadMyImages = async (page: number = 1) => {
  if (page === 1) {
    myImagesLoading.value = true;
  } else {
    loadingMore.value = true;
  }

  try {
    const response = await imageApi.getMyImages(page, 20);

    // Response is already the API response object {success, code, timestamp, data, pagination}
    const apiData = response.data || [];
    const apiPagination = response.pagination;

    // Transform MediaResponseDto to match ImageWaterfallViewer interface
    const transformedData = apiData.map((item: MyImageItem) => ({
      id: item.id,
      width: 300,
      height: 200,
      src: item.url,
      url: item.url,
    }));

    if (page === 1) {
      myImages.value = transformedData;
    } else {
      myImages.value = [...myImages.value, ...transformedData];
    }

    if (apiPagination) {
      currentPage.value = apiPagination.currentPage + 1;
      totalPages.value = apiPagination.totalPages;
    }
  } catch (error) {
    console.error('Failed to load images:', error);
    message.error(t('panels.imageLibrary.failedToLoad'));
  } finally {
    myImagesLoading.value = false;
    loadingMore.value = false;
  }
};

// Infinite Scroll Handler
const onMyImagesScroll = () => {
  const container = myImagesScrollContainer.value;
  if (!container || loadingMore.value || !hasMore.value) return;

  const scrollTop = container.scrollTop;
  const scrollHeight = container.scrollHeight;
  const clientHeight = container.clientHeight;

  // Trigger load when 80% scrolled
  if (scrollTop + clientHeight >= scrollHeight * 0.8) {
    loadMyImages(currentPage.value);
  }
};

// Watch tab changes to load data
watch(activeTab, (newTab) => {
  if (newTab === 'myImages' && myImages.value.length === 0) {
    loadMyImages(1);
  }
});

onMounted(() => {
  initOrientationOptions();
  searchPexels(t('panels.imageLibrary.defaultSearch'));
});
</script>

<style lang="scss" scoped>
.image-lib-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tabs-container {
  flex-shrink: 0;
  margin-bottom: 10px;
}

.tab-content {
  flex: 1;
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
  display: flex;
  align-items: center;
  gap: 4px;
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

.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #999;

  .empty-text {
    font-size: 14px;
  }
}

.loading-more {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 16px;
  color: #999;
  font-size: 13px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--presentation-primary, #5b9bd5);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spinner 0.8s linear infinite;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid var(--presentation-primary, #5b9bd5);
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
