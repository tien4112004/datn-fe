<template>
  <div class="thumbnail-demo">
    <div class="demo-header">
      <h2 class="demo-title">{{ $t('thumbnailDemo.title') }}</h2>
      <div class="demo-info">
        <span class="slide-counter">
          {{ $t('thumbnailDemo.slideCount', { current: currentIndex + 1, total: totalSlides }) }}
        </span>
      </div>
    </div>

    <div class="thumbnail-grid" v-if="!loading && demoSlides.length">
      <div
        v-for="(slide, index) in demoSlides"
        :key="slide.id"
        class="thumbnail-wrapper"
        :class="{ active: index === currentIndex }"
        @click="setCurrentIndex(index)"
      >
        <ThumbnailSlide :slide="slide" :size="thumbnailSize" :visible="true" />
        <div class="slide-number">{{ index + 1 }}</div>
      </div>
    </div>

    <div class="loading-state" v-else-if="loading">
      <div class="loading-spinner"></div>
      <p>{{ $t('thumbnailDemo.loading') }}</p>
    </div>

    <div class="empty-state" v-else>
      <p>{{ $t('thumbnailDemo.noSlides') }}</p>
    </div>

    <div class="demo-controls" v-if="!loading && demoSlides.length">
      <button class="nav-button" :disabled="!hasPrevious" @click="previousSlide">
        {{ $t('thumbnailDemo.previous') }}
      </button>

      <button class="nav-button" :disabled="!hasNext" @click="nextSlide">
        {{ $t('thumbnailDemo.next') }}
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useThumbnailDemoStore, useSlidesStore } from '@/store';
import ThumbnailSlide from '@/views/components/ThumbnailSlide/index.vue';

// Props for configuration
const props = withDefaults(
  defineProps<{
    thumbnailSize?: number;
    autoLoad?: boolean;
  }>(),
  {
    thumbnailSize: 180,
    autoLoad: true,
  }
);

// Store setup
const thumbnailDemoStore = useThumbnailDemoStore();
const slidesStore = useSlidesStore();

const { demoSlides, currentIndex, loading, totalSlides, currentSlide, hasPrevious, hasNext } =
  storeToRefs(thumbnailDemoStore);

// Methods
const { setCurrentIndex, nextSlide, previousSlide, setLoading } = thumbnailDemoStore;

// Computed
const thumbnailSize = computed(() => props.thumbnailSize);

// Lifecycle
onMounted(async () => {
  if (props.autoLoad) {
    setLoading(true);

    // Simulate loading delay for demo purposes
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }
});

// Expose component for Module Federation
defineExpose({
  store: thumbnailDemoStore,
  slides: demoSlides,
  currentIndex,
  setCurrentIndex,
  nextSlide,
  previousSlide,
});
</script>

<style lang="scss" scoped>
.thumbnail-demo {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;

  .demo-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e1e5e9;

    .demo-title {
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
    }

    .demo-info {
      .slide-counter {
        font-size: 14px;
        color: #6b7280;
        background: #f3f4f6;
        padding: 4px 12px;
        border-radius: 12px;
      }
    }
  }

  .thumbnail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 24px;

    .thumbnail-wrapper {
      position: relative;
      border: 2px solid transparent;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s ease;
      background: #fff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }

      &.active {
        border-color: #5b9bd5;
        box-shadow: 0 4px 16px rgba(91, 155, 213, 0.3);
      }

      .slide-number {
        position: absolute;
        top: 8px;
        left: 8px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        font-size: 12px;
        font-weight: 600;
        padding: 4px 8px;
        border-radius: 4px;
        z-index: 10;
      }
    }
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: #6b7280;

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e5e7eb;
      border-top: 3px solid #5b9bd5;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  }

  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #6b7280;
    font-size: 16px;
  }

  .demo-controls {
    display: flex;
    justify-content: center;
    gap: 16px;
    padding-top: 16px;
    border-top: 1px solid #e1e5e9;

    .nav-button {
      padding: 8px 16px;
      border: 1px solid #d1d5db;
      background: #fff;
      color: #374151;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-weight: 500;

      &:hover:not(:disabled) {
        background: #f9fafb;
        border-color: #9ca3af;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      &:active:not(:disabled) {
        background: #f3f4f6;
      }
    }
  }
}

// Responsive design
@media (max-width: 768px) {
  .thumbnail-demo {
    padding: 16px;

    .thumbnail-grid {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 16px;
    }

    .demo-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;

      .demo-title {
        font-size: 20px;
      }
    }
  }
}
</style>
