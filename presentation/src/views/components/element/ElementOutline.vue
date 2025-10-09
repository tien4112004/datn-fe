<template>
  <svg class="element-outline" v-if="outline" overflow="visible" :width="width" :height="height">
    <path
      vector-effect="non-scaling-stroke"
      stroke-linecap="butt"
      stroke-miterlimit="8"
      fill="transparent"
      :d="pathData"
      :stroke="outlineColor"
      :stroke-width="outlineWidth"
      :stroke-dasharray="strokeDashArray"
    ></path>
  </svg>
</template>

<script lang="ts" setup>
import { toRef, computed } from 'vue';
import type { PPTElementOutline } from '@/types/slides';

import useElementOutline from '@/views/components/element/hooks/useElementOutline';

const props = defineProps<{
  width: number;
  height: number;
  outline?: PPTElementOutline;
}>();

const { outlineWidth, outlineColor, strokeDashArray } = useElementOutline(toRef(props, 'outline'));

// Parse border radius (supports single value or four corners)
const parsedRadius = computed(() => {
  if (!props.outline?.borderRadius) return { tl: 0, tr: 0, br: 0, bl: 0 };

  const radius =
    typeof props.outline?.borderRadius === 'string'
      ? props.outline?.borderRadius.split(' ').map(Number)
      : [props.outline?.borderRadius];

  // CSS-like parsing: 1 value = all corners, 4 values = tl tr br bl
  if (radius.length === 1) {
    return { tl: radius[0], tr: radius[0], br: radius[0], bl: radius[0] };
  } else if (radius.length === 4) {
    return { tl: radius[0], tr: radius[1], br: radius[2], bl: radius[3] };
  }

  return { tl: 0, tr: 0, br: 0, bl: 0 };
});

// Generate SVG path with rounded corners
const pathData = computed(() => {
  const { width, height } = props;
  const { tl, tr, br, bl } = parsedRadius.value;

  // Clamp radius values to not exceed half of width/height
  const maxRadius = Math.min(width, height) / 2;
  const rtl = Math.min(tl, maxRadius);
  const rtr = Math.min(tr, maxRadius);
  const rbr = Math.min(br, maxRadius);
  const rbl = Math.min(bl, maxRadius);

  if (!rtl && !rtr && !rbr && !rbl) {
    // No radius - use simple rectangle
    return `M0,0 L${width},0 L${width},${height} L0,${height} Z`;
  }

  // Create rounded rectangle path
  return `
    M${rtl},0
    L${width - rtr},0
    ${rtr > 0 ? `Q${width},0 ${width},${rtr}` : ''}
    L${width},${height - rbr}
    ${rbr > 0 ? `Q${width},${height} ${width - rbr},${height}` : ''}
    L${rbl},${height}
    ${rbl > 0 ? `Q0,${height} 0,${height - rbl}` : ''}
    L0,${rtl}
    ${rtl > 0 ? `Q0,0 ${rtl},0` : ''}
    Z
  `
    .replace(/\s+/g, ' ')
    .trim();
});
</script>

<style lang="scss" scoped>
svg {
  overflow: visible;
  position: absolute;
  top: 0;
  left: 0;
}
</style>
