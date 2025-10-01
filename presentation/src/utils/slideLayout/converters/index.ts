export * from './types';

export * from './twoColumn';
export * from './twoColumnWithImage';
export * from './title';
export * from './tableOfContents';
export * from './mainImage';
export * from './verticalList';
export * from './horizontalList';

// Helper utilities
import type { TemplateConfig, TemplateContainerConfig } from '../types';
import LayoutPrimitives from '../layoutPrimitives';

const SLIDE_WIDTH = 1000;
const SLIDE_HEIGHT = 562.5;

/**
 * Resolve all container positions and return containers with absolute bounds
 */
export function resolveTemplateContainers(template: TemplateConfig): Record<string, TemplateContainerConfig> {
  const resolvedBounds = LayoutPrimitives.resolveContainerPositions(template.containers, {
    width: SLIDE_WIDTH,
    height: SLIDE_HEIGHT,
  });

  const resolvedContainers: Record<string, TemplateContainerConfig> = {};

  for (const [id, container] of Object.entries(template.containers)) {
    resolvedContainers[id] = {
      ...container,
      bounds: resolvedBounds[id],
    };
  }

  return resolvedContainers;
}
