import { ref, computed, type Ref, type ComputedRef } from 'vue';
import { api, getBackendUrl } from '@aiprimary/api';

export interface ArtStyleWithModifiers {
  id?: string;
  name?: string;
  value?: string;
  label?: string;
  modifiers?: string;
}

const fallbackArtStyles: ArtStyleWithModifiers[] = [
  { value: 'photorealistic', label: 'Photorealistic', modifiers: '' },
  { value: 'digital-art', label: 'Digital Art', modifiers: '' },
  { value: 'minimalist', label: 'Minimalist', modifiers: '' },
  { value: 'watercolor', label: 'Watercolor', modifiers: '' },
  { value: 'oil-painting', label: 'Oil Painting', modifiers: '' },
  { value: 'anime', label: 'Anime', modifiers: '' },
  { value: 'cartoon', label: 'Cartoon', modifiers: '' },
  { value: 'sketch', label: 'Sketch', modifiers: '' },
  { value: 'abstract', label: 'Abstract', modifiers: '' },
  { value: 'surreal', label: 'Surreal', modifiers: '' },
];

export function useArtStyles() {
  // State
  const availableArtStyles = ref<ArtStyleWithModifiers[]>([]);
  const isLoading = ref(false);

  /**
   * Fetch art styles from API
   */
  async function fetchArtStyles() {
    try {
      isLoading.value = true;
      const response = await api.get(`${getBackendUrl()}/api/art-styles`, {
        params: { pageSize: 50 },
      });

      if (response.data?.data && Array.isArray(response.data.data)) {
        availableArtStyles.value = response.data.data.map((style: any) => ({
          id: style.id,
          name: style.name,
          value: style.id || style.name,
          label: style.displayName || style.name,
          modifiers: style.modifiers || '',
        }));
      } else {
        availableArtStyles.value = fallbackArtStyles;
      }
    } catch (error) {
      console.warn('Failed to fetch art styles, using fallback:', error);
      // Keep using fallback styles
      availableArtStyles.value = fallbackArtStyles;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Get style modifiers for a given style ID
   */
  function getStyleModifiers(styleId: string): string | undefined {
    const style = availableArtStyles.value.find(
      (s) => s.id === styleId || s.name === styleId || s.value === styleId
    );
    return style?.modifiers;
  }

  /**
   * Computed property for art style display options
   */
  const artStyleOptions = computed(() =>
    availableArtStyles.value.length > 0
      ? availableArtStyles.value.map((style) => ({
          value: style.id || style.name || style.value || '',
          label: style.label || style.name || '',
        }))
      : fallbackArtStyles.map((style) => ({
          value: style.value || '',
          label: style.label || '',
        }))
  );

  return {
    // State
    availableArtStyles,
    isLoading,

    // Methods
    fetchArtStyles,
    getStyleModifiers,

    // Computed
    artStyleOptions,
  };
}
