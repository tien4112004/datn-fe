import { htmlToText } from '@/utils/common';
import type { Slide, PPTTextElement, TextType } from '@/types/slides';

interface SlideContext {
  type?: string;
  title?: string;
  content: string[];
}

interface PresentationContext {
  currentSlide: SlideContext;
  previousSlides: SlideContext[];
  nextSlides: SlideContext[];
}

const TEXT_TYPE_PRIORITY: Record<string, number> = {
  title: 0,
  subtitle: 1,
  header: 2,
  content: 3,
  item: 4,
  itemTitle: 4,
  notes: 5,
  footer: 5,
};

const EXCLUDED_TEXT_TYPES: TextType[] = ['pageNumber', 'partNumber', 'itemNumber'];

/**
 * Unwrap an EnrichedValue ({value, id}) or return the raw value.
 */
function unwrap(val: unknown): string | undefined {
  if (val == null) return undefined;
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && 'value' in (val as any)) {
    return String((val as any).value);
  }
  return String(val);
}

/**
 * Extract context from a slide that has layout schema data.
 */
function extractFromSchema(schema: any): SlideContext {
  const type = unwrap(schema.type);
  const title = unwrap(schema.title);
  const content: string[] = [];

  const data = schema.data;
  if (!data) return { type, title, content };

  // Handle items array (list, labeled_list, timeline, two_column_with_image, pyramid)
  if ('items' in data) {
    const items = data.items;
    if (Array.isArray(items)) {
      for (const item of items) {
        if (typeof item === 'string') {
          content.push(item);
        } else if (item && typeof item === 'object') {
          if ('label' in item && 'content' in item) {
            // labeled_list / timeline item
            const label = unwrap(item.label);
            const text = unwrap(item.content);
            content.push(label && text ? `${label}: ${text}` : text || label || '');
          } else {
            const val = unwrap(item);
            if (val) content.push(val);
          }
        }
      }
    }
  }

  // Handle two-column items (items1, items2)
  for (const key of ['items1', 'items2']) {
    if (key in data && Array.isArray(data[key])) {
      for (const item of data[key]) {
        const val = unwrap(item);
        if (val) content.push(val);
      }
    }
  }

  // Handle subtitle
  if ('subtitle' in data) {
    const subtitle = unwrap(data.subtitle);
    if (subtitle) content.unshift(subtitle);
  }

  // Handle image prompt (skip — not text content)

  return { type, title, content };
}

/**
 * Extract context from a slide by reading its PPTTextElements.
 * Groups by TextType priority, then sorts spatially within each group.
 */
function extractFromElements(slide: Slide): SlideContext {
  const textElements = slide.elements.filter(
    (el): el is PPTTextElement =>
      el.type === 'text' && !EXCLUDED_TEXT_TYPES.includes((el as PPTTextElement).textType as TextType)
  );

  // Sort: by TextType priority first, then top, then left
  textElements.sort((a, b) => {
    const pa = TEXT_TYPE_PRIORITY[a.textType || ''] ?? 5;
    const pb = TEXT_TYPE_PRIORITY[b.textType || ''] ?? 5;
    if (pa !== pb) return pa - pb;
    if (a.top !== b.top) return a.top - b.top;
    return a.left - b.left;
  });

  let title: string | undefined;
  const content: string[] = [];

  for (const el of textElements) {
    const text = htmlToText(el.content).trim();
    if (!text) continue;

    if (!title && el.textType === 'title') {
      title = text;
    } else {
      content.push(text);
    }
  }

  return { type: slide.layout?.layoutType, title, content };
}

/**
 * Extract structured context from a single slide.
 */
function extractSlideContext(slide: Slide): SlideContext {
  if (slide.layout?.isTemplatePreview && slide.layout?.schema) {
    return extractFromSchema(slide.layout.schema);
  }
  return extractFromElements(slide);
}

/**
 * Build context from the current slide and its neighbors (up to 2 each side).
 */
export function buildContext(slides: Slide[], currentIndex: number): PresentationContext {
  const current = slides[currentIndex];
  const currentSlide = current ? extractSlideContext(current) : { content: [] };

  const previousSlides: SlideContext[] = [];
  for (let i = Math.max(0, currentIndex - 2); i < currentIndex; i++) {
    previousSlides.push(extractSlideContext(slides[i]));
  }

  const nextSlides: SlideContext[] = [];
  for (let i = currentIndex + 1; i <= Math.min(slides.length - 1, currentIndex + 2); i++) {
    nextSlides.push(extractSlideContext(slides[i]));
  }

  return { currentSlide, previousSlides, nextSlides };
}
