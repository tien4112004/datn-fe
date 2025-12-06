import { useState } from 'react';
import { OutlineCreationView, WorkspaceView } from '@/features/presentation/components';
import { PresentationFormProvider } from '@/features/presentation/contexts/PresentationFormContext';
import { PRESENTATION_VIEW_STATE, type PresentationViewState } from '../types';
import useOutlineStore from '../stores/useOutlineStore';
import { getSearchParam, setSearchParams } from '@/shared/utils/searchParams';

const getViewFromParams = (): PresentationViewState => {
  const viewParam = getSearchParam('view');
  if (viewParam === PRESENTATION_VIEW_STATE.WORKSPACE) {
    return PRESENTATION_VIEW_STATE.WORKSPACE;
  }
  return PRESENTATION_VIEW_STATE.OUTLINE_CREATION;
};

const PresentationOutlinePage = () => {
  const [currentView, setCurrentView] = useState<PresentationViewState>(getViewFromParams);
  const startGeneration = useOutlineStore((state) => state.startGenerating);
  const clearOutline = useOutlineStore((state) => state.clearOutline);

  const switchToWorkspace = () => {
    setCurrentView(PRESENTATION_VIEW_STATE.WORKSPACE);
    setSearchParams({ view: PRESENTATION_VIEW_STATE.WORKSPACE });
    clearOutline();
    startGeneration();
  };

  const switchToOutlineCreation = () => {
    setCurrentView(PRESENTATION_VIEW_STATE.OUTLINE_CREATION);
    setSearchParams({ view: PRESENTATION_VIEW_STATE.OUTLINE_CREATION });
  };

  return (
    <PresentationFormProvider>
      {currentView === PRESENTATION_VIEW_STATE.OUTLINE_CREATION ? (
        <OutlineCreationView onCreateOutline={switchToWorkspace} />
      ) : (
        <WorkspaceView onWorkspaceEmpty={switchToOutlineCreation} />
      )}
    </PresentationFormProvider>
  );
};

export default PresentationOutlinePage;
