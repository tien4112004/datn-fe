import { useI18n } from 'vue-i18n';

export const getElementType = () => {
  const { t } = useI18n();

  return {
    text: t('elements.types.text'),
    image: t('elements.types.image'),
    shape: t('elements.types.shape'),
    line: t('elements.types.line'),
    chart: t('elements.types.chart'),
    table: t('elements.types.table'),
    video: t('elements.types.video'),
    audio: t('elements.types.audio'),
    latex: t('elements.types.formula'),
  };
};

export const MIN_SIZE: { [key: string]: number } = {
  text: 40,
  image: 20,
  shape: 20,
  chart: 200,
  table: 30,
  video: 250,
  audio: 20,
  latex: 20,
};
