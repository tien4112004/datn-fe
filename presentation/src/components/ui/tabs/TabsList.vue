<script setup lang="ts">
import type { TabsListProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { TabsList } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<TabsListProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = reactiveOmit(props, 'class');
</script>

<template>
  <TabsList
    data-slot="tabs-list"
    v-bind="delegatedProps"
    :class="
      cn(
        'tw-bg-background tw-text-muted-foreground tw-h-9 tw-w-fit tw-items-center tw-justify-center tw-rounded-lg tw-p-[3px] tw-inline-flex',
        props.class
      )
    "
  >
    <slot />
  </TabsList>
</template>
