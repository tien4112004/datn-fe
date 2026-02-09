<template>
  <div class="ai-modification-panel">
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
          <div class="style-grid">
            <button
              v-for="style in artStyles"
              :key="style.value"
              class="style-chip"
              :class="{ active: selectedStyle === style.value }"
              @click="selectedStyle = style.value"
            >
              {{ style.label }}
            </button>
          </div>
        </div>

        <label class="toggle-row">
          <input type="checkbox" v-model="matchSlideTheme" class="toggle-checkbox" />
          <span>Match slide theme</span>
        </label>

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

        <div class="section-group">
          <div class="section-title">Layout</div>
          <div class="layout-row">
            <button
              v-for="layout in layoutTypes"
              :key="layout.value"
              class="layout-btn"
              :class="{ active: currentLayout === layout.value }"
              @click="handleLayoutSelect(layout.value)"
              :disabled="isProcessing"
            >
              <component :is="layout.icon" class="layout-btn-icon" />
              {{ layout.label }}
            </button>
          </div>
        </div>

        <div class="section-group">
          <div class="section-title">Split Slide</div>
          <div class="split-row">
            <Button class="split-btn" @click="handleSplit(2)" :disabled="isProcessing"> Split into 2 </Button>
            <Button class="split-btn" @click="handleSplit(3)" :disabled="isProcessing"> Split into 3 </Button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import Button from '@/components/Button.vue';
import { useSlidesStore } from '@/store';
import { useAIModificationState } from './AIModificationPanel/useAIModificationState';
import { aiModificationService } from '@/services/ai/modifications';
import {
  convertToSlide,
  selectRandomTemplate,
  selectTemplateById,
  updateImageSource,
} from '@/utils/slideLayout';
import type { SlideLayoutSchema } from '@/utils/slideLayout/types/schemas';
import type { PPTImageElement } from '@/types/slides';
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

const getViewport = () => ({
  width: slidesStore.viewportSize,
  height: slidesStore.viewportSize * slidesStore.viewportRatio,
});

async function schemaToSlide(schema: SlideLayoutSchema, slideId?: string) {
  const slide = currentSlide.value;
  const viewport = getViewport();
  const theme = slidesStore.theme;

  // Reuse existing template if possible, otherwise pick a random one
  let template;
  if (slide?.layout?.templateId && slide?.layout?.layoutType) {
    template = await selectTemplateById(slide.layout.layoutType, slide.layout.templateId);
  } else {
    template = await selectRandomTemplate(schema.type);
  }

  return convertToSlide(schema, viewport, theme, template, slideId);
}

function getCurrentImageSrc(): string | undefined {
  const el = currentSlide.value?.elements?.find((e) => e.type === 'image') as PPTImageElement | undefined;
  return el?.src;
}

// Local State
const chatInput = ref('');
const isProcessing = ref(false);
const refineMessage = ref('');
const refineType = ref('info'); // info, success, error
const imagePrompt = ref('');
const selectedStyle = ref('photorealistic');
const matchSlideTheme = ref(true);

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

const artStyles = [
  { value: 'photorealistic', label: 'Photorealistic' },
  { value: 'digital-art', label: 'Digital Art' },
  { value: 'minimalist', label: 'Minimalist' },
  { value: 'watercolor', label: 'Watercolor' },
  { value: 'oil-painting', label: 'Oil Painting' },
  { value: 'anime', label: 'Anime' },
  { value: 'cartoon', label: 'Cartoon' },
  { value: 'sketch', label: 'Sketch' },
  { value: 'abstract', label: 'Abstract' },
  { value: 'surreal', label: 'Surreal' },
];

const layoutTypes = [
  { label: 'List', value: 'LIST', icon: IconList },
  { label: 'Columns', value: 'TWO_COLUMN', icon: Columns },
  { label: 'Timeline', value: 'TIMELINE', icon: Grid },
  { label: 'Pyramid', value: 'PYRAMID', icon: Grid },
];

const currentLayout = computed(() => currentSlide.value?.layout?.layoutType || 'LIST');

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
        slideSchema: currentSlide.value?.layout?.schema,
        slideType: currentSlide.value?.layout?.layoutType,
        currentImageSrc: getCurrentImageSrc(),
      },
      parameters: {
        instruction: chatInput.value,
      },
    });

    if (result.success && result.data?.schema) {
      const newSlide = await schemaToSlide(result.data.schema as SlideLayoutSchema, currentSlide.value!.id);
      slidesStore.updateSlide(newSlide, currentSlide.value!.id);

      refineMessage.value = 'Content refined successfully!';
      refineType.value = 'success';
      chatInput.value = '';
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
      slideSchema: currentSlide.value?.layout?.schema,
      slideType: currentSlide.value?.layout?.layoutType,
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

  const element = currentContext.value.data as PPTImageElement;
  if (!element) return;

  isProcessing.value = true;

  try {
    const result = await aiModificationService.replaceElementImage({
      slideId: currentSlide.value!.id,
      elementId: element.id,
      description: imagePrompt.value,
      style: selectedStyle.value,
      matchSlideTheme: matchSlideTheme.value,
      slideSchema: currentSlide.value?.layout?.schema,
      slideType: currentSlide.value?.layout?.layoutType,
    });

    if (result.success && result.data?.imageUrl) {
      const updated = await updateImageSource(element, result.data.imageUrl);
      slidesStore.updateElement({
        id: element.id,
        props: { src: updated.src, clip: updated.clip },
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
        slideId: currentSlide.value?.id,
        slideSchema: currentSlide.value?.layout?.schema,
        slideType: currentSlide.value?.layout?.layoutType,
        currentImageSrc: getCurrentImageSrc(),
      },
      parameters: { targetType: type },
    });

    if (result.success && result.data?.schema) {
      const newSlide = await schemaToSlide(result.data.schema as SlideLayoutSchema, currentSlide.value!.id);
      slidesStore.updateSlide(newSlide, currentSlide.value!.id);
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
        slideId: currentSlide.value?.id,
        slideSchema: currentSlide.value?.layout?.schema,
        slideType: currentSlide.value?.layout?.layoutType,
        currentImageSrc: getCurrentImageSrc(),
      },
      parameters: { count },
    });

    if (result.success && Array.isArray(result.data?.schemas)) {
      const schemas = result.data.schemas as SlideLayoutSchema[];
      const slides = await Promise.all(schemas.map((s) => schemaToSlide(s)));
      slidesStore.replaceSlide(currentSlide.value!.id, slides);
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
}

.panel-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  @include overflow-overlay();
}

// Info messages
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

.context-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--presentation-muted-foreground);

  .hint-icon {
    width: 13px;
    height: 13px;
  }
}

// Quick action chips
.quick-actions-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 99px;
  border: 1px solid var(--presentation-border);
  background: var(--presentation-card);
  color: var(--presentation-foreground);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
    border-color: var(--presentation-primary);
    color: var(--presentation-primary);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .chip-icon {
    width: 13px;
    height: 13px;
  }
}

// Chat input
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

.feedback-message {
  font-size: 12px;
  padding: 6px 8px;
  border-radius: 4px;

  &.success {
    background: rgba(34, 197, 94, 0.1);
    color: #16a34a;
  }
  &.error {
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
  }
}

// Section groups (layout, split)
.section-group {
  padding-top: 12px;
  border-top: 1px solid var(--presentation-border);
}

.section-title {
  font-weight: 600;
  font-size: 11px;
  color: var(--presentation-muted-foreground);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

// Layout inline row
.layout-row {
  display: flex;
  gap: 6px;
}

.layout-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 8px 2px;
  border: 1px solid var(--presentation-border);
  border-radius: 6px;
  background: var(--presentation-card);
  color: var(--presentation-foreground);
  font-size: 10px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: var(--presentation-primary);
    color: var(--presentation-primary);
    background: rgba(0, 0, 0, 0.02);
  }

  &.active {
    border-color: var(--presentation-primary);
    background: rgba(37, 99, 235, 0.06);
    color: var(--presentation-primary);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .layout-btn-icon {
    width: 16px;
    height: 16px;
  }
}

// Split buttons
.split-row {
  display: flex;
  gap: 8px;

  .split-btn {
    flex: 1;
    justify-content: center;
  }
}

// Toggle row
.toggle-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--presentation-foreground);
  cursor: pointer;

  .toggle-checkbox {
    accent-color: var(--presentation-primary);
  }
}

// Image replacement
.image-preview {
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--presentation-border);

  .preview-img {
    width: 100%;
    height: auto;
    display: block;
    max-height: 120px;
    object-fit: cover;
  }
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;

  label {
    font-size: 11px;
    font-weight: 600;
    color: var(--presentation-muted-foreground);
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
}

.panel-input,
.panel-select {
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid var(--presentation-border);
  background: var(--presentation-input);
  font-size: 13px;
  color: var(--presentation-foreground);
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: var(--presentation-primary);
  }
}

// Art style grid
.style-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.style-chip {
  padding: 4px 10px;
  border-radius: 99px;
  border: 1px solid var(--presentation-border);
  background: var(--presentation-card);
  color: var(--presentation-foreground);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: var(--presentation-primary);
    color: var(--presentation-primary);
  }

  &.active {
    border-color: var(--presentation-primary);
    background: rgba(37, 99, 235, 0.06);
    color: var(--presentation-primary);
    font-weight: 600;
  }
}

.btn-icon {
  width: 14px;
  height: 14px;
  margin-right: 4px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
