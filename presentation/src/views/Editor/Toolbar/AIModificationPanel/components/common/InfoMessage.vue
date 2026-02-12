<template>
  <div class="info-message">
    <component :is="icon" class="info-icon" />
    <span>{{ message }}</span>
  </div>
</template>

<script lang="ts" setup>
import { Info as IconInfo } from 'lucide-vue-next';
import type { Component } from 'vue';

interface Props {
  icon?: Component;
  message: string;
}

withDefaults(defineProps<Props>(), {
  icon: () => IconInfo,
});
</script>

<style lang="scss" scoped>
.info-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  color: var(--presentation-muted-foreground);
  font-size: 13px;
  background: var(--presentation-input);
  border-radius: 6px;

  .info-icon {
    width: 15px;
    height: 15px;
    flex-shrink: 0;
  }
}
</style>
