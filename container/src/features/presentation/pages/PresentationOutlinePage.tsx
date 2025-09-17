import { useEffect, useState } from 'react';
import { OutlineCreationView, WorkspaceView } from '@/features/presentation/components';
import { PresentationFormProvider } from '@/features/presentation/contexts/PresentationFormContext';
import { useSearchParams } from 'react-router-dom';
import useOutlineStore from '../stores/useOutlineStore';

const PresentationViewState = {
  OUTLINE_CREATION: 'outline_creation',
  WORKSPACE: 'workspace',
} as const;

type PresentationViewState = (typeof PresentationViewState)[keyof typeof PresentationViewState];

const getViewFromParams = (searchParams: URLSearchParams): PresentationViewState => {
  const viewParam = searchParams.get('view');
  if (viewParam === PresentationViewState.WORKSPACE) {
    return PresentationViewState.WORKSPACE;
  }
  return PresentationViewState.OUTLINE_CREATION;
};

const PresentationOutlinePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentView, setCurrentView] = useState<PresentationViewState>(getViewFromParams(searchParams));
  const isEmptyOutline = useOutlineStore((state) => state.isEmpty);
  const startStreaming = useOutlineStore((state) => state.startStreaming);

  // Sync state with URL changes
  useEffect(() => {
    setCurrentView(getViewFromParams(searchParams));

    if (currentView === PresentationViewState.WORKSPACE) {
      setTimeout(() => {
        if (isEmptyOutline()) {
          setCurrentView(PresentationViewState.OUTLINE_CREATION);
          setSearchParams({});
        }
      }, 100);
    }
  }, [searchParams]);

  const handleCreateOutline = () => {
    setCurrentView(PresentationViewState.WORKSPACE);
    setSearchParams({ view: PresentationViewState.WORKSPACE });
    startStreaming();
  };

  return (
    <PresentationFormProvider>
      {currentView === PresentationViewState.OUTLINE_CREATION ? (
        <OutlineCreationView onCreateOutline={handleCreateOutline} />
      ) : (
        <WorkspaceView />
      )}
    </PresentationFormProvider>
  );
};

export default PresentationOutlinePage;
