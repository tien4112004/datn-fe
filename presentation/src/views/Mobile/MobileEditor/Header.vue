<template>
  <div class="mobile-editor-header">
    <div class="history">
      <div class="history-item" :class="{ disable: !canUndo }" @click.stop="undo()">
        <IconBack />
        <span>{{ $t('header.edit.undo') }}</span>
      </div>
      <div class="history-item" :class="{ disable: !canRedo }" @click.stop="redo()">
        <IconNext /> <span>{{ $t('header.edit.redo') }}</span>
      </div>
    </div>
    <div class="back" @click="changeMode('preview')">
      <IconLogout /><span>{{ $t('header.edit.exitEdit') }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useSnapshotStore } from '@/store';
import type { Mode } from '@/types/mobile';
import useHistorySnapshot from '@/hooks/useHistorySnapshot';

defineProps<{
  changeMode: (mode: Mode) => void;
}>();

const { canUndo, canRedo } = storeToRefs(useSnapshotStore());
const { redo, undo } = useHistorySnapshot();
</script>

<style lang="scss" scoped>
.mobile-editor-header {
  height: 50px;
  background-color: var(--presentation-background);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 18px;
  font-size: 13px;
  box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 2;
}
.history {
  display: flex;
  justify-content: center;
  align-items: center;
}
.history-item {
  margin-right: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;

  &.disable {
    opacity: 0.5;
  }
}

.back {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}
</style>
