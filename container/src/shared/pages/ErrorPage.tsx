import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Separator } from '@radix-ui/react-separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import React from 'react';

interface ErrorPageProps {
  error?: Error;
  errorInfo?: React.ErrorInfo | null;
  resetError?: () => void;
  errorId?: string;
  showDetails?: boolean;
}

const ErrorPage = ({ error, errorInfo, resetError, errorId, showDetails = false }: ErrorPageProps) => {
  const { open, toggleSidebar } = useSidebar();
  const { t } = useTranslation('errorBoundary');

  const goHome = () => {
    window.location.href = '/';
  };

  const handleReset = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  React.useEffect(() => {
    if (open) {
      toggleSidebar();
    }
  }, []);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbPage>{t('title')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center px-8 py-16">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="bg-destructive/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <AlertTriangle className="text-destructive h-6 w-6" />
            </div>
            <CardTitle className="text-xl">{t('title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-center text-sm">{t('description')}</p>

            {showDetails && error && (
              <div className="space-y-2 text-sm">
                <details className="cursor-pointer">
                  <summary className="font-medium">{t('errorDetails')}</summary>
                  <div className="bg-muted mt-2 rounded-md p-3">
                    {errorId && (
                      <p className="mb-2 break-all font-mono text-xs">
                        <strong>{t('errorId')}:</strong> {errorId}
                      </p>
                    )}
                    <p className="mb-2 break-all font-mono text-xs">
                      <strong>{t('message')}:</strong> {error.message}
                    </p>
                    {errorInfo?.componentStack && (
                      <p className="break-all font-mono text-xs">
                        <strong>{t('componentStack')}:</strong>
                        <br />
                        {errorInfo.componentStack}
                      </p>
                    )}
                  </div>
                </details>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button onClick={handleReset} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                {t('tryAgain')}
              </Button>
              <Button variant="outline" onClick={goHome} className="w-full">
                <Home className="mr-2 h-4 w-4" />
                {t('goHome')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ErrorPage;
