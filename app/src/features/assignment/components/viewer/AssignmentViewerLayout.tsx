import { useTranslation } from 'react-i18next';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@ui/sheet';
import { useAssignmentViewerStore } from '../../stores/useAssignmentViewerStore';
import type { Assignment } from '../../types';
import { AssignmentMetadataViewPanel } from './AssignmentMetadataViewPanel';
import { ContextsViewPanel } from './ContextsViewPanel';
import { MatrixViewPanel } from './MatrixViewPanel';
import { QuestionsListViewPanel } from './QuestionsListViewPanel';
import { QuestionsViewPanel } from './QuestionsViewPanel';
import { QuestionViewNavigator } from './QuestionViewNavigator';
import { ViewerActionsPanel } from './ViewerActionsPanel';

interface AssignmentViewerLayoutProps {
  assignment: Assignment;
  onEdit: () => void;
  onDelete: () => void;
  sidebarOpen: boolean;
  onSidebarOpenChange: (open: boolean) => void;
}

export const AssignmentViewerLayout = ({
  assignment,
  onEdit,
  onDelete,
  sidebarOpen,
  onSidebarOpenChange,
}: AssignmentViewerLayoutProps) => {
  const mainView = useAssignmentViewerStore((state) => state.mainView);
  const { t } = useTranslation('assignment', { keyPrefix: 'view' });

  const sidebarContent = (
    <div className="space-y-6">
      <ViewerActionsPanel onEdit={onEdit} onDelete={onDelete} />
      <QuestionViewNavigator assignment={assignment} />
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:h-full lg:grid-cols-4">
      {/* Main Content Area (75% width on large screens) */}
      <div className="lg:col-span-3 lg:overflow-y-auto lg:pr-2">
        {mainView === 'info' && <AssignmentMetadataViewPanel assignment={assignment} />}
        {mainView === 'questions' && <QuestionsViewPanel assignment={assignment} />}
        {mainView === 'questionsList' && <QuestionsListViewPanel assignment={assignment} />}
        {mainView === 'matrix' && <MatrixViewPanel assignment={assignment} />}
        {mainView === 'contexts' && <ContextsViewPanel assignment={assignment} />}
      </div>

      {/* Sidebar (25% width on large screens, hidden on mobile) */}
      <div className="hidden space-y-6 lg:block lg:overflow-y-auto lg:pr-2">{sidebarContent}</div>

      {/* Mobile: Sheet drawer (trigger is in the page header) */}
      <Sheet open={sidebarOpen} onOpenChange={onSidebarOpenChange}>
        <SheetContent side="right" className="w-80 overflow-y-auto" aria-describedby={undefined}>
          <SheetHeader>
            <SheetTitle>{t('sidebar')}</SheetTitle>
          </SheetHeader>
          <div className="mt-4">{sidebarContent}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
