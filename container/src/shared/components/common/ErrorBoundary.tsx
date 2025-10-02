import React, { Component, type ReactNode } from 'react';
import { type AppError, CriticalError, isCriticalError } from '@/shared/types/errors';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ErrorPage from '@/shared/pages/ErrorPage';
import { ERROR_TYPE } from '@/shared/constants';
import NotFoundPage from '@/shared/pages/NotFoundPage';
import { toast } from 'sonner';

interface ErrorBoundaryState {
  hasError: boolean;
  error: AppError | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string | null;
  pathname: string | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: AppError, errorInfo: React.ErrorInfo, errorId: string) => void;
  showDetails?: boolean;
  pathname?: string;
}

interface ErrorFallbackProps {
  error: AppError;
  errorInfo: React.ErrorInfo | null;
  resetError: () => void;
  errorId: string;
  showDetails?: boolean;
}

const ErrorPageFallback = ({
  error,
  errorInfo,
  resetError,
  errorId,
  showDetails = true,
}: ErrorFallbackProps) => {
  return (
    <div className="bg-background flex min-h-screen w-screen flex-col">
      {error.type === ERROR_TYPE.RESOURCE_NOT_FOUND ? (
        <NotFoundPage />
      ) : (
        <ErrorPage
          error={error}
          errorInfo={errorInfo}
          resetError={resetError}
          errorId={errorId}
          showDetails={showDetails}
        />
      )}
    </div>
  );
};

const DefaultErrorFallback = ({
  error,
  errorInfo,
  resetError,
  errorId,
  showDetails = true,
}: ErrorFallbackProps) => {
  const { t } = useTranslation('errorBoundary');

  const goHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="bg-background flex min-h-screen w-screen items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="bg-destructive/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <AlertTriangle className="text-destructive h-6 w-6" />
          </div>
          <CardTitle className="text-xl">{t('title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-center text-sm">{t('description')}</p>

          {showDetails && (
            <div className="space-y-2 text-sm">
              <details className="cursor-pointer">
                <summary className="font-medium">{t('errorDetails')}</summary>
                <div className="bg-muted mt-2 rounded-md p-3">
                  <p className="mb-2 break-all font-mono text-xs">
                    <strong>{t('errorId')}:</strong> {errorId}
                  </p>
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
            <Button onClick={resetError} className="w-full">
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
  );
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      pathname: props.pathname || null,
    };
  }

  static getDerivedStateFromError(error: AppError): Partial<ErrorBoundaryState> {
    if (!isCriticalError(error)) {
      throw error;
    }

    const errorId = `error_${Date.now()}`;

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // Reset error state when pathname changes
    if (prevProps.pathname !== this.props.pathname && this.state.hasError) {
      this.resetError();
    }
  }

  componentDidCatch(error: AppError, errorInfo: React.ErrorInfo) {
    if (!isCriticalError(error)) {
      return;
    }

    toast.error(error.message);

    const errorId = this.state.errorId || `error_${Date.now()}`;

    this.setState({
      errorInfo,
      errorId,
    });

    this.logError(error as CriticalError, errorInfo, errorId);

    if (this.props.onError) {
      this.props.onError(error, errorInfo, errorId);
    }
  }

  private logError = (error: AppError, errorInfo: React.ErrorInfo, errorId: string) => {
    console.group(`Critical Error [${errorId}]`);
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Context:', error.context);
    console.groupEnd();
  };

  private resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || ErrorPageFallback;

      return (
        <FallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={this.resetError}
          errorId={this.state.errorId || 'unknown'}
          showDetails={this.props.showDetails}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
export { ErrorPageFallback, DefaultErrorFallback, type ErrorFallbackProps };
