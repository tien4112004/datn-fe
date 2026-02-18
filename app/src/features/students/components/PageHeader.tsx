import { ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface PageHeaderProps {
  title: string;
  description?: string;
  onBack?: () => void;
  action?: React.ReactNode;
}

/**
 * Reusable page header component with breadcrumb navigation
 * Follows Swiss Modernism: Clean hierarchy, clear structure
 */
export function PageHeader({ title, description, onBack, action }: PageHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Back Button */}
      {onBack && (
        <Button
          variant="ghost"
          onClick={onBack}
          className="hover:bg-muted group -ml-2 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back
        </Button>
      )}

      {/* Title Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground text-sm sm:text-base">{description}</p>}
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
    </div>
  );
}
