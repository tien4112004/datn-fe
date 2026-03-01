import { defineStore } from 'pinia';
import { omit } from 'lodash';
import type {
  Slide,
  SlideTheme,
  PPTElement,
  PPTAnimation,
  SlideTemplate,
  PPTTextElement,
  PageNumberSettings,
  PageNumberPosition,
} from '@/types/slides';
import { editSlideContent, editCombinedListContent } from '@/utils/slideLayout/editing/contentEditor';

/**
 * Cleans ProsemirrorEditor HTML output, keeping only <strong> and <em> tags.
 * Removes all wrapper elements, styling, and other formatting.
 *
 * Similar to htmlToText but preserves semantic formatting.
 *
 * Examples:
 * - `<p><span style="...">text</span></p>` → `text`
 * - `<p><strong>bold</strong> text</p>` → `<strong>bold</strong> text`
 * - `<p><span style="color: red;"><strong>bold</strong></span></p>` → `<strong>bold</strong>`
 * - `<p><u>underline</u></p>` → `underline` (u tag removed)
 */
function cleanProsemirrorHTML(html: string): string {
  if (!html || typeof html !== 'string') {
    return html;
  }

  // Create a temporary DOM element to parse HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // Extract text content while preserving only <strong> and <em>
  const cleanContent = (node: Node): string => {
    let result = '';

    for (let child of node.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        // Text nodes - preserve as-is
        result += (child as Text).textContent || '';
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const element = child as Element;
        const tag = element.tagName.toLowerCase();

        // Keep ONLY strong and em, reconstruct them without attributes
        if (tag === 'strong' || tag === 'b') {
          result += '<strong>' + cleanContent(element) + '</strong>';
        } else if (tag === 'em' || tag === 'i') {
          result += '<em>' + cleanContent(element) + '</em>';
        } else if (tag === 'br') {
          result += '<br>';
        } else {
          // For all other tags (p, span, u, mark, etc.), just process contents
          result += cleanContent(child);
        }
      }
    }

    return result;
  };

  const cleaned = cleanContent(temp).trim();

  // Remove trailing breaks
  return cleaned.replace(/<br>\s*$/, '');
}

interface RemovePropData {
  id: string;
  propName: string | string[];
}

interface UpdateElementData {
  id: string | string[];
  props: Partial<PPTElement>;
  slideId?: string;
}

interface FormatedAnimation {
  animations: PPTAnimation[];
  autoNext: boolean;
}

export interface SlidesState {
  title: string;
  theme: SlideTheme;
  slides: Slide[];
  slideIndex: number;
  viewportSize: number;
  viewportRatio: number;
  templates: SlideTemplate[];
  pageNumberSettings: PageNumberSettings;
}

/**
 * Synchronizes element content changes back to the enriched schema.
 * Maintains schema as source of truth while allowing UI edits.
 *
 * @param slide The slide being edited
 * @param elementId The element that was modified
 * @param props The properties that changed
 */
function syncElementToSchema(slide: Slide, elementId: string, props: Partial<PPTElement>): void {
  // Skip if slide doesn't have schema (manual slides)
  if (!slide.layout?.schema || !slide.layout?.elementMappings) {
    console.log('[Schema Sync] ⊘ Skipped - no schema or mappings for element', elementId);
    return;
  }

  // Extract text content from props
  let newContent: string | undefined;

  if ('content' in props && typeof props.content === 'string') {
    // TextElement update
    newContent = props.content;
  } else if ('text' in props && props.text && typeof props.text === 'object' && 'content' in props.text) {
    // ShapeElement update
    newContent = props.text.content;
  }

  if (!newContent) {
    console.log('[Schema Sync] ⊘ Skipped - no text content to sync for element', elementId);
    return; // No content to sync
  }

  console.log('[Schema Sync] Syncing content for element:', elementId);
  console.log('[Schema Sync] Content length:', newContent.length);
  console.log('[Schema Sync] Content preview (before cleaning):', newContent.substring(0, 100));

  // Clean ProsemirrorEditor HTML to remove wrapper elements
  // This preserves semantic formatting (bold, italic) while removing bloat
  const cleanedContent = cleanProsemirrorHTML(newContent);

  console.log('[Schema Sync] Cleaned content length:', cleanedContent.length);
  console.log('[Schema Sync] Cleaned content:', cleanedContent.substring(0, 100));

  // 🔥 NEW: Detect and handle combined list elements
  if (elementId.includes('+')) {
    console.log('[Schema Sync] → Detected combined list element (compound ID)');

    editCombinedListContent(slide, elementId, cleanedContent)
      .then((updatedSchema) => {
        if (updatedSchema && slide.layout) {
          slide.layout.schema = updatedSchema;
          console.log('[Schema Sync] ✓ Combined list schema updated successfully');
        } else {
          console.error('[Schema Sync] ✗ Failed to update combined list');
        }
      })
      .catch((error) => {
        console.error('[Schema Sync] ✗ Error updating combined list:', error);
      });

    return;
  }

  // Original single-item update logic
  const updatedSchema = editSlideContent(slide, elementId, cleanedContent);

  if (updatedSchema) {
    // Update schema (Vue reactivity handles re-rendering)
    slide.layout.schema = updatedSchema;
    console.log('[Schema Sync] ✓ Schema updated successfully');
  } else {
    console.error('[Schema Sync] ✗ Failed - editSlideContent returned null');
  }
}

function getPageNumberPosition(
  position: PageNumberPosition,
  viewportSize: number,
  viewportRatio: number
): { left: number; top: number } {
  const width = 50;
  const height = 30;
  const margin = 20;
  const slideWidth = viewportSize;
  const slideHeight = viewportSize * viewportRatio;

  const positions: Record<PageNumberPosition, { left: number; top: number }> = {
    'top-left': { left: margin, top: margin },
    'top-center': { left: (slideWidth - width) / 2, top: margin },
    'top-right': { left: slideWidth - width - margin, top: margin },
    'bottom-left': { left: margin, top: slideHeight - height - margin },
    'bottom-center': { left: (slideWidth - width) / 2, top: slideHeight - height - margin },
    'bottom-right': { left: slideWidth - width - margin, top: slideHeight - height - margin },
  };

  return positions[position];
}

function createPageNumberElement(
  pageNumber: number,
  position: PageNumberPosition,
  viewportSize: number,
  viewportRatio: number,
  theme: SlideTheme
): PPTTextElement {
  const pos = getPageNumberPosition(position, viewportSize, viewportRatio);
  return {
    type: 'text' as const,
    lock: true,
    id: `el-${Date.now()}-${Math.random()}`,
    left: pos.left,
    top: pos.top,
    width: 50,
    height: 30,
    content: pageNumber.toString(),
    rotate: 0,
    textType: 'pageNumber' as const,
    defaultFontName: theme.fontName,
    defaultColor: theme.fontColor,
    vertical: false,
  };
}

export const useSlidesStore = defineStore('slides', {
  state: (): SlidesState => ({
    title: 'Untitled Presentation', // Slide title
    theme: {
      themeColors: ['#5b9bd5', '#ed7d31', '#a5a5a5', '#ffc000', '#4472c4', '#70ad47'],
      fontColor: '#333',
      fontName: 'Roboto',
      backgroundColor: '#fff',
      shadow: {
        h: 3,
        v: 3,
        blur: 2,
        color: '#808080',
      },
      outline: {
        width: 2,
        color: '#525252',
        style: 'solid',
      },
      titleFontColor: '#333',
      titleFontName: 'Roboto',
    }, // Theme style
    slides: [], // Slide page data
    slideIndex: 0, // Current page index
    viewportSize: 1000, // Viewport width base
    viewportRatio: 0.5625, // Viewport ratio, default 16:9
    templates: [
      {
        name: 'Red Universal',
        id: 'template_1',
        layout: 'title',
        containers: {},
      },
      {
        name: 'Blue Universal',
        id: 'template_2',
        layout: 'title',
        containers: {},
      },
      {
        name: 'Purple Universal',
        id: 'template_3',
        layout: 'title',
        containers: {},
      },
      {
        name: 'Morandi Color Scheme',
        id: 'template_4',
        layout: 'title',
        containers: {},
      },
    ], // Templates
    pageNumberSettings: {
      enabled: false,
      position: 'bottom-right',
      skipTitlePage: true,
    },
  }),

  getters: {
    currentSlide(state) {
      return state.slides[state.slideIndex];
    },

    currentSlideAnimations(state) {
      const currentSlide = state.slides[state.slideIndex];
      if (!currentSlide?.animations) return [];

      const els = currentSlide.elements;
      const elIds = els.map((el) => el.id);
      return currentSlide.animations.filter((animation) => elIds.includes(animation.elId));
    },

    // Formatted current page animations
    // Merge items with trigger condition "with previous animation" to the same position in the sequence
    // Add automatic downward execution mark to the previous item of items with trigger condition "after previous animation"
    formatedAnimations(state) {
      const currentSlide = state.slides[state.slideIndex];
      if (!currentSlide?.animations) return [];

      const els = currentSlide.elements;
      const elIds = els.map((el) => el.id);
      const animations = currentSlide.animations.filter((animation) => elIds.includes(animation.elId));

      const formatedAnimations: FormatedAnimation[] = [];
      for (const animation of animations) {
        if (animation.trigger === 'click' || !formatedAnimations.length) {
          formatedAnimations.push({ animations: [animation], autoNext: false });
        } else if (animation.trigger === 'meantime') {
          const last = formatedAnimations[formatedAnimations.length - 1];
          last.animations = last.animations.filter((item) => item.elId !== animation.elId);
          last.animations.push(animation);
          formatedAnimations[formatedAnimations.length - 1] = last;
        } else if (animation.trigger === 'auto') {
          const last = formatedAnimations[formatedAnimations.length - 1];
          last.autoNext = true;
          formatedAnimations[formatedAnimations.length - 1] = last;
          formatedAnimations.push({ animations: [animation], autoNext: false });
        }
      }
      return formatedAnimations;
    },
  },

  actions: {
    setTitle(title: string) {
      if (!title) this.title = 'Untitled Presentation';
      else this.title = title;
    },

    setTheme(themeProps: Partial<SlideTheme>) {
      this.theme = { ...this.theme, ...themeProps };
    },

    setViewportSize(size: number) {
      this.viewportSize = size;
    },

    setViewportRatio(viewportRatio: number) {
      this.viewportRatio = viewportRatio;
    },

    setPageNumberSettings(settings: Partial<PageNumberSettings>) {
      this.pageNumberSettings = { ...this.pageNumberSettings, ...settings };
    },

    setSlides(slides: Slide[]) {
      this.slides = slides;
    },

    setTemplates(templates: SlideTemplate[]) {
      this.templates = templates;
    },

    addSlide(slide: Slide | Slide[]) {
      const slides = Array.isArray(slide) ? slide : [slide];
      for (const slide of slides) {
        if (slide.sectionTag) delete slide.sectionTag;
      }

      const addIndex = this.slides.length === 0 ? 0 : this.slideIndex + 1;

      // Auto-add page numbers if enabled
      if (this.pageNumberSettings.enabled) {
        for (let i = 0; i < slides.length; i++) {
          const slideIndex = addIndex + i;
          const isTitle = this.pageNumberSettings.skipTitlePage && slideIndex === 0;
          if (!isTitle) {
            const hasPageNumber = slides[i].elements.some(
              (el) => el.type === 'text' && (el as PPTTextElement).textType === 'pageNumber'
            );
            if (!hasPageNumber) {
              const pageNum = this.pageNumberSettings.skipTitlePage ? slideIndex : slideIndex + 1;
              const el = createPageNumberElement(
                pageNum,
                this.pageNumberSettings.position,
                this.viewportSize,
                this.viewportRatio,
                this.theme
              );
              slides[i].elements.push(el);
            }
          }
        }
      }

      this.slides.splice(addIndex, 0, ...slides);
      this.slideIndex = addIndex;
    },

    appendNewSlide(slide: Slide) {
      // Auto-add page number if enabled
      if (this.pageNumberSettings.enabled) {
        const slideIndex = this.slides.length;
        const isTitle = this.pageNumberSettings.skipTitlePage && slideIndex === 0;
        if (!isTitle) {
          const hasPageNumber = slide.elements.some(
            (el) => el.type === 'text' && (el as PPTTextElement).textType === 'pageNumber'
          );
          if (!hasPageNumber) {
            const pageNum = this.pageNumberSettings.skipTitlePage ? slideIndex : slideIndex + 1;
            const el = createPageNumberElement(
              pageNum,
              this.pageNumberSettings.position,
              this.viewportSize,
              this.viewportRatio,
              this.theme
            );
            slide.elements.push(el);
          }
        }
      }
      this.slides.push(slide);
    },

    updateSlide(props: Partial<Slide>, slideId?: string) {
      const slideIndex = slideId ? this.slides.findIndex((item) => item.id === slideId) : this.slideIndex;
      this.slides[slideIndex] = { ...this.slides[slideIndex], ...props };
    },

    removeSlideProps(data: RemovePropData) {
      const { id, propName } = data;

      const slides = this.slides.map((slide) => {
        return slide.id === id ? omit(slide, propName) : slide;
      }) as Slide[];
      this.slides = slides;
    },

    deleteSlide(slideId: string | string[]) {
      const slidesId = Array.isArray(slideId) ? slideId : [slideId];
      const slides: Slide[] = JSON.parse(JSON.stringify(this.slides));

      const deleteSlidesIndex = [];
      for (const deletedId of slidesId) {
        const index = slides.findIndex((item) => item.id === deletedId);
        deleteSlidesIndex.push(index);

        const deletedSlideSection = slides[index].sectionTag;
        if (deletedSlideSection) {
          const handleSlideNext = slides[index + 1];
          if (handleSlideNext && !handleSlideNext.sectionTag) {
            delete slides[index].sectionTag;
            slides[index + 1].sectionTag = deletedSlideSection;
          }
        }

        slides.splice(index, 1);
      }
      let newIndex = Math.min(...deleteSlidesIndex);

      const maxIndex = slides.length - 1;
      if (newIndex > maxIndex) newIndex = maxIndex;

      this.slideIndex = newIndex;
      this.slides = slides;
    },

    updateSlideIndex(index: number) {
      this.slideIndex = index;
    },

    addElement(element: PPTElement | PPTElement[]) {
      const elements = Array.isArray(element) ? element : [element];
      const currentSlideEls = this.slides[this.slideIndex].elements;
      const newEls = [...currentSlideEls, ...elements];
      this.slides[this.slideIndex].elements = newEls;
    },

    deleteElement(elementId: string | string[]) {
      const elementIdList = Array.isArray(elementId) ? elementId : [elementId];
      const currentSlideEls = this.slides[this.slideIndex].elements;
      const newEls = currentSlideEls.filter((item) => !elementIdList.includes(item.id));
      this.slides[this.slideIndex].elements = newEls;
    },

    updateElement(data: UpdateElementData) {
      const { id, props, slideId } = data;
      const elIdList = typeof id === 'string' ? [id] : id;

      const slideIndex = slideId ? this.slides.findIndex((item) => item.id === slideId) : this.slideIndex;
      const slide = this.slides[slideIndex];

      // Update elements array (existing behavior)
      const elements = slide.elements.map((el) => {
        return elIdList.includes(el.id) ? { ...el, ...props } : el;
      });
      this.slides[slideIndex].elements = elements as PPTElement[];

      // 🔥 NEW: Sync content changes to schema (for layout-based slides)
      if (slide.layout?.schema && ('content' in props || 'text' in props)) {
        const elementIds = typeof id === 'string' ? [id] : id;
        for (const elementId of elementIds) {
          syncElementToSchema(slide, elementId, props);
        }
      }
    },

    /**
     * Reapply page numbers to all slides based on current pageNumberSettings.
     * Removes existing page number elements and re-adds them if enabled.
     */
    reapplyPageNumbers() {
      const settings = this.pageNumberSettings;
      this.slides = this.slides.map((slide, index) => {
        // Remove existing page number elements
        const filteredElements = slide.elements.filter(
          (el) => !(el.type === 'text' && (el as PPTTextElement).textType === 'pageNumber')
        );

        if (!settings.enabled) {
          return { ...slide, elements: filteredElements };
        }

        if (settings.skipTitlePage && index === 0) {
          return { ...slide, elements: filteredElements };
        }

        const pageNum = settings.skipTitlePage ? index : index + 1;
        const el = createPageNumberElement(
          pageNum,
          settings.position,
          this.viewportSize,
          this.viewportRatio,
          this.theme
        );

        return { ...slide, elements: [...filteredElements, el] };
      });
    },

    removeElementProps(data: RemovePropData) {
      const { id, propName } = data;
      const propsNames = typeof propName === 'string' ? [propName] : propName;

      const slideIndex = this.slideIndex;
      const slide = this.slides[slideIndex];
      const elements = slide.elements.map((el) => {
        return el.id === id ? omit(el, propsNames) : el;
      });
      this.slides[slideIndex].elements = elements as PPTElement[];
    },
  },
});
