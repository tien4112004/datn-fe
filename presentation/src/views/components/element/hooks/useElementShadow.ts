import { computed, type Ref } from 'vue';
import type { PPTElementShadow } from '@/types/slides';

// Calculate element shadow style
export default (shadow: Ref<PPTElementShadow | undefined>) => {
  const shadowStyle = computed(() => {
    if (shadow.value) {
      const { h, v, blur, color } = shadow.value;
      return `${h}px ${v}px ${blur}px ${color}`;
    }
    return '';
  });

  return {
    shadowStyle,
  };
};
