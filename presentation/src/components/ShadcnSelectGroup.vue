<template>
  <div class="select-group">
    <slot></slot>
  </div>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
.select-group {
  display: flex;
  align-items: center;

  // Handle both original select components and new Shadcn-based ones
  ::v-deep(.select-wrap),
  ::v-deep([data-slot='select']) {
    .select,
    .select-trigger-wrapper,
    .select-custom-trigger {
      border-radius: 0;
      border-left-width: 0;
      border-right-width: 0;
    }

    & + .select-wrap,
    & + [data-slot='select'] {
      .select,
      .select-trigger-wrapper,
      .select-custom-trigger {
        border-left-width: 1px;
      }
    }

    &:hover {
      & + .select-wrap,
      & + [data-slot='select'] {
        .select,
        .select-trigger-wrapper,
        .select-custom-trigger {
          border-left-color: $themeColor;
        }
      }
    }

    &:first-child {
      .select,
      .select-trigger-wrapper,
      .select-custom-trigger {
        border-top-left-radius: $borderRadius;
        border-bottom-left-radius: $borderRadius;
        border-left-width: 1px;
      }
    }

    &:last-child {
      .select,
      .select-trigger-wrapper,
      .select-custom-trigger {
        border-top-right-radius: $borderRadius;
        border-bottom-right-radius: $borderRadius;
        border-right-width: 1px;
      }
    }
  }
}
</style>
