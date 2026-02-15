import { isMockMode } from '@aiprimary/api';
import { queryClient } from '@/lib/query-client';
import { queryKeys } from '@/services/query-keys';
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

    // Try to get from TanStack Query cache first
    const cachedTemplates = queryClient.getQueryData<SlideTemplate[]>(queryKeys.templates.lists());

    if (cachedTemplates) {
      // Filter by layout type
      const filtered = cachedTemplates
        .filter((t) => t.layout === layoutType)
        .map((t) => this.convertApiTemplateToTemplate(t));

      if (filtered.length > 0) {
        return filtered;
      }
    }

    // If not in cache, ensure templates are initialized
    if (!this.initialized && !this.initPromise) {
      await this.prefetchAll();
    } else if (this.initPromise) {
      await this.initPromise;
    }

    // Check local cache after initialization
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
      containers: apiTemplate.containers,
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
      // Use TanStack Query to fetch and cache templates
      const allTemplates = await queryClient.fetchQuery({
        queryKey: queryKeys.templates.lists(),
        queryFn: () => getTemplateApi().getSlideTemplates(),
        staleTime: 1000 * 60 * 10, // 10 minutes
      });

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

      // Group by layout type for local cache
      const grouped = new Map<string, Template[]>();

      for (const apiTemplate of allTemplates) {
        const template = this.convertApiTemplateToTemplate(apiTemplate);
        const layout = apiTemplate.layout;

        if (!grouped.has(layout)) {
          grouped.set(layout, []);
        }
        grouped.get(layout)!.push(template);
      }

      // Cache all groups locally
      for (const [layout, templates] of grouped.entries()) {
        this.cache.set(layout, templates);
      }

      this.initialized = true;
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
