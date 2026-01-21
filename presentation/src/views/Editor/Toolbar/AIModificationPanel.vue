<template>
  <div class="ai-modification-panel">
    <!-- Context Badge -->
    <div class="context-section">
      <ContextBadge :context="currentContext" />
    </div>

    <Divider />

    <!-- Category Tabs -->
    <Tabs
      :value="activeCategory"
      @update:value="(val: string | number) => (activeCategory = String(val))"
      :tabs="tabs"
      card
      class="category-tabs"
    />

    <div class="panel-content">
      <!-- TAP 1: REFINE (Chat + Chips) -->
      <div v-if="activeCategory === 'refine'" class="tab-content refine-tab">
        <!-- Multi-select message -->
        <div v-if="currentContext.type === 'elements'" class="info-message">
          <IconInfo class="info-icon" />
          <span>Select a single element to use AI modifications</span>
        </div>

        <!-- Text Element Context -->
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

        <!-- Slide Context (existing) -->
        <template v-else-if="currentContext.type === 'slide'">
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
        </template>
      </div>

      <!-- TAP 2: STRUCTURE -->
      <div v-if="activeCategory === 'structure'" class="tab-content structure-tab">
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

        <div class="action-row">
          <span class="row-label">Shuffle Template</span>
          <Button size="small" variant="outline" @click="handleShuffle" :disabled="isProcessing">
            <IconShuffle class="btn-icon" /> Shuffle
          </Button>
        </div>

        <Divider />

        <div class="section-title">Split Slide</div>
        <div class="split-buttons">
          <Button class="split-btn" @click="handleSplit(2)" :disabled="isProcessing"> Split into 2 </Button>
          <Button class="split-btn" @click="handleSplit(3)" :disabled="isProcessing"> Split into 3 </Button>
        </div>
      </div>

      <!-- TAP 3: VISUALS -->
      <div v-if="activeCategory === 'visuals'" class="tab-content visuals-tab">
        <!-- Image Element Context -->
        <template v-if="currentContext.type === 'element' && currentContext.elementType === 'image'">
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

        <!-- Slide Context (existing) -->
        <template v-else-if="currentContext.type === 'slide'">
          <div class="section-title">Image Generation</div>
          <div class="input-group">
            <label>Description</label>
            <input v-model="imagePrompt" class="panel-input" placeholder="Describe the image..." />
          </div>
          <div class="input-group">
            <label>Art Style</label>
            <select v-model="selectedStyle" class="panel-select">
              <option value="photorealistic">Photorealistic</option>
              <option value="minimalist">Minimalist Vector</option>
              <option value="watercolor">Watercolor</option>
              <option value="3d-render">3D Render</option>
              <option value="corporate">Corporate Flat</option>
            </select>
          </div>
          <Button
            variant="primary"
            fullWidth
            @click="handleGenerateImage"
            :disabled="isProcessing || !imagePrompt"
          >
            <IconImage class="btn-icon" /> Generate Image
          </Button>

          <Divider class="spacer" />

          <div class="section-title">Global Theme</div>
          <div class="input-group">
            <label>Mood / Vibe</label>
            <select v-model="selectedMood" class="panel-select">
              <option value="professional">Professional</option>
              <option value="creative">Creative / Playful</option>
              <option value="dark-modern">Dark Modern</option>
              <option value="luxury">Luxury / Elegant</option>
              <option value="nature">Nature / Eco</option>
            </select>
          </div>
          <Button variant="outline" fullWidth @click="handleSuggestTheme" :disabled="isProcessing">
            <IconPalette class="btn-icon" /> Update Theme
          </Button>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import Tabs from '@/components/Tabs.vue';
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
  Wand2,
  LayoutList,
  Columns,
  Image as IconImage,
  Palette as IconPalette,
  Send as IconSend,
  Shuffle as IconShuffle,
  Grid,
  List as IconList,
  Info as IconInfo,
  Type as IconText,
} from 'lucide-vue-next';
import { selectNextTemplate } from '@/utils/slideLayout'; // Ensure this is available

// Icons mapping for layouts
const slidesStore = useSlidesStore();
const { currentSlide } = storeToRefs(slidesStore);

// Local State
const activeCategory = ref('refine');
const chatInput = ref('');
const isProcessing = ref(false);
const refineMessage = ref('');
const refineType = ref('info'); // info, success, error
const imagePrompt = ref('');
const selectedStyle = ref('photorealistic');
const selectedMood = ref('professional');

// Context logic
const { currentContext } = useAIModificationState();

// Tabs Config
const tabs = [
  { key: 'refine', label: 'Refine' },
  { key: 'structure', label: 'Structure' },
  { key: 'visuals', label: 'Visuals' },
];

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

// 1. Refine (Chat & Chips)
const handleQuickAction = (action: any) => {
  chatInput.value = action.instruction;
  handleChatSubmit(); // Auto-submit for chips? Or let user edit?
  // Design says "Clicking a chip immediately sends that intent"
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
      // Update the slide in the store
      // Assuming result.data contains { content: ... } or the full slide structure depending on API
      // For now, let's assume it returns a partial or full object to merge.
      // We need a way to update the slide "intelligently".

      // If the API returns the updated 'data' object for the slide:
      if (result.data) {
        // Update store directly (assuming we have a store action or we patch it)
        // This requires useUpdateSlides mutation or direct store manipulation if permitted
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

// Handle text element refinement
const handleRefineElementText = async () => {
  if (!chatInput.value.trim() || isProcessing.value) return;
  if (currentContext.value.type !== 'element' || currentContext.value.elementType !== 'text') return;

  const element = currentContext.value.data;
  if (!element || !element.content) return;

  isProcessing.value = true;
  refineMessage.value = '';

  try {
    // Extract plain text (same as existing AI feature)
    const plainText = htmlToText(element.content);

    // Call AI service
    const result = await aiModificationService.refineElementText({
      slideId: currentSlide.value!.id,
      elementId: element.id,
      currentText: plainText,
      instruction: chatInput.value,
    });

    if (result.success && result.data?.refinedText) {
      // Use emitRichTextCommand to update (preserves formatting!)
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

// Handle image element replacement
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
      // Update only this image element
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

// 2. Structure (Layout & Shuffle)
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
      // The API should return the new Layout Schema (type + data)
      // We need to re-render using convertToSlide logic ideally,
      // but if the backend returns the mapped data, we can just update the slide type and data
      // and let the frontend re-render or call a helper.

      // IMPORTANT: Changing layout type usually requires re-running convertToSlide
      // to get the new 'elements' array positioned correctly.
      // We'll rely on a store action/mutation that handles this if it exists,
      // or we need to import convertToSlide here (or in a hook).

      // For this implementation, let's assume we update the data and triggers a re-render
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

const handleShuffle = async () => {
  // Client-side shuffle using existing utility
  if (!currentSlide.value) return;

  // @ts-ignore
  const template = await selectNextTemplate(currentSlide.value.type);

  // We need to re-run convertToSlide with the new template
  // This part involves importing convertToSlide and dependencies again.
  // For now, we'll placeholder this or call a hook if available.
  console.log('Shuffle to template:', template.id);

  // TODO: Implement the actual shuffle re-render logic
  // (This usually resides in a hook like useSlideTransformer)
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
      // Replace current slide with N new slides
      // @ts-ignore
      slidesStore.replaceSlide(currentSlide.value!.id, (result.data as any).slides);
    }
  } finally {
    isProcessing.value = false;
  }
};

// 3. Visuals (Image & Theme)
const handleGenerateImage = async () => {
  // Implementation for image generation (call API -> update slide image src)
  isProcessing.value = true;
  try {
    const result = await aiModificationService.processModification({
      action: 'generate-image',
      context: {
        type: 'slide',
        slideId: currentSlide.value?.id,
      },
      parameters: {
        description: imagePrompt.value,
        style: selectedStyle.value,
      },
    });

    if (result.success && (result.data as any)?.url) {
      // Update image element in slide
      // Need to find the main image element
      // For now just console log as real implementation requires iterating elements
      console.log('New image URL:', (result.data as any).url);
    }
  } finally {
    isProcessing.value = false;
  }
};

const handleSuggestTheme = async () => {
  isProcessing.value = true;
  try {
    await aiModificationService.processModification({
      action: 'suggest-theme',
      context: { type: 'slide' },
      parameters: { mood: selectedMood.value },
    });
    // Theme update usually affects global presentation state
  } finally {
    isProcessing.value = false;
  }
};

// Start logic
watch(
  currentSlide,
  (newSlide) => {
    if (newSlide) {
      // Auto-fill context
      // @ts-ignore
      if (newSlide.data?.image?.prompt) {
        // @ts-ignore
        imagePrompt.value = newSlide.data.image.prompt;
        // @ts-ignore
      } else {
        // @ts-ignore
        imagePrompt.value = newSlide.title || '';
      }
    }
  },
  { immediate: true }
);
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

.category-tabs {
  padding: 0 1rem;
  margin-bottom: 0.5rem;

  :deep(.tabs-list) {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
  }
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

// Refine Tab Styles
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
  border-radius: 99px; // Pill shape
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

.chat-interface {
  flex: 1;
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

// Structure Tab Styles
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

.action-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .row-label {
    font-size: 0.9rem;
    font-weight: 500;
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

// Visuals Tab Styles
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

.spacer {
  margin: 1.5rem 0;
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
