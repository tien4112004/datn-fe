<template>
  <div class="templates">
    <div class="catalogs">
      <div
        class="catalog"
        :class="{ active: activeCatalog === item.id }"
        v-for="item in templates"
        :key="item.id"
        @click="changeCatalog(item.id)"
      >
        {{ item.name }}
      </div>
    </div>
    <div class="content">
      <div class="header">
        <div class="types">
          <div
            class="type"
            :class="{ active: activeType === item.value }"
            v-for="item in types"
            :key="item.value"
            @click="activeType = item.value"
          >
            {{ t(`templates.types.${item.value}`) }}
          </div>
        </div>
        <div class="insert-all" @click="insertTemplates(slides)">{{ $t('templates.actions.insertAll') }}</div>
      </div>
      <div class="list" ref="listRef">
        <template v-for="slide in slides" :key="slide.id">
          <div class="slide-item" v-if="slide.type === activeType || activeType === 'all'">
            <ThumbnailSlide class="thumbnail" :slide="slide" :size="180" />

            <div class="btns">
              <Button class="btn" type="primary" size="small" @click="insertTemplate(slide)">{{
                $t('templates.actions.insertTemplate')
              }}</Button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useSlidesStore } from '@/store';
import type { Slide } from '@/types/slides';
import api from '@/services';

import ThumbnailSlide from '@/views/components/ThumbnailSlide/index.vue';
import Button from '@/components/Button.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const emit = defineEmits<{
  (event: 'select', payload: Slide): void;
  (event: 'selectAll', payload: Slide[]): void;
}>();

const slidesStore = useSlidesStore();
const { templates } = storeToRefs(slidesStore);
const slides = ref<Slide[]>([]);
const listRef = ref<HTMLElement>();
const types = ref<
  {
    label: string;
    value: string;
  }[]
>([
  { label: t('templates.types.all'), value: 'all' },
  { label: t('templates.types.cover'), value: 'cover' },
  { label: t('templates.types.contents'), value: 'contents' },
  { label: t('templates.types.transition'), value: 'transition' },
  { label: t('templates.types.content'), value: 'content' },
  { label: t('templates.types.end'), value: 'end' },
]);
const activeType = ref('all');

const activeCatalog = ref('');

const insertTemplate = (slide: Slide) => {
  emit('select', slide);
};

const insertTemplates = (slides: Slide[]) => {
  emit('selectAll', slides);
};

const changeCatalog = (id: string) => {
  activeCatalog.value = id;
  api.getFileData(activeCatalog.value).then((ret) => {
    slides.value = ret.slides;

    if (listRef.value) listRef.value.scrollTo(0, 0);
  });
};

onMounted(() => {
  changeCatalog(templates.value[0].id);
});
</script>

<style lang="scss" scoped>
.templates {
  width: 500px;
  height: 500px;
  display: flex;
  user-select: none;
  width: fit-content;
}
.catalogs {
  width: 108px;
  margin-right: 10px;
  padding-right: 10px;
  border-right: 1px solid $borderColor;
  overflow: auto;

  .catalog {
    padding: 7px 8px;
    border-radius: $borderRadius;
    cursor: pointer;

    &:hover {
      background-color: $gray-f5f5f5;
    }

    &.active {
      color: $themeColor;
      background-color: rgba($color: $themeColor, $alpha: 0.05);
      border-right: 2px solid $themeColor;
      font-weight: 700;
    }

    & + .catalog {
      margin-top: 3px;
    }
  }
}
.content {
  display: flex;
  flex-direction: column;
  width: fit-content;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-right: 4px;

  .insert-all {
    min-width: fit-content;
    padding-left: 4px;
  }

  &:hover .insert-all {
    opacity: 1;
    transition: opacity $transitionDelay;
  }
}
.types {
  display: flex;

  .type {
    border-radius: $borderRadius;
    padding: 3px 8px;
    font-size: $smTextSize;
    cursor: pointer;

    & + .type {
      margin-left: 4px;
    }

    &.active {
      color: $themeColor;
      background-color: rgba($color: $themeColor, $alpha: 0.05);
      font-weight: 700;
    }

    &:hover {
      background-color: $gray-f5f5f5;
    }
  }
}
.insert-all {
  opacity: 0;
  font-size: $smTextSize;
  color: $themeColor;
  text-decoration: underline;
  cursor: pointer;
}
.list {
  width: fit-content;
  padding: 2px;
  margin-right: -10px;
  padding-right: 10px;
  overflow: auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: min-content;
  gap: 10px;
}
.slide-item {
  position: relative;
  height: fit-content;

  &:hover .btns {
    opacity: 1;
  }

  &:hover .thumbnail {
    outline-color: $themeColor;
  }

  .btns {
    @include absolute-0();

    flex-direction: column;
    justify-content: center;
    align-items: center;
    display: flex;
    background-color: rgba($color: $foreground, $alpha: 0.25);
    opacity: 0;
    transition: opacity $transitionDelay;
  }

  .thumbnail {
    outline: 2px solid $borderColor;
    transition: outline $transitionDelay;
    border-radius: $borderRadius;
    cursor: pointer;
  }
}

@media screen and (max-width: 1000px) {
  .list {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
