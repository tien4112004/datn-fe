<template>
  <div class="empty-thumbnails">
    <div class="empty-message">{{ $t('emptyState.noSlides.title') }}</div>
  </div>
</template>

<script lang="ts" setup>
// Empty state for thumbnails sidebar
</script>

<style lang="scss" scoped>
.empty-thumbnails {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--presentation-background);
  border-right: 1px solid var(--presentation-border);
  padding: 16px;
}

.empty-message {
  font-size: 12px;
  color: var(--presentation-foreground);
  opacity: 0.5;
  text-align: center;
}
</style>
