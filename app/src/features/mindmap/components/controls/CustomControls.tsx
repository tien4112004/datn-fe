import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

interface CustomControlsProps {
  children: ReactNode;
  className?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const CustomControls = ({ children, className, position }: CustomControlsProps) => {
  const positionClasses = position
    ? {
        'top-left': 'absolute top-4 left-4',
        'top-right': 'absolute top-4 right-4',
        'bottom-left': 'absolute bottom-4 left-4',
        'bottom-right': 'absolute bottom-4 right-4',
      }[position]
    : '';

  return <div className={cn('z-10 flex flex-col gap-2', positionClasses, className)}>{children}</div>;
};

interface CustomControlButtonProps {
  onClick: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

export const CustomControlButton = ({
  onClick,
  title,
  children,
  className,
  disabled = false,
}: CustomControlButtonProps) => {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={cn(
        'flex h-9 min-h-[28px] w-9 min-w-[28px] items-center justify-center rounded-md',
        'sm:h-9 sm:min-h-[36px] sm:w-9 sm:min-w-[36px]',
        'border border-gray-200 bg-white p-0.5 shadow-md',
        'transition-all duration-200',
        'hover:border-gray-300 hover:bg-gray-50 hover:shadow-lg',
        'active:scale-95',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white',
        'touch-manipulation',
        className
      )}
    >
      {children}
    </button>
  );
};
