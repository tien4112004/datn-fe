import { isMockMode } from '@aiprimary/api';
import { getTemplateApi } from '@/services/template/api';
import type { Template } from '@aiprimary/core/templates';
import type { SlideTemplate } from '@/types/slides';
import { TEMPLATE_VARIATIONS } from './templateSelector';

/**
 * Template Registry - Manages template fetching from API with caching
 *
 * In real mode: Fetches templates from /api/slide-templates
 * In mock mode: Falls back to frontend-data templates
 */
class TemplateRegistry {
  private cache: Map<string, Template[]> = new Map();
  private fetchPromises: Map<string, Promise<Template[]>> = new Map();
  private initialized = false;

  /**
   * Get templates for a specific layout type
   * Fetches from API (with cache) or falls back to frontend-data in mock mode
   */
  async getTemplates(layoutType: string): Promise<Template[]> {
    // In mock mode, use frontend-data templates directly
    if (isMockMode()) {
      return this.getFrontendDataTemplates(layoutType);
    }

    // Check cache first
    if (this.cache.has(layoutType)) {
      return this.cache.get(layoutType)!;
    }

    // Check if we're already fetching this layout type
    if (this.fetchPromises.has(layoutType)) {
      return this.fetchPromises.get(layoutType)!;
    }

    // Fetch from API
    const fetchPromise = this.fetchTemplatesFromApi(layoutType);
    this.fetchPromises.set(layoutType, fetchPromise);

    try {
      const templates = await fetchPromise;
      this.cache.set(layoutType, templates);
      return templates;
    } catch (error) {
      console.error(
        `Failed to fetch templates for ${layoutType} from API, falling back to frontend-data:`,
        error
      );
      // Fall back to frontend-data on error
      const fallbackTemplates = this.getFrontendDataTemplates(layoutType);
      this.cache.set(layoutType, fallbackTemplates);
      return fallbackTemplates;
    } finally {
      this.fetchPromises.delete(layoutType);
    }
  }

  /**
   * Fetch templates from API for a specific layout type
   */
  private async fetchTemplatesFromApi(layoutType: string): Promise<Template[]> {
    const templateApi = getTemplateApi();
    const apiTemplates = await templateApi.getSlideTemplatesByLayout(layoutType);

    // Convert API SlideTemplate[] to Template[]
    return apiTemplates.map((apiTemplate) => this.convertApiTemplateToTemplate(apiTemplate));
  }

  /**
   * Convert API SlideTemplate to internal Template format
   */
  private convertApiTemplateToTemplate(apiTemplate: SlideTemplate): Template {
    return {
      id: apiTemplate.id,
      name: apiTemplate.name,
      config: apiTemplate.config as any,
      graphics: apiTemplate.graphics,
      parameters: apiTemplate.parameters,
    };
  }

  /**
   * Get templates from frontend-data (mock mode or fallback)
   */
  private getFrontendDataTemplates(layoutType: string): Template[] {
    const templates = TEMPLATE_VARIATIONS[layoutType];

    if (!templates || templates.length === 0) {
      throw new Error(`No templates available for layout type: ${layoutType}`);
    }

    return templates;
  }

  /**
   * Prefetch all templates from API (optional optimization)
   */
  async prefetchAll(): Promise<void> {
    if (isMockMode() || this.initialized) {
      return;
    }

    this.initialized = true;

    try {
      const templateApi = getTemplateApi();
      const allTemplates = await templateApi.getSlideTemplates();

      // Group by layout type
      const grouped = new Map<string, Template[]>();

      for (const apiTemplate of allTemplates) {
        const template = this.convertApiTemplateToTemplate(apiTemplate);
        const layout = apiTemplate.layout;

        if (!grouped.has(layout)) {
          grouped.set(layout, []);
        }
        grouped.get(layout)!.push(template);
      }

      // Cache all groups
      for (const [layout, templates] of grouped.entries()) {
        this.cache.set(layout, templates);
      }
    } catch (error) {
      console.error('Failed to prefetch templates from API:', error);
      // Don't throw - we'll fall back to lazy loading or frontend-data
    }
  }

  /**
   * Clear the cache (useful for testing or when templates are updated)
   */
  clearCache(): void {
    this.cache.clear();
    this.fetchPromises.clear();
    this.initialized = false;
  }

  /**
   * Check if templates are cached for a layout type
   */
  isCached(layoutType: string): boolean {
    return this.cache.has(layoutType);
  }
}

// Export singleton instance
export const templateRegistry = new TemplateRegistry();
