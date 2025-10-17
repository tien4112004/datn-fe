import { computed, type Ref } from 'vue';
import type { PPTElementOutline } from '@/types/slides';

// Calculate border related property values, mainly for handling default values
export default (outline: Ref<PPTElementOutline | undefined>) => {
  // Get effective width for a specific side (per-side overrides shorthand)
  const getEffectiveWidth = (side: 'top' | 'right' | 'bottom' | 'left'): number => {
    const sideConfig = outline.value?.[side];
    if (sideConfig?.width !== undefined) return sideConfig.width;
    return outline.value?.width ?? 0;
  };

  // Get effective color for a specific side (per-side overrides shorthand)
  const getEffectiveColor = (side: 'top' | 'right' | 'bottom' | 'left'): string => {
    const sideConfig = outline.value?.[side];
    if (sideConfig?.color) return sideConfig.color;
    return outline.value?.color || '#d14424';
  };

  // Computed widths for each side
  const widths = computed(() => ({
    top: getEffectiveWidth('top'),
    right: getEffectiveWidth('right'),
    bottom: getEffectiveWidth('bottom'),
    left: getEffectiveWidth('left'),
  }));

  // Computed colors for each side
  const colors = computed(() => ({
    top: getEffectiveColor('top'),
    right: getEffectiveColor('right'),
    bottom: getEffectiveColor('bottom'),
    left: getEffectiveColor('left'),
  }));

  // Check if all borders are uniform
  const isUniform = computed(() => {
    const w = widths.value;
    const c = colors.value;
    return (
      w.top === w.right &&
      w.right === w.bottom &&
      w.bottom === w.left &&
      c.top === c.right &&
      c.right === c.bottom &&
      c.bottom === c.left
    );
  });

  // Legacy properties for backward compatibility (use top values as representative)
  const outlineWidth = computed(() => widths.value.top);
  const outlineColor = computed(() => colors.value.top);
  const outlineStyle = computed(() => outline.value?.style || 'solid');

  const strokeDashArray = computed(() => {
    const size = outlineWidth.value;
    if (outlineStyle.value === 'dashed')
      return size <= 6 ? `${size * 4.5} ${size * 2}` : `${size * 4} ${size * 1.5}`;
    if (outlineStyle.value === 'dotted')
      return size <= 6 ? `${size * 1.8} ${size * 1.6}` : `${size * 1.5} ${size * 1.2}`;
    return '0 0';
  });

  return {
    // Legacy properties (backward compatible)
    outlineWidth,
    outlineStyle,
    outlineColor,
    strokeDashArray,

    // New per-border properties
    widths,
    colors,
    isUniform,
  };
};
