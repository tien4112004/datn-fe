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
                <Button
                  type="primary"
                  size="small"
                  :loading="uploadingImageId === props.id"
                  :disabled="uploadingImageId !== null"
                  @click="uploadAndInsertPexelsImage(props.src, props.id)"
                >
                  {{
                    uploadingImageId === props.id
                      ? t('panels.imageLibrary.uploading') || 'Uploading...'
                      : t('panels.imageLibrary.insert')
                  }}
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
import { useImageSearch, useMyImages, useGenerateImage, useUploadImage } from '@/services/queries';
import useCreateElement from '@/hooks/useCreateElement';
import message from '@/utils/message';
import Button from '@/components/Button.vue';
import ImageWaterfallViewer from '@/components/ImageWaterfallViewer.vue';
import Input from '@/components/Input.vue';
import Popover from '@/components/Popover.vue';
import PopoverMenuItem from '@/components/PopoverMenuItem.vue';
import Tabs from '@/components/Tabs.vue';

const { t } = useI18n();

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
const orientationVisible = ref(false);
const searchWord = ref('');
const orientation = ref<Orientation>('all');
const orientationOptions = ref<{ key: Orientation; label: string }[]>([]);
const orientationMap = ref<{ [key: string]: string }>({});
const uploadingImageId = ref<number | null>(null);

// Pexels search query
const pexelsSearchPayload = computed(() => ({
  query: searchWord.value,
  per_page: 50,
  orientation: orientation.value,
}));

const {
  data: pexelsSearchData,
  isLoading: pexelsLoading,
  refetch: refetchPexels,
} = useImageSearch(pexelsSearchPayload, {
  enabled: computed(() => searchWord.value.length > 0),
});

const pexelsImages = computed(() => pexelsSearchData.value?.data || []);

// My Images Tab State
const myImagesScrollContainer = ref<HTMLElement | null>(null);
const currentPage = ref(1);

const {
  data: myImagesData,
  isLoading: myImagesLoading,
  refetch: refetchMyImages,
} = useMyImages(currentPage, 20);

const myImages = computed(() => myImagesData.value?.data || []);
const totalPages = computed(() => Math.ceil((myImagesData.value?.total || 0) / 20));
const hasMore = computed(() => currentPage.value < totalPages.value);
const loadingMore = ref(false);

// Mutations
const generateImageMutation = useGenerateImage();
const uploadImageMutation = useUploadImage();

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
  searchWord.value = query;
  // The query will auto-trigger via the computed pexelsSearchPayload
};

const setOrientation = (value: Orientation) => {
  orientation.value = value;
  if (searchWord.value) refetchPexels();
};

// Upload Pexels image to server and insert
const uploadAndInsertPexelsImage = async (imageUrl: string, imageId: number) => {
  uploadingImageId.value = imageId;
  try {
    // Fetch Pexels image as blob
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    // Create File from blob
    const file = new File([blob], `pexels-${imageId}.jpg`, { type: blob.type });

    // Upload to server using mutation
    uploadImageMutation.mutate(file, {
      onSuccess: (result) => {
        // Insert using CDN URL
        createImageElement(result.cdnUrl);
        uploadingImageId.value = null;
      },
      onError: (error) => {
        console.error('Failed to upload Pexels image:', error);
        message.error(t('panels.imageLibrary.errorUploadFailed'));
        uploadingImageId.value = null;
      },
    });
  } catch (error) {
    console.error('Failed to fetch Pexels image:', error);
    message.error(t('panels.imageLibrary.uploadFailed') || 'Failed to upload image');
  } finally {
    uploadingImageId.value = null;
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
    loadingMore.value = true;
    currentPage.value++;
    // The query will auto-refetch with the new page number
  }
};

// Watch for loading state changes
watch([myImagesData, myImagesLoading], () => {
  if (!myImagesLoading.value) {
    loadingMore.value = false;
  }
});

// Watch tab changes to ensure data is loaded
watch(activeTab, (newTab) => {
  if (newTab === 'myImages' && currentPage.value === 1) {
    refetchMyImages();
  }
});

onMounted(() => {
  initOrientationOptions();
  searchWord.value = t('panels.imageLibrary.defaultSearch');
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
