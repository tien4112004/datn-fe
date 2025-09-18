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
  const isEmptyOutline = useOutlineStore((state) => state.isEmpty);
  const startStreaming = useOutlineStore((state) => state.startStreaming);

  // Sync state with URL changes
  useEffect(() => {
    setCurrentView(getViewFromParams(searchParams));

    if (currentView === PRESENTATION_VIEW_STATE.WORKSPACE) {
      setTimeout(() => {
        if (isEmptyOutline()) {
          setCurrentView(PRESENTATION_VIEW_STATE.OUTLINE_CREATION);
          setSearchParams({});
        }
      }, 100);
    }
  }, [searchParams]);

  const handleCreateOutline = () => {
    setCurrentView(PRESENTATION_VIEW_STATE.WORKSPACE);
    setSearchParams({ view: PRESENTATION_VIEW_STATE.WORKSPACE });
    startStreaming();
  };

  return (
    <PresentationFormProvider currentView={currentView}>
      {currentView === PRESENTATION_VIEW_STATE.OUTLINE_CREATION ? (
        <OutlineCreationView onCreateOutline={handleCreateOutline} />
      ) : (
        <WorkspaceView />
      )}
    </PresentationFormProvider>
  );
};

export default PresentationOutlinePage;
