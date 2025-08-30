import GlobalSpinner from '@/shared/components/common/GlobalSpinner';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePresentationById } from '@/features/presentation/hooks/useApi';

const PresentationWrapper = ({ id }: { id?: string }) => {
  const containerRef = useRef(null);
  const hasMounted = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation('loading');
  // const { presentation } = useLoaderData() as { presentation: Presentation };
  const { data: presentation } = usePresentationById(id);

  useEffect(() => {
    // Prevent re-mounting the Vue component if it has already been mounted
    if (hasMounted.current) return;
    hasMounted.current = true;

    setIsLoading(true);

    import('vueRemote/Editor')
      .then((mod) => {
        mod.mount(containerRef.current, {
          titleTest: 'random',
          isRemote: true,
          presentation: presentation,
        });
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load Vue remote:', err);
        setIsLoading(false);
      });
  }, []);

  // vue-remote must match the style's name in presentation/src/assets/styles/scope.scss
  return (
    <>
      <div className="vue-remote" ref={containerRef} />
      {isLoading && <GlobalSpinner text={t('presentation')} />}
    </>
  );
};

export default PresentationWrapper;
