<template>
  <div v-if="isLoading" class="permission-badge-loading"></div>
  <div v-else :class="['permission-badge', badgeClass]">
    <component :is="badgeIcon" class="permission-badge-icon" />
    <span>{{ badgeLabel }}</span>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { Eye, MessageSquare, Edit } from 'lucide-vue-next';

interface Props {
  permission: 'read' | 'comment' | 'edit';
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
});

const badgeConfig = {
  read: { label: 'Viewer', class: 'permission-badge-read', icon: Eye },
  comment: { label: 'Commenter', class: 'permission-badge-comment', icon: MessageSquare },
  edit: { label: 'Editor', class: 'permission-badge-edit', icon: Edit },
};

const badgeLabel = computed(() => badgeConfig[props.permission].label);
const badgeClass = computed(() => badgeConfig[props.permission].class);
const badgeIcon = computed(() => badgeConfig[props.permission].icon);
</script>

<style lang="scss" scoped>
.permission-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 9999px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 500;
}

.permission-badge-icon {
  width: 12px;
  height: 12px;
}

.permission-badge-read {
  background-color: #f3f4f6;
  color: #374151;
}

.permission-badge-comment {
  background-color: #dbeafe;
  color: #1e40af;
}

.permission-badge-edit {
  background-color: #d1fae5;
  color: #065f46;
}

.permission-badge-loading {
  height: 20px;
  width: 64px;
  border-radius: 4px;
  background-color: #e5e7eb;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
