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
  background-color: var(--card);
  display: flex;
  user-select: none;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  transition: all 0.2s ease;
  height: 100%;
  margin: 0.25rem;

  // Padding variations
  &.padding-none {
    padding: 0;
  }

  &.padding-small {
    padding: 0.25rem;
  }

  &.padding-normal {
    padding: 0.5rem;
  }

  &.padding-large {
    padding: 1rem;
  }

  // Interactive states
  &.hoverable:hover {
    background-color: var(--card-hover);
    border-color: rgb(from var(--primary) r g b / 0.3);
    box-shadow: 0 2px 8px rgb(from var(--primary) r g b / 0.1);
  }

  &.clickable {
    cursor: pointer;

    &:hover {
      background-color: var(--card-hover);
      border-color: rgb(from var(--primary) r g b / 0.3);
      box-shadow: 0 2px 8px rgb(from var(--primary) r g b / 0.1);
    }

    &:active {
      transform: translateY(1px);
      box-shadow: 0 1px 4px rgb(from var(--primary) r g b / 0.1);
    }
  }
}

.card-content {
  width: 100%;
  color: var(--card-foreground);
}
</style>
