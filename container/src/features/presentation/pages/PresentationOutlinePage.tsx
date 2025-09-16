import { useState } from 'react';
import { OutlineCreationView, WorkspaceView2 } from '@/features/presentation/components';
import { useModels } from '@/features/model';
import type { OutlineData } from '@/features/presentation/types';

const PresentationViewState = {
  OUTLINE_CREATION: 'outline_creation',
  WORKSPACE: 'workspace',
} as const;

type PresentationViewState = (typeof PresentationViewState)[keyof typeof PresentationViewState];

const PresentationOutlinePage = () => {
  // const [models, defaultModel] = useLoaderData() as [ModelOption[], ModelOption];
  const { models, defaultModel, isLoading: isLoadingModels, isError: isErrorModels } = useModels();

  const [currentView, setCurrentView] = useState<PresentationViewState>(
    PresentationViewState.OUTLINE_CREATION
  );
  const [outlineData, setOutlineData] = useState<OutlineData>({
    topic: '',
    slideCount: 0,
    language: '',
    model: defaultModel?.name || '',
    targetAge: '',
    learningObjective: '',
  });

  const handleCreateOutline = (outlineData: OutlineData) => {
    setOutlineData(outlineData);
    setCurrentView(PresentationViewState.WORKSPACE);
  };

  return (
    <>
      {/* <SidebarTrigger className="absolute left-4 top-4 z-50" /> */}
      {currentView === PresentationViewState.OUTLINE_CREATION ? (
        <OutlineCreationView
          onCreateOutline={handleCreateOutline}
          models={models}
          defaultModel={defaultModel}
          isErrorModels={isErrorModels}
          isLoadingModels={isLoadingModels}
        />
      ) : (
        <WorkspaceView2 initialOutlineData={outlineData} />
      )}
    </>
  );
};

export default PresentationOutlinePage;
