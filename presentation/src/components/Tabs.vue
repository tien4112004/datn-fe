<template>
  <Tabs :model-value="value" @update:model-value="emit('update:value', $event)">
    <TabsList
      :class="
        cn(
          card
            ? 'tw-h-fit tw-border tw-border-border'
            : 'tw-h-auto tw-rounded-none tw-border-b tw-border-gray-200 tw-bg-transparent tw-p-0',
          spaceAround ? 'tw-justify-around' : '',
          spaceBetween ? 'tw-justify-between' : '',
          'tw-w-full'
        )
      "
      :style="tabsStyle"
    >
      <TabsTrigger
        v-for="tab in tabs"
        :key="tab.key"
        :value="tab.key"
        :class="
          cn(
            card
              ? 'data-[state=active]:tw-bg-primary data-[state=active]:tw-text-primary-foreground tw-text-md tw-h-full data-[state=active]:tw-shadow-sm tw-py-1'
              : 'tw-h-auto tw-rounded-none tw-border-0 tw-border-b-2 tw-border-transparent tw-px-3 tw-py-2 data-[state=active]:tw-border-current data-[state=active]:tw-bg-transparent data-[state=active]:tw-shadow-none'
          )
        "
        :style="{
          ...tabStyle,
          ...(tab.color
            ? { '--tw-border-color': tab.color, color: value === tab.key ? tab.color : undefined }
            : {}),
        }"
      >
        {{ tab.label }}
      </TabsTrigger>
    </TabsList>
  </Tabs>
</template>

<script lang="ts" setup>
import { type CSSProperties } from 'vue';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { cn } from '@/lib/utils';

interface TabItem {
  key: string;
  label: string;
  color?: string;
}

withDefaults(
  defineProps<{
    value: string;
    tabs: TabItem[];
    card?: boolean;
    tabsStyle?: CSSProperties;
    tabStyle?: CSSProperties;
    spaceAround?: boolean;
    spaceBetween?: boolean;
  }>(),
  {
    card: false,
    spaceAround: false,
    spaceBetween: false,
  }
);

const emit = defineEmits<{
  'update:value': [payload: string | number];
}>();
</script>
