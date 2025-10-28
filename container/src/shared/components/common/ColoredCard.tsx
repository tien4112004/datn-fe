import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '../../lib/utils';

export type ColorScheme = 'blue' | 'purple' | 'green' | 'amber' | 'red' | 'pink' | 'indigo';

const colorSchemes = {
  blue: {
    header: 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30',
    title: 'from-blue-600 to-indigo-600',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'bg-blue-500',
  },
  purple: {
    header: 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30',
    title: 'from-purple-600 to-pink-600',
    border: 'border-purple-200 dark:border-purple-800',
    icon: 'bg-purple-500',
  },
  green: {
    header: 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30',
    title: 'from-green-600 to-emerald-600',
    border: 'border-green-200 dark:border-green-800',
    icon: 'bg-green-500',
  },
  amber: {
    header: 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30',
    title: 'from-amber-600 to-orange-600',
    border: 'border-amber-200 dark:border-amber-800',
    icon: 'bg-amber-500',
  },
  red: {
    header: 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30',
    title: 'from-red-600 to-rose-600',
    border: 'border-red-200 dark:border-red-800',
    icon: 'bg-red-500',
  },
  pink: {
    header: 'bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30',
    title: 'from-pink-600 to-rose-600',
    border: 'border-pink-200 dark:border-pink-800',
    icon: 'bg-pink-500',
  },
  indigo: {
    header: 'bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30',
    title: 'from-indigo-600 to-blue-600',
    border: 'border-indigo-200 dark:border-indigo-800',
    icon: 'bg-indigo-500',
  },
};

interface ColoredCardContextType {
  colorScheme: ColorScheme;
  colors: (typeof colorSchemes)[ColorScheme];
}

const ColoredCardContext = createContext<ColoredCardContextType | undefined>(undefined);

const useColoredCard = () => {
  const context = useContext(ColoredCardContext);
  if (!context) {
    throw new Error('useColoredCard must be used within a ColoredCard');
  }
  return context;
};

interface ColoredCardProps {
  colorScheme?: ColorScheme;
  children: ReactNode;
  className?: string;
}

const ColoredCard = ({ colorScheme = 'blue', children, className }: ColoredCardProps) => {
  const colors = colorSchemes[colorScheme];

  return (
    <ColoredCardContext.Provider value={{ colorScheme, colors }}>
      <Card
        className={cn(
          `gap-0 border-2 pt-0 shadow-lg transition-all duration-300 hover:shadow-xl ${colors.border}`,
          className
        )}
      >
        {children}
      </Card>
    </ColoredCardContext.Provider>
  );
};

interface ColoredCardHeaderProps {
  children: ReactNode;
  className?: string;
}

const ColoredCardHeader = ({ children, className }: ColoredCardHeaderProps) => {
  const { colors } = useColoredCard();

  return (
    <CardHeader className={cn(`rounded-t-xl py-4 ${colors.header}`, className)}>
      <div className="flex items-center justify-between">{children}</div>
    </CardHeader>
  );
};

interface ColoredCardTitleProps {
  children: ReactNode;
  className?: string;
}

const ColoredCardTitle = ({ children, className }: ColoredCardTitleProps) => {
  const { colors } = useColoredCard();

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span
        className={`bg-gradient-to-r ${colors.title} bg-clip-text text-xl font-semibold text-transparent`}
      >
        {children}
      </span>
    </div>
  );
};

interface ColoredCardContentProps {
  children: ReactNode;
  className?: string;
}

const ColoredCardContent = ({ children, className }: ColoredCardContentProps) => {
  return <CardContent className={cn('space-y-4 pt-6', className)}>{children}</CardContent>;
};

export { ColoredCard, ColoredCardHeader, ColoredCardTitle, ColoredCardContent };
