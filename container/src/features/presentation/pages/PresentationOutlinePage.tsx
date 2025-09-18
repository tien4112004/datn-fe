import { useEffect, useState } from 'react';
import { OutlineCreationView, WorkspaceView } from '@/features/presentation/components';
import { PresentationFormProvider } from '@/features/presentation/contexts/PresentationFormContext';
import { useSearchParams } from 'react-router-dom';
import useOutlineStore from '../stores/useOutlineStore';
import { PRESENTATION_VIEW_STATE, type PresentationViewState } from '../types';

const getViewFromParams = (searchParams: URLSearchParams): PresentationViewState => {
  const viewParam = searchParams.get('view');
  if (viewParam === PRESENTATION_VIEW_STATE.WORKSPACE) {
    return PRESENTATION_VIEW_STATE.WORKSPACE;
  }
  return PRESENTATION_VIEW_STATE.OUTLINE_CREATION;
};

const PresentationOutlinePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentView, setCurrentView] = useState<PresentationViewState>(getViewFromParams(searchParams));
  const startStreaming = useOutlineStore((state) => state.startStreaming);

  // Sync state with URL changes
  useEffect(() => {
    setCurrentView(getViewFromParams(searchParams));
  }, [searchParams]);

  const switchToWorkspace = () => {
    setCurrentView(PRESENTATION_VIEW_STATE.WORKSPACE);
    setSearchParams({ view: PRESENTATION_VIEW_STATE.WORKSPACE });
    startStreaming();
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
