import React from 'react';
import { cn } from '@/shared/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return <div className={cn('mx-auto w-full max-w-7xl space-y-6 px-6 py-8', className)}>{children}</div>;
}
