<template>
  <Tabs :model-value="value" @update:model-value="emit('update:value', $event)">
    <TabsList
      :class="
        cn(
          card
            ? 'h-11 border border-gray-200 bg-gray-100'
            : 'h-auto rounded-none border-b border-gray-200 bg-transparent p-0',
          spaceAround ? 'justify-around' : '',
          spaceBetween ? 'justify-between' : '',
          'w-full'
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
              ? 'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-md h-full data-[state=active]:shadow-sm'
              : 'h-auto rounded-none border-0 border-b-2 border-transparent px-3 py-2 data-[state=active]:border-current data-[state=active]:bg-transparent data-[state=active]:shadow-none'
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
