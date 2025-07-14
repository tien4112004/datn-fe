<template>
  <div class="outline-editor">
    <div
      class="item"
      :class="[{ title: item.title }, `lv-${item.lv}`]"
      v-for="item in data"
      :key="item.id"
      :data-lv="item.lv"
      :data-id="item.id"
      v-contextmenu="contextmenus"
    >
      <Input
        class="editable-text"
        :value="item.content"
        v-if="activeItemId === item.id"
        @blur="($event) => handleBlur($event, item)"
        @enter="($event) => handleEnter($event, item)"
        @backspace="($event) => handleBackspace($event, item)"
      />
      <div class="text" @click="handleFocus(item.id)" v-else>
        {{ item.content }}
      </div>

      <div class="flag"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, nextTick, onMounted, watch } from 'vue';
import { nanoid } from 'nanoid';
import type { ContextmenuItem } from '@/components/Contextmenu/types';
import Input from './Input.vue';
import { useI18n } from 'vue-i18n';

interface OutlineItem {
  id: string;
  content: string;
  lv: number;
  title?: boolean;
}

const props = defineProps<{
  value: string;
}>();

const emit = defineEmits<{
  (event: 'update:value', payload: string): void;
}>();

const { t } = useI18n();

const data = ref<OutlineItem[]>([]);
const activeItemId = ref('');

watch(data, () => {
  let markdown = '';
  const prefixTitle = '#';
  const prefixItem = '-';
  for (const item of data.value) {
    if (item.lv !== 1) markdown += '\n';
    if (item.title) markdown += `${prefixTitle.repeat(item.lv)} ${item.content}`;
    else markdown += `${prefixItem} ${item.content}`;
  }
  emit('update:value', markdown);
});

onMounted(() => {
  const lines = props.value.split('\n');
  const result: OutlineItem[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    const headerMatch = line.match(/^(#+)\s*(.*)/);
    const listMatch = line.match(/^-\s*(.*)/);

    if (headerMatch) {
      const lv = headerMatch[1].length;
      const content = headerMatch[2];
      result.push({
        id: nanoid(),
        content,
        title: true,
        lv,
      });
    } else if (listMatch) {
      const content = listMatch[1];
      result.push({
        id: nanoid(),
        content,
        lv: 4,
      });
    } else {
      result.push({
        id: nanoid(),
        content: line.trim(),
        lv: 4,
      });
    }
  }
  data.value = result;
});

const handleFocus = (id: string) => {
  activeItemId.value = id;

  nextTick(() => {
    const editableRef = document.querySelector('.editable-text input') as HTMLInputElement;
    editableRef.focus();
  });
};

const handleBlur = (e: Event, item: OutlineItem) => {
  activeItemId.value = '';
  const value = (e.target as HTMLInputElement).value;
  data.value = data.value.map((_item) => {
    if (_item.id === item.id) return { ..._item, content: value };
    return _item;
  });
};

const handleEnter = (e: Event, item: OutlineItem) => {
  const value = (e.target as HTMLInputElement).value;
  if (!value) return;

  activeItemId.value = '';

  if (!item.title) {
    const index = data.value.findIndex((_item) => _item.id === item.id);
    const newItemId = nanoid();
    data.value.splice(index + 1, 0, { id: newItemId, content: '', lv: 4 });

    nextTick(() => {
      handleFocus(newItemId);
    });
  }
};

const handleBackspace = (e: Event, item: OutlineItem) => {
  if (!item.title) {
    const value = (e.target as HTMLInputElement).value;
    if (!value) deleteItem(item.id);
  }
};

const addItem = (itemId: string, pos: 'next' | 'prev', content: string) => {
  const index = data.value.findIndex((_item) => _item.id === itemId);
  const item = data.value[index];
  if (!item) return;

  const id = nanoid();
  let lv = 4;
  let i = 0;
  let title = false;

  if (pos === 'prev') i = index;
  else i = index + 1;

  if (item.lv === 1) lv = 2;
  else if (item.lv === 2) {
    if (pos === 'prev') lv = 2;
    else lv = 3;
  } else if (item.lv === 3) {
    if (pos === 'prev') lv = 3;
    else lv = 4;
  } else lv = 4;

  if (lv < 4) title = true;

  data.value.splice(i, 0, { id, content, lv, title });
};

const deleteItem = (itemId: string, isTitle?: boolean) => {
  if (isTitle) {
    const index = data.value.findIndex((item) => item.id === itemId);

    const targetIds = [itemId];
    const item = data.value[index];
    for (let i = index + 1; i < data.value.length; i++) {
      const afterItem = data.value[i];
      if (afterItem && afterItem.lv > item.lv) {
        targetIds.push(afterItem.id);
      } else break;
    }
    data.value = data.value.filter((item) => !targetIds.includes(item.id));
  } else {
    data.value = data.value.filter((item) => item.id !== itemId);
  }
};

const contextmenus = (el: HTMLElement): ContextmenuItem[] => {
  const lv = +el.dataset.lv!;
  const id = el.dataset.id!;

  if (lv === 1) {
    return [
      {
        text: t('elements.outline.actions.addSubOutlineChapter'),
        handler: () => addItem(id, 'next', t('elements.outline.defaults.newChapter')),
      },
    ];
  } else if (lv === 2) {
    return [
      {
        text: t('elements.outline.actions.addSameLevelAboveChapter'),
        handler: () => addItem(id, 'prev', t('elements.outline.defaults.newChapter')),
      },
      {
        text: t('elements.outline.actions.addSubOutlineSection'),
        handler: () => addItem(id, 'next', t('elements.outline.defaults.newSection')),
      },
      {
        text: t('elements.outline.actions.deleteThisChapter'),
        handler: () => deleteItem(id, true),
      },
    ];
  } else if (lv === 3) {
    return [
      {
        text: t('elements.outline.actions.addSameLevelAboveSection'),
        handler: () => addItem(id, 'prev', t('elements.outline.defaults.newSection')),
      },
      {
        text: t('elements.outline.actions.addSubOutlineItem'),
        handler: () => addItem(id, 'next', t('elements.outline.defaults.newItem')),
      },
      {
        text: t('elements.outline.actions.deleteThisSection'),
        handler: () => deleteItem(id, true),
      },
    ];
  }
  return [
    {
      text: t('elements.outline.actions.addSameLevelAboveItem'),
      handler: () => addItem(id, 'prev', t('elements.outline.defaults.newItem')),
    },
    {
      text: t('elements.outline.actions.addSameLevelBelowItem'),
      handler: () => addItem(id, 'next', t('elements.outline.defaults.newItem')),
    },
    {
      text: t('elements.outline.actions.deleteThisItem'),
      handler: () => deleteItem(id),
    },
  ];
};
</script>

<style lang="scss">
.outline-editor {
  padding: 0 10px;
  padding-left: 40px;
  position: relative;

  .item {
    height: 32px;
    position: relative;

    &.contextmenu-active {
      color: $themeColor;

      .text {
        background-color: rgba($color: $themeColor, $alpha: 0.08);
      }
    }

    &.title {
      font-weight: 700;
    }
    &.lv-1 {
      font-size: $xlgTextSize;
    }
    &.lv-2 {
      font-size: $baseTextSize;
    }
    &.lv-3 {
      font-size: $baseTextSize;
    }
    &.lv-4 {
      font-size: $smTextSize;
      padding-left: 20px;
    }
  }
  .text {
    height: 100%;
    padding: 0 11px;
    line-height: 32px;
    border-radius: $borderRadius;
    transition: background-color 0.2s;
    cursor: pointer;
    @include ellipsis-oneline();

    &:hover {
      background-color: rgba($color: $themeColor, $alpha: 0.08);
    }
  }
  .flag {
    width: 32px;
    height: 32px;
    position: absolute;
    top: 50%;
    left: -40px;
    margin-top: -16px;
    z-index: 1;
    display: flex;
    justify-content: center;
    align-items: center;

    &::before {
      content: '';
      width: 1px;
      height: 100%;
      position: absolute;
      left: 50%;
      background-color: rgba($color: $themeColor, $alpha: 0.1);
    }
    &::after {
      content: '';
      width: 32px;
      height: 22px;
      border-radius: 2px;
      background-color: $background;
      border: 1px solid $themeColor;
      color: $themeColor;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: $xsTextSize;
      font-weight: 400;
    }
  }
  .item.lv-1 .flag::after {
    content: attr(data-i18n-theme);
  }
  .item.lv-2 .flag::after {
    content: attr(data-i18n-chapter);
  }
  .item.lv-3 .flag::after {
    content: attr(data-i18n-section);
  }
  .item.lv-4 .flag::after {
    opacity: 0;
  }
}
</style>
