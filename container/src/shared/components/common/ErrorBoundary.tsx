import React, { Component, type ReactNode } from 'react';
import { type AppError, CriticalError, isCriticalError } from '@/shared/types/errors';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo, errorId: string) => void;
  showDetails?: boolean;
}

interface ErrorFallbackProps {
  error: Error;
  errorInfo: React.ErrorInfo | null;
  resetError: () => void;
  errorId: string;
  showDetails?: boolean;
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  resetError,
  errorId,
  showDetails = true,
}) => {
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
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
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

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (!isCriticalError(error)) {
      return;
    }

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
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;

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
