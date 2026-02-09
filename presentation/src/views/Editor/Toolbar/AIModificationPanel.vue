<template>
  <div class="ai-modification-panel">
    <!-- Context Badge -->
    <div class="context-section">
      <ContextBadge :context="currentContext" />
    </div>

    <Divider />

    <div class="panel-content">
      <!-- Multi-select: show info message -->
      <div v-if="currentContext.type === 'elements'" class="info-message">
        <IconInfo class="info-icon" />
        <span>Select a single element to use AI modifications</span>
      </div>

      <!-- Text Element: refine text -->
      <template v-else-if="currentContext.type === 'element' && currentContext.elementType === 'text'">
        <div class="context-hint">
          <IconText class="hint-icon" />
          <span>Refining selected text element</span>
        </div>

        <div class="quick-actions-row">
          <button
            v-for="action in textQuickActions"
            :key="action.label"
            class="chip-button"
            @click="
              () => {
                chatInput = action.instruction;
                handleRefineElementText();
              }
            "
            :disabled="isProcessing"
          >
            <component :is="action.icon" class="chip-icon" />
            {{ action.label }}
          </button>
        </div>

        <div class="chat-interface">
          <div class="chat-input-wrapper">
            <textarea
              v-model="chatInput"
              class="chat-textarea"
              placeholder="Describe how to modify this text..."
              :disabled="isProcessing"
              @keydown.enter.prevent="handleRefineElementText"
            ></textarea>
            <button
              class="send-button"
              @click="handleRefineElementText"
              :disabled="!chatInput.trim() || isProcessing"
            >
              <IconSend v-if="!isProcessing" />
              <div v-else class="spinner"></div>
            </button>
          </div>
          <div v-if="refineMessage" class="feedback-message" :class="refineType">
            {{ refineMessage }}
          </div>
        </div>
      </template>

      <!-- Image Element: replace image -->
      <template v-else-if="currentContext.type === 'element' && currentContext.elementType === 'image'">
        <div class="section-title">Replace This Image</div>

        <div class="image-preview">
          <img :src="currentContext.data.src" alt="Current image" class="preview-img" />
        </div>

        <div class="input-group">
          <label>New Image Description</label>
          <input v-model="imagePrompt" class="panel-input" placeholder="Describe the new image..." />
        </div>

        <div class="input-group">
          <label>Art Style</label>
          <select v-model="selectedStyle" class="panel-select">
            <option value="photorealistic">Photorealistic</option>
            <option value="minimalist">Minimalist Vector</option>
            <option value="3d-render">3D Render</option>
          </select>
        </div>

        <Button
          variant="primary"
          fullWidth
          @click="handleReplaceElementImage"
          :disabled="isProcessing || !imagePrompt"
        >
          <IconImage class="btn-icon" /> Replace Image
        </Button>
      </template>

      <!-- Other element types: no actions available -->
      <div v-else-if="currentContext.type === 'element'" class="info-message">
        <IconInfo class="info-icon" />
        <span>No AI actions available for this element type</span>
      </div>

      <!-- Slide context: refine + layout + split -->
      <template v-else>
        <div class="quick-actions-row">
          <button
            v-for="action in quickActions"
            :key="action.label"
            class="chip-button"
            @click="handleQuickAction(action)"
            :disabled="isProcessing"
          >
            <component :is="action.icon" class="chip-icon" />
            {{ action.label }}
          </button>
        </div>

        <div class="chat-interface">
          <div class="chat-input-wrapper">
            <textarea
              v-model="chatInput"
              class="chat-textarea"
              placeholder="Describe how to change this slide..."
              :disabled="isProcessing"
              @keydown.enter.prevent="handleChatSubmit"
            ></textarea>
            <button
              class="send-button"
              @click="handleChatSubmit"
              :disabled="!chatInput.trim() || isProcessing"
            >
              <IconSend v-if="!isProcessing" />
              <div v-else class="spinner"></div>
            </button>
          </div>
          <div v-if="refineMessage" class="feedback-message" :class="refineType">
            {{ refineMessage }}
          </div>
        </div>

        <Divider />

        <div class="section-title">Layout Type</div>
        <div class="layout-grid">
          <div
            v-for="layout in layoutTypes"
            :key="layout.value"
            class="layout-item"
            :class="{ active: currentLayout === layout.value }"
            @click="handleLayoutSelect(layout.value)"
          >
            <component :is="layout.icon" class="layout-icon" />
            <span class="layout-name">{{ layout.label }}</span>
          </div>
        </div>

        <Divider />

        <div class="section-title">Split Slide</div>
        <div class="split-buttons">
          <Button class="split-btn" @click="handleSplit(2)" :disabled="isProcessing"> Split into 2 </Button>
          <Button class="split-btn" @click="handleSplit(3)" :disabled="isProcessing"> Split into 3 </Button>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import Button from '@/components/Button.vue';
import Divider from '@/components/Divider.vue';
import ContextBadge from './AIModificationPanel/ContextBadge.vue';
import { useSlidesStore } from '@/store';
import { useAIModificationState } from './AIModificationPanel/useAIModificationState';
import { aiModificationService } from '@/services/ai/modifications';
import emitter, { EmitterEvents } from '@/utils/emitter';
import { htmlToText } from '@/utils/common';
import {
  FileText,
  Maximize2,
  Minimize2,
  CheckCircle,
  Columns,
  Image as IconImage,
  Send as IconSend,
  Grid,
  List as IconList,
  Info as IconInfo,
  Type as IconText,
} from 'lucide-vue-next';

const slidesStore = useSlidesStore();
const { currentSlide } = storeToRefs(slidesStore);

// Local State
const chatInput = ref('');
const isProcessing = ref(false);
const refineMessage = ref('');
const refineType = ref('info'); // info, success, error
const imagePrompt = ref('');
const selectedStyle = ref('photorealistic');

// Context logic
const { currentContext } = useAIModificationState();

// Quick Actions Configuration
const quickActions = [
  { label: 'Shorten', icon: Minimize2, instruction: 'Shorten the text content, keeping key points.' },
  { label: 'Expand', icon: Maximize2, instruction: 'Expand on these points with more detail.' },
  { label: 'Grammar', icon: CheckCircle, instruction: 'Fix grammar and spelling errors.' },
  { label: 'Tone', icon: FileText, instruction: 'Make the tone more professional and engaging.' },
];

// Text Element Quick Actions
const textQuickActions = [
  { label: 'Fix Grammar', icon: CheckCircle, instruction: 'Fix grammar and spelling errors in this text.' },
  { label: 'Shorten', icon: Minimize2, instruction: 'Make this text more concise.' },
  { label: 'Expand', icon: Maximize2, instruction: 'Expand this text with more detail.' },
  { label: 'Formal', icon: FileText, instruction: 'Rewrite this text in a more formal tone.' },
];

const layoutTypes = [
  { label: 'List', value: 'LIST', icon: IconList },
  { label: 'Columns', value: 'TWO_COLUMN', icon: Columns },
  { label: 'Timeline', value: 'TIMELINE', icon: Grid },
  { label: 'Pyramid', value: 'PYRAMID', icon: Grid },
];

const currentLayout = computed(() => currentSlide.value?.type || 'LIST');

// --- Handlers ---

const handleQuickAction = (action: any) => {
  chatInput.value = action.instruction;
  handleChatSubmit();
};

const handleChatSubmit = async () => {
  if (!chatInput.value.trim() || isProcessing.value) return;

  isProcessing.value = true;
  refineMessage.value = '';

  try {
    const result = await aiModificationService.processModification({
      action: 'refine-content',
      context: {
        type: 'slide',
        slideId: currentSlide.value?.id,
        slideContent: currentSlide.value,
      },
      parameters: {
        instruction: chatInput.value,
      },
    });

    if (result.success && result.data) {
      if (result.data) {
        const updatedSlide = { ...currentSlide.value, ...result.data };
        // @ts-ignore
        slidesStore.updateSlide(updatedSlide, currentSlide.value!.id);

        refineMessage.value = 'Content refined successfully!';
        refineType.value = 'success';
        chatInput.value = '';
      }
    } else {
      throw new Error(result.error || 'Failed to refine content');
    }
  } catch (e: any) {
    refineMessage.value = e.message;
    refineType.value = 'error';
  } finally {
    isProcessing.value = false;
  }
};

const handleRefineElementText = async () => {
  if (!chatInput.value.trim() || isProcessing.value) return;
  if (currentContext.value.type !== 'element' || currentContext.value.elementType !== 'text') return;

  const element = currentContext.value.data;
  if (!element || !element.content) return;

  isProcessing.value = true;
  refineMessage.value = '';

  try {
    const plainText = htmlToText(element.content);

    const result = await aiModificationService.refineElementText({
      slideId: currentSlide.value!.id,
      elementId: element.id,
      currentText: plainText,
      instruction: chatInput.value,
    });

    if (result.success && result.data?.refinedText) {
      emitter.emit(EmitterEvents.RICH_TEXT_COMMAND, {
        action: { command: 'replace', value: result.data.refinedText },
      });

      refineMessage.value = 'Text refined successfully!';
      refineType.value = 'success';
      chatInput.value = '';
    } else {
      throw new Error(result.error || 'Failed to refine text');
    }
  } catch (error: any) {
    refineMessage.value = error.message || 'Failed to refine text';
    refineType.value = 'error';
  } finally {
    isProcessing.value = false;
  }
};

const handleReplaceElementImage = async () => {
  if (!imagePrompt.value || isProcessing.value) return;
  if (currentContext.value.type !== 'element' || currentContext.value.elementType !== 'image') return;

  const element = currentContext.value.data;
  if (!element) return;

  isProcessing.value = true;

  try {
    const result = await aiModificationService.replaceElementImage({
      slideId: currentSlide.value!.id,
      elementId: element.id,
      description: imagePrompt.value,
      style: selectedStyle.value,
    });

    if (result.success && result.data?.imageUrl) {
      slidesStore.updateElement({
        id: element.id,
        props: { src: result.data.imageUrl },
      });

      imagePrompt.value = '';
    } else {
      throw new Error(result.error || 'Failed to replace image');
    }
  } catch (error: any) {
    console.error('Failed to replace image:', error);
  } finally {
    isProcessing.value = false;
  }
};

const handleLayoutSelect = async (type: string) => {
  if (type === currentLayout.value) return;
  isProcessing.value = true;
  try {
    const result = await aiModificationService.processModification({
      action: 'transform-layout',
      context: {
        type: 'slide',
        slideContent: currentSlide.value,
      },
      parameters: { targetType: type },
    });

    if (result.success && result.data) {
      const updatedSlide = { ...currentSlide.value, ...result.data };
      // @ts-ignore
      slidesStore.updateSlide(updatedSlide, currentSlide.value!.id);
    }
  } catch (e) {
    console.error(e);
  } finally {
    isProcessing.value = false;
  }
};

const handleSplit = async (count: number) => {
  isProcessing.value = true;
  try {
    const result = await aiModificationService.processModification({
      action: 'expand-slide',
      context: {
        type: 'slide',
        slideContent: currentSlide.value,
      },
      parameters: { count },
    });

    if (result.success && result.data && Array.isArray((result.data as any).slides)) {
      // @ts-ignore
      slidesStore.replaceSlide(currentSlide.value!.id, (result.data as any).slides);
    }
  } finally {
    isProcessing.value = false;
  }
};
</script>

<style lang="scss" scoped>
.ai-modification-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0 0 1rem 0;
}

.context-section {
  padding: 1rem 1rem 0.5rem;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  color: var(--presentation-muted-foreground);
  font-size: 0.85rem;

  .info-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
}

.context-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--presentation-muted-foreground);

  .hint-icon {
    width: 14px;
    height: 14px;
  }
}

// Quick Actions
.quick-actions-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chip-button {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.8rem;
  border-radius: 99px;
  border: 1px solid var(--presentation-border);
  background: var(--presentation-input-bg);
  color: var(--presentation-foreground);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--presentation-hover);
    border-color: var(--presentation-primary);
    color: var(--presentation-primary);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .chip-icon {
    width: 14px;
    height: 14px;
  }
}

// Chat
.chat-interface {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.chat-input-wrapper {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
}

.chat-textarea {
  flex: 1;
  min-height: 80px;
  padding: 0.6rem;
  border-radius: 8px;
  border: 1px solid var(--presentation-border);
  background: var(--presentation-input-bg);
  resize: none;
  font-family: inherit;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: var(--presentation-primary);
  }
}

.send-button {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--presentation-primary);
  color: white;
  border: none;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
}

.feedback-message {
  font-size: 0.85rem;
  padding: 0.5rem;
  border-radius: 4px;

  &.success {
    background: rgba(var(--success-rgb), 0.1);
    color: var(--success);
  }
  &.error {
    background: rgba(var(--error-rgb), 0.1);
    color: var(--error);
  }
}

// Layout
.layout-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.layout-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem;
  border: 1px solid var(--presentation-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--presentation-primary);
    background: var(--presentation-hover);
  }

  &.active {
    border-color: var(--presentation-primary);
    background: rgba(var(--primary-rgb), 0.05);
    color: var(--presentation-primary);
  }

  .layout-icon {
    width: 24px;
    height: 24px;
  }

  .layout-name {
    font-size: 0.8rem;
  }
}

.split-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  .split-btn {
    width: 100%;
    justify-content: center;
  }
}

// Image replacement
.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 0.8rem;

  label {
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--presentation-muted-foreground);
  }
}

.panel-input,
.panel-select {
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid var(--presentation-border);
  background: var(--presentation-input-bg);
}

.section-title {
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.8rem;
}

.btn-icon {
  width: 16px;
  height: 16px;
  margin-right: 0.4rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
