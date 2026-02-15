import { ref, computed, type Ref, type ComputedRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { api, getBackendUrl } from '@aiprimary/api';

export interface ArtStyleWithModifiers {
  id?: string;
  name?: string;
  value?: string;
  label?: string;
  labelKey?: string;
  modifiers?: string;
}

const fallbackArtStyles: ArtStyleWithModifiers[] = [
  { value: 'photorealistic', labelKey: 'panels.aiModification.artStyles.photorealistic', modifiers: '' },
  { value: 'digital-art', labelKey: 'panels.aiModification.artStyles.digitalArt', modifiers: '' },
  { value: 'minimalist', labelKey: 'panels.aiModification.artStyles.minimalist', modifiers: '' },
  { value: 'watercolor', labelKey: 'panels.aiModification.artStyles.watercolor', modifiers: '' },
  { value: 'oil-painting', labelKey: 'panels.aiModification.artStyles.oilPainting', modifiers: '' },
  { value: 'anime', labelKey: 'panels.aiModification.artStyles.anime', modifiers: '' },
  { value: 'cartoon', labelKey: 'panels.aiModification.artStyles.cartoon', modifiers: '' },
  { value: 'sketch', labelKey: 'panels.aiModification.artStyles.sketch', modifiers: '' },
  { value: 'abstract', labelKey: 'panels.aiModification.artStyles.abstract', modifiers: '' },
  { value: 'surreal', labelKey: 'panels.aiModification.artStyles.surreal', modifiers: '' },
];

export function useArtStyles() {
  const { t } = useI18n();

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
          label: style.labelKey ? t(style.labelKey) : style.label || '',
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
