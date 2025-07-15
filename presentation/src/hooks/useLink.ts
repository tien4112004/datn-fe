import { useSlidesStore } from '@/store';
import type { PPTElement, PPTElementLink } from '@/types/slides';
import useHistorySnapshot from '@/hooks/useHistorySnapshot';
import message from '@/utils/message';
import { useI18n } from 'vue-i18n';

export default () => {
  const slidesStore = useSlidesStore();
  const { t } = useI18n();

  const { addHistorySnapshot } = useHistorySnapshot();

  // Set link
  const setLink = (handleElement: PPTElement, link: PPTElementLink) => {
    const linkRegExp = /^(https?):\/\/[\w\-]+(\.[\w\-]+)+([\w\-.,@?^=%&:\/~+#]*[\w\-@?^=%&\/~+#])?$/;
    if (link.type === 'web' && !linkRegExp.test(link.target)) {
      message.error(t('system.links.invalidWebLink'));
      return false;
    }
    if (link.type === 'slide' && !link.target) {
      message.error(t('system.links.selectLinkTarget'));
      return false;
    }
    const props = { link };
    slidesStore.updateElement({ id: handleElement.id, props });
    addHistorySnapshot();

    return true;
  };

  // Remove link
  const removeLink = (handleElement: PPTElement) => {
    slidesStore.removeElementProps({ id: handleElement.id, propName: 'link' });
    addHistorySnapshot();
  };

  return {
    setLink,
    removeLink,
  };
};
