import { template, cloneDeepWith } from 'lodash';
import type { SlideTheme } from '@/types/slides';
import type { TemplateConfig, PartialTemplateConfig, SlideViewport } from './types';

/**
 * Resolves a partial template (without theme/viewport) into a full TemplateConfig
 * by replacing all {{theme.xxx}} placeholders with actual theme values using lodash utilities
 */
export function resolveTemplate(
  partialTemplate: PartialTemplateConfig,
  theme: SlideTheme,
  viewport: SlideViewport
): TemplateConfig {
  // Use lodash cloneDeepWith to traverse and transform the object tree
  const resolvedContainers = cloneDeepWith(partialTemplate.containers, (value) => {
    // Only process string values that contain template syntax
    if (typeof value === 'string' && value.includes('{{')) {
      try {
        const compiled = template(value, { interpolate: /\{\{(.+?)\}\}/g });
        return compiled({ theme });
      } catch (e) {
        // If template compilation fails, return original string
        return value;
      }
    }
    // Return undefined to let cloneDeepWith handle other types normally
    return undefined;
  });

  return {
    containers: resolvedContainers,
    theme,
    viewport,
  };
}
