import React from 'react';
import { Button } from '@/shared/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { ButtonProps } from '@/shared/components/ui/button';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
  loadingIcon?: React.ReactNode;
  children: React.ReactNode;
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ loading = false, loadingText, loadingIcon, children, disabled, className, ...props }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <Button ref={ref} disabled={isDisabled} className={cn(className)} {...props}>
        {loading && (
          <>
            {loadingIcon || <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loadingText}
          </>
        )}
        {!loading && children}
      </Button>
    );
  }
);

LoadingButton.displayName = 'LoadingButton';

export default LoadingButton;
export type { LoadingButtonProps };
