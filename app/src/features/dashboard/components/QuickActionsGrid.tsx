import QuickActionCard from './QuickActionCard';
import { QUICK_ACTIONS } from '../constants/quickActions';

const QuickActionsGrid = () => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {QUICK_ACTIONS.map((action) => (
        <QuickActionCard key={action.id} action={action} />
      ))}
    </div>
  );
};

export default QuickActionsGrid;
