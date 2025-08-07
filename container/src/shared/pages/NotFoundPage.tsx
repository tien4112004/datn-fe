import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@radix-ui/react-separator';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('page');

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbPage>{t('notFound')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center px-8 py-16">
        <div className="text-center">
          <h1 className="text-muted-foreground mb-4 text-6xl font-bold">404</h1>
          <h2 className="mb-2 text-2xl font-semibold">{t('pageNotFound')}</h2>
          <p className="text-muted-foreground mb-8 max-w-md">{t('pageNotFoundDescription')}</p>
          <div className="space-x-4">
            <Button onClick={() => navigate(-1)} variant="outline">
              {t('goBack')}
            </Button>
            <Button onClick={() => navigate('/')}>{t('goHome')}</Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;
