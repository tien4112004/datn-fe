import { useSidebar } from '@/shared/components/ui/sidebar';
import { Button } from '@ui/button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import React from 'react';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['errors', 'glossary']);
  const { open, toggleSidebar } = useSidebar();

  React.useEffect(() => {
    if (open) {
      toggleSidebar();
    }
  }, []);

  return (
    <>
      <div className="flex flex-1 flex-col items-center justify-center px-8 py-16">
        <div className="text-center">
          <h1 className="text-muted-foreground mb-4 text-6xl font-bold">404</h1>
          <h2 className="mb-2 text-2xl font-semibold">{t('notFound.pageNotFound')}</h2>
          <p className="text-muted-foreground mb-8 max-w-md">{t('notFound.description')}</p>
          <div className="space-x-4">
            <Button onClick={() => navigate(-1)} variant="outline">
              {t('glossary:actions.goBack')}
            </Button>
            <Button onClick={() => navigate('/')}>{t('glossary:actions.goHome')}</Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;
