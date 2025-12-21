import seedrandom from 'seedrandom';
import type { Template } from '@aiprimary/core/templates';
import { templateRegistry } from './templateRegistry';

/**
 * Tracks the current index for cycling through templates when using selectNextTemplate
 */
const cycleIndexes: Record<string, number> = {};

/**
 * Select a random template for a layout type
 * Fetches from API (with cache) or falls back to frontend-data in mock mode
 *
 * @param layoutType - The layout type
 * @param seed - Optional seed for deterministic random selection
 * @returns Promise resolving to randomly selected template
 */
export async function selectRandomTemplate(layoutType: string, seed?: string): Promise<Template> {
  const templates = await templateRegistry.getTemplates(layoutType);

  if (templates.length === 1) {
    return templates[0];
  }

  // Use seeded random if seed is provided, otherwise use Math.random
  const rng = seed ? seedrandom(seed) : Math.random;
  const randomIndex = Math.floor(rng() * templates.length);

  return templates[randomIndex];
}

/**
 * Select a specific template by ID
 * Fetches from API (with cache) or falls back to frontend-data in mock mode
 *
 * @param layoutType - The layout type
 * @param templateId - The template ID to select
 * @returns Promise resolving to the specified template
 * @throws Error if template not found
 */
export async function selectTemplateById(layoutType: string, templateId: string): Promise<Template> {
  const templates = await templateRegistry.getTemplates(layoutType);
  const template = templates.find((t) => t.id === templateId);

  if (!template) {
    throw new Error(`Template with ID "${templateId}" not found for layout type: ${layoutType}`);
  }

  return template;
}

/**
 * Get the first available template for a layout type
 * Useful for consistent default selection
 * Fetches from API (with cache) or falls back to frontend-data in mock mode
 *
 * @param layoutType - The layout type
 * @returns Promise resolving to first available template
 */
export async function selectFirstTemplate(layoutType: string): Promise<Template> {
  const templates = await templateRegistry.getTemplates(layoutType);

  if (!templates || templates.length === 0) {
    throw new Error(`No templates available for layout type: ${layoutType}`);
  }

  return templates[0];
}

/**
 * Cycle through templates (for preview/testing)
 * Uses global state to track position
 * Fetches from API (with cache) or falls back to frontend-data in mock mode
 *
 * @param layoutType - The layout type
 * @returns Promise resolving to next template in rotation
 */
export async function selectNextTemplate(layoutType: string): Promise<Template> {
  const templates = await templateRegistry.getTemplates(layoutType);

  // Initialize cycle index for this layout type if not exists
  if (!(layoutType in cycleIndexes)) {
    cycleIndexes[layoutType] = 0;
  }

  const currentIndex = cycleIndexes[layoutType];
  const selectedTemplate = templates[currentIndex];

  // Move to next template for next call
  cycleIndexes[layoutType] = (currentIndex + 1) % templates.length;

  return selectedTemplate;
}
