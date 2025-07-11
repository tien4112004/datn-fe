<template>
  <div
    class="tabs"
    :class="{
      card: card,
      'space-around': spaceAround,
      'space-between': spaceBetween,
    }"
    :style="tabsStyle || {}"
  >
    <div
      class="tab"
      :class="{ active: tab.key === value }"
      v-for="tab in tabs"
      :key="tab.key"
      :style="{
        ...(tabStyle || {}),
        '--color': tab.color,
      }"
      @click="emit('update:value', tab.key)"
    >
      {{ tab.label }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { type CSSProperties } from 'vue';

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
  (event: 'update:value', payload: string): void;
}>();
</script>

<style lang="scss" scoped>
.tabs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(50px, 1fr));
  user-select: none;
  line-height: 1;
  overflow-x: auto;
  border-radius: $borderRadius;
  gap: $normalSpacing;

  &:not(.card) {
    align-items: center;
    justify-content: flex-start;
    border-bottom: 1px solid $borderColor;

    &.space-around {
      justify-content: space-around;
    }
    &.space-between {
      justify-content: space-between;
    }

    .tab {
      text-align: center;
      border-bottom: 2px solid transparent;
      padding: 8px 10px;
      cursor: pointer;

      &.active {
        border-bottom: 2px solid var(--color, $themeColor);
      }
    }
  }

  &.card {
    height: 40px;
    font-size: $baseTextSize;
    flex-shrink: 0;
    background-color: $lightGray;
    border: 1px solid $borderColor;
    display: flex;

    .tab {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;

      cursor: pointer;
      border-radius: $borderRadius;
      padding: 0 8px;

      &.active {
        background-color: $secondary;
        color: $secondary-foreground;
      }

      &.active:hover {
        background-color: $secondary;
        opacity: 0.9;
      }

      &:hover {
        background-color: $card;
      }
    }
  }
}
</style>
