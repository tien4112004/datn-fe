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
  private initPromise: Promise<void> | null = null;
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

    // Ensure templates are initialized
    if (!this.initialized && !this.initPromise) {
      await this.prefetchAll();
    } else if (this.initPromise) {
      await this.initPromise;
    }

    // Check cache
    if (this.cache.has(layoutType)) {
      return this.cache.get(layoutType)!;
    }

    // If not in cache after initialization, fall back to frontend-data
    console.warn(
      `No templates found for layout type "${layoutType}" in API response, falling back to frontend-data`
    );
    return this.getFrontendDataTemplates(layoutType);
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
   * Prefetch all templates from API on app initialization
   */
  async prefetchAll(): Promise<void> {
    // In mock mode, skip API fetching
    if (isMockMode()) {
      return;
    }

    // If already initialized, return immediately
    if (this.initialized) {
      return;
    }

    // If already initializing, wait for that promise
    if (this.initPromise) {
      return this.initPromise;
    }

    // Create and store the initialization promise
    this.initPromise = this.doInitialize();
    await this.initPromise;
  }

  private async doInitialize(): Promise<void> {
    try {
      const templateApi = getTemplateApi();
      const allTemplates = await templateApi.getSlideTemplates();

      // Validate that allTemplates is an array
      if (!Array.isArray(allTemplates)) {
        console.warn(
          'API returned non-array templates data, falling back to frontend-data. Received:',
          typeof allTemplates,
          allTemplates
        );
        this.initialized = true;
        return;
      }

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

      this.initialized = true;
      console.log(
        `✓ Loaded ${allTemplates.length} templates from API, grouped into ${grouped.size} layout types`
      );
    } catch (error) {
      console.error('Failed to prefetch templates from API:', error);
      // Mark as initialized even on error to prevent retry loops
      // Will fall back to frontend-data when getTemplates is called
      this.initialized = true;
    } finally {
      this.initPromise = null;
    }
  }

  /**
   * Clear the cache (useful for testing or when templates are updated)
   */
  clearCache(): void {
    this.cache.clear();
    this.initPromise = null;
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
