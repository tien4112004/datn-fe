<template>
  <div class="chat-interface">
    <div class="chat-input-wrapper">
      <textarea
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
        class="chat-textarea"
        :placeholder="placeholder"
        :disabled="isProcessing"
        @keydown.enter.prevent="$emit('submit')"
      ></textarea>
      <button class="send-button" @click="$emit('submit')" :disabled="!modelValue.trim() || isProcessing">
        <IconSend v-if="!isProcessing" />
        <div v-else class="spinner"></div>
      </button>
    </div>
    <FeedbackMessage v-if="feedback" :type="feedback.type">
      {{ feedback.message }}
    </FeedbackMessage>
  </div>
</template>

<script lang="ts" setup>
import { Send as IconSend } from 'lucide-vue-next';
import FeedbackMessage from './FeedbackMessage.vue';

interface Props {
  modelValue: string;
  placeholder?: string;
  isProcessing?: boolean;
  feedback?: { message: string; type: 'info' | 'success' | 'error' } | null;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
  (e: 'submit'): void;
}

withDefaults(defineProps<Props>(), {
  placeholder: 'Type your instruction...',
  isProcessing: false,
  feedback: null,
});

defineEmits<Emits>();
</script>

<style lang="scss" scoped>
.chat-interface {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.chat-input-wrapper {
  position: relative;
}

.chat-textarea {
  width: 100%;
  min-height: 56px;
  padding: 8px 36px 8px 8px;
  border-radius: 6px;
  border: 1px solid var(--presentation-border);
  background: var(--presentation-input);
  resize: none;
  font-family: inherit;
  font-size: 13px;
  color: var(--presentation-foreground);
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: var(--presentation-primary);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.send-button {
  position: absolute;
  bottom: 6px;
  right: 6px;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: var(--presentation-primary);
  color: white;
  border: none;
  cursor: pointer;
  padding: 0;

  svg {
    width: 14px;
    height: 14px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
