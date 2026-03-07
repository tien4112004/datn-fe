import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuery } from '@tanstack/vue-query';
import { api, getBackendUrl } from '@aiprimary/api';
import { ART_STYLE_OPTIONS, type ArtStyle } from '@aiprimary/core';

const I18N_PREFIX = 'panels.aiModification.artStyles';

export function useArtStyles() {
  const { t } = useI18n();

  const {
    data: apiArtStyles,
    isLoading,
    isError,
    error,
  } = useQuery<ArtStyle[]>({
    queryKey: ['artStyles'],
    queryFn: async () => {
      const response = await api.get(`${getBackendUrl()}/api/art-styles`, {
        params: { pageSize: 50 },
      });
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data.map((style: any) => ({
          id: style.id,
          name: style.name,
          labelKey: style.labelKey || style.id,
          visual: style.visual,
          modifiers: style.modifiers || '',
        }));
      }
      return ART_STYLE_OPTIONS;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });

  // "None" from constants is always the first option, API styles follow
  const noneStyle = ART_STYLE_OPTIONS.find((s) => s.id === '');

  const availableArtStyles = computed<ArtStyle[]>(() => {
    const styles = apiArtStyles.value;
    if (styles && styles.length > 0) {
      const stylesWithoutNone = styles.filter((s) => s.id !== '' && s.name !== '');
      return noneStyle ? [noneStyle, ...stylesWithoutNone] : stylesWithoutNone;
    }
    return ART_STYLE_OPTIONS;
  });

  function getStyleModifiers(styleId: string): string | undefined {
    return availableArtStyles.value.find((s) => s.id === styleId || s.name === styleId)?.modifiers;
  }

  const artStyleOptions = computed(() =>
    availableArtStyles.value.map((style) => ({
      value: style.id,
      label: style.labelKey ? t(`${I18N_PREFIX}.${style.labelKey}`) : style.name,
      visual: style.visual,
    }))
  );

  return {
    availableArtStyles,
    isLoading,
    isError,
    error,
    getStyleModifiers,
    artStyleOptions,
  };
}
