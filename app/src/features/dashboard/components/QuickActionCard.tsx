import { Card, CardContent } from '@/shared/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/shared/lib/utils';
import type { QuickAction } from '../types';

interface QuickActionCardProps {
  action: QuickAction;
}

const QuickActionCard = ({ action }: QuickActionCardProps) => {
  const navigate = useNavigate();
  const Icon = action.icon;

  const handleClick = () => {
    if (action.route.startsWith('#')) {
      // Scroll to section
      const element = document.querySelector(action.route);
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      navigate(action.route);
    }
  };

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg',
        'bg-gradient-to-br',
        action.gradient
      )}
      onClick={handleClick}
    >
      <CardContent className="flex flex-col items-center justify-center gap-3 p-6 text-center">
        <Icon className="h-12 w-12 text-white" />
        <div className="space-y-1">
          <h3 className="font-semibold text-white">{action.title}</h3>
          <p className="text-xs text-white/80">{action.description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionCard;
