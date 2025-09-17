import { useState } from 'react';
import { OutlineCreationView, WorkspaceView2 } from '@/features/presentation/components';
import { useModels } from '@/features/model';
import { PresentationFormProvider } from '@/features/presentation/contexts/PresentationFormContext';

const PresentationViewState = {
  OUTLINE_CREATION: 'outline_creation',
  WORKSPACE: 'workspace',
} as const;

type PresentationViewState = (typeof PresentationViewState)[keyof typeof PresentationViewState];

const PresentationOutlinePage = () => {
  const { models, defaultModel, isLoading: isLoadingModels, isError: isErrorModels } = useModels();

  const [currentView, setCurrentView] = useState<PresentationViewState>(
    PresentationViewState.OUTLINE_CREATION
  );

  const handleCreateOutline = () => {
    setCurrentView(PresentationViewState.WORKSPACE);
  };

  return (
    <PresentationFormProvider
      defaultValues={{
        model: defaultModel?.name || '',
      }}
    >
      {currentView === PresentationViewState.OUTLINE_CREATION ? (
        <OutlineCreationView
          onCreateOutline={handleCreateOutline}
          models={models}
          defaultModel={defaultModel}
          isErrorModels={isErrorModels}
          isLoadingModels={isLoadingModels}
        />
      ) : (
        <WorkspaceView2 />
      )}
    </PresentationFormProvider>
  );
};

export default PresentationOutlinePage;
