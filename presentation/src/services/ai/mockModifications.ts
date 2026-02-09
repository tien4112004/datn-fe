import type { AIModificationRequest, AIModificationResponse } from '@/types/aiModification';

// --- Utilities ---

function delay(): Promise<void> {
  const ms = 800 + Math.random() * 700;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- Plain text transformation ---

function transformPlainText(text: string, instruction: string): string {
  if (!text) return text;
  const lower = instruction.toLowerCase();

  if (lower.includes('shorten') || lower.includes('concise') || lower.includes('brief')) {
    const words = text.split(/\s+/);
    return words.slice(0, Math.max(3, Math.ceil(words.length * 0.6))).join(' ');
  }
  if (lower.includes('expand') || lower.includes('detail') || lower.includes('elaborate')) {
    return (
      text + '. Furthermore, this point highlights an important consideration that merits deeper exploration.'
    );
  }
  if (lower.includes('grammar') || lower.includes('fix') || lower.includes('spelling')) {
    return text
      .replace(/\s{2,}/g, ' ')
      .replace(/(^|\.\s+)([a-z])/g, (_, pre, letter) => pre + letter.toUpperCase())
      .trim();
  }
  if (lower.includes('formal') || lower.includes('tone') || lower.includes('professional')) {
    return text
      .replace(/\bgood\b/gi, 'excellent')
      .replace(/\bbad\b/gi, 'suboptimal')
      .replace(/\bbig\b/gi, 'significant')
      .replace(/\bget\b/gi, 'obtain')
      .replace(/\buse\b/gi, 'utilize')
      .replace(/\bhelp\b/gi, 'facilitate');
  }

  return text + ' [AI-refined]';
}

// --- Schema helpers ---

/**
 * Apply text transformation to all string fields inside a SlideLayoutSchema.
 * Handles all schema variants: list, labeled_list, two_column, timeline, pyramid,
 * title, table_of_contents, main_image, two_column_with_image.
 */
function transformSchemaText(schema: any, instruction: string): any {
  if (!schema) return schema;
  const s = JSON.parse(JSON.stringify(schema));

  // Top-level title (list, labeled_list, two_column, timeline, pyramid, two_column_with_image)
  if (typeof s.title === 'string') {
    s.title = transformPlainText(s.title, instruction);
  }

  if (s.data) {
    // TitleLayoutSchema: data.title, data.subtitle
    if (typeof s.data.title === 'string') {
      s.data.title = transformPlainText(s.data.title, instruction);
    }
    if (typeof s.data.subtitle === 'string') {
      s.data.subtitle = transformPlainText(s.data.subtitle, instruction);
    }

    // MainImageLayoutSchema: data.content
    if (typeof s.data.content === 'string') {
      s.data.content = transformPlainText(s.data.content, instruction);
    }

    // string[] items (list, pyramid, table_of_contents, two_column_with_image)
    // or { label, content }[] items (labeled_list, timeline)
    if (Array.isArray(s.data.items)) {
      s.data.items = s.data.items.map((item: any) => {
        if (typeof item === 'string') return transformPlainText(item, instruction);
        if (typeof item === 'object' && item !== null) {
          if (typeof item.label === 'string') item.label = transformPlainText(item.label, instruction);
          if (typeof item.content === 'string') item.content = transformPlainText(item.content, instruction);
          return item;
        }
        return item;
      });
    }

    // TwoColumnLayoutSchema: items1, items2
    if (Array.isArray(s.data.items1)) {
      s.data.items1 = s.data.items1.map((v: string) => transformPlainText(v, instruction));
    }
    if (Array.isArray(s.data.items2)) {
      s.data.items2 = s.data.items2.map((v: string) => transformPlainText(v, instruction));
    }
  }

  return s;
}

/**
 * Flatten any schema's content items into a plain string[].
 */
function extractTextItems(schema: any): string[] {
  if (!schema?.data) return [];

  if (Array.isArray(schema.data.items)) {
    return schema.data.items.map((item: any) => {
      if (typeof item === 'string') return item;
      if (typeof item === 'object') return item.content || item.label || '';
      return String(item);
    });
  }

  const combined: string[] = [];
  if (Array.isArray(schema.data.items1)) combined.push(...schema.data.items1);
  if (Array.isArray(schema.data.items2)) combined.push(...schema.data.items2);
  if (combined.length > 0) return combined;

  if (typeof schema.data.content === 'string') return [schema.data.content];
  if (typeof schema.data.title === 'string') return [schema.data.title];

  return [];
}

/**
 * Build a SlideLayoutSchema matching the target layout type's expected shape.
 */
function buildSchemaForType(targetType: string, title: string, items: string[], imageUrl?: string): any {
  const type = targetType.toLowerCase();
  const img = imageUrl ? { image: imageUrl } : {};

  switch (type) {
    case 'list':
      return { type, title, data: { items, ...img } };
    case 'two_column': {
      const half = Math.ceil(items.length / 2);
      return { type, title, data: { items1: items.slice(0, half), items2: items.slice(half), ...img } };
    }
    case 'two_column_with_image':
      return { type, title, data: { items, image: imageUrl || '' } };
    case 'main_image':
      return { type, data: { content: items.join('. '), image: imageUrl || '' } };
    case 'labeled_list':
      return {
        type,
        title,
        data: { items: items.map((s, i) => ({ label: `Item ${i + 1}`, content: s })), ...img },
      };
    case 'timeline':
      return {
        type,
        title,
        data: { items: items.map((s, i) => ({ label: `Step ${i + 1}`, content: s })), ...img },
      };
    case 'pyramid':
      return { type, title, data: { items, ...img } };
    case 'table_of_contents':
      return { type, data: { items, ...img } };
    default:
      return { type, title, data: { items, ...img } };
  }
}

// --- Mock handlers ---

function mockRefineContent(request: AIModificationRequest): AIModificationResponse {
  const schema = request.context.slideSchema;
  if (!schema) {
    return { success: false, data: {}, error: 'No slideSchema provided' };
  }

  const instruction = String(request.parameters.instruction || '');
  const refined = transformSchemaText(schema, instruction);

  // Use the actual image element src, not the potentially stale schema value
  if (request.context.currentImageSrc && refined.data) {
    refined.data.image = request.context.currentImageSrc;
  }

  return { success: true, data: { schema: refined } };
}

function mockTransformLayout(request: AIModificationRequest): AIModificationResponse {
  const schema = request.context.slideSchema as any;
  const targetType = String(request.parameters.targetType);

  if (!schema) {
    return { success: false, data: {}, error: 'No slideSchema provided' };
  }

  const title = schema.title || schema.data?.title || '';
  const items = extractTextItems(schema);
  const imageUrl = request.context.currentImageSrc;
  const newSchema = buildSchemaForType(targetType, title, items, imageUrl);

  return { success: true, data: { schema: newSchema } };
}

function mockExpandSlide(request: AIModificationRequest): AIModificationResponse {
  const schema = request.context.slideSchema as any;
  const count = Number(request.parameters.count) || 2;

  if (!schema) {
    return { success: false, data: {}, error: 'No slideSchema provided' };
  }

  const title = schema.title || schema.data?.title || '';
  const items = extractTextItems(schema);
  const imageUrl = request.context.currentImageSrc;
  const schemaType = schema.type || 'list';
  const itemsPerSlide = Math.max(1, Math.ceil(items.length / count));

  const schemas: any[] = [];
  for (let i = 0; i < count; i++) {
    const portion = items.slice(i * itemsPerSlide, (i + 1) * itemsPerSlide);
    const partTitle = title ? `${title} (Part ${i + 1} of ${count})` : `Part ${i + 1}`;
    const partItems = portion.length > 0 ? portion : [`Content for Part ${i + 1}`];
    schemas.push(buildSchemaForType(schemaType, partTitle, partItems, imageUrl));
  }

  return { success: true, data: { schemas } };
}

// --- Exported mock service ---

export const mockAIModificationService = {
  async processModification(request: AIModificationRequest): Promise<AIModificationResponse> {
    await delay();

    switch (request.action) {
      case 'refine-content':
        return mockRefineContent(request);
      case 'transform-layout':
        return mockTransformLayout(request);
      case 'expand-slide':
        return mockExpandSlide(request);
      default:
        return { success: false, data: {}, error: `Unsupported action: ${request.action}` };
    }
  },

  async refineElementText(request: {
    slideId: string;
    elementId: string;
    currentText: string;
    instruction: string;
    slideSchema?: unknown;
    slideType?: string;
  }): Promise<AIModificationResponse> {
    await delay();

    const refinedText = transformPlainText(request.currentText, request.instruction);
    return { success: true, data: { refinedText } };
  },

  async replaceElementImage(request: {
    slideId: string;
    elementId: string;
    description: string;
    style: string;
    matchSlideTheme?: boolean;
    slideSchema?: unknown;
    slideType?: string;
  }): Promise<AIModificationResponse> {
    await delay();

    let seed = 0;
    for (let i = 0; i < request.description.length; i++) {
      seed = (seed * 31 + request.description.charCodeAt(i)) & 0xffff;
    }
    const imageUrl = `https://picsum.photos/seed/${seed}/800/450`;

    return { success: true, data: { imageUrl } };
  },
};
