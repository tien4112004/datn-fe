<template>
  <div
    class="card"
    :class="{
      hoverable: hoverable,
      clickable: clickable,
      [`padding-${padding}`]: padding,
    }"
    @click="handleClick"
  >
    <!-- Main content -->
    <div class="card-content">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    hoverable?: boolean;
    clickable?: boolean;
    padding?: 'none' | 'small' | 'normal' | 'large';
  }>(),
  {
    hoverable: false,
    clickable: false,
    padding: 'normal',
    size: 'normal',
  }
);

const emit = defineEmits<{
  (event: 'click'): void;
}>();

const handleClick = () => {
  if (props.clickable) {
    emit('click');
  }
};
</script>

<style lang="scss" scoped>
.card {
  background-color: $card;
  display: flex;
  flex-direction: column;
  user-select: none;
  border: 1px solid $borderColor;
  border-radius: $borderRadius;
  transition: all 0.2s ease;
  height: 100%;

  // Padding variations
  &.padding-none {
    padding: 0;
  }

  &.padding-small {
    padding: calc($normalSpacing / 2);
  }

  &.padding-normal {
    padding: $normalSpacing;
  }

  &.padding-large {
    padding: $largeSpacing;
  }

  // Interactive states
  &.hoverable:hover {
    background-color: $card-hover;
    border-color: rgba($color: $themeColor, $alpha: 0.3);
    box-shadow: 0 2px 8px rgba($color: $themeColor, $alpha: 0.1);
  }

  &.clickable {
    cursor: pointer;

    &:hover {
      background-color: $card-hover;
      border-color: rgba($color: $themeColor, $alpha: 0.3);
      box-shadow: 0 2px 8px rgba($color: $themeColor, $alpha: 0.1);
    }

    &:active {
      transform: translateY(1px);
      box-shadow: 0 1px 4px rgba($color: $themeColor, $alpha: 0.1);
    }
  }
}

.card-content {
  color: $card-foreground;
}
</style>
