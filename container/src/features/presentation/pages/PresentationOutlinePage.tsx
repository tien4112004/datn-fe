import { useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import { OutlineCreationView, WorkspaceView } from '@/features/presentation/components';
import type { ModelOption } from '@/features/model';
import type { OutlineData } from '@/features/presentation/types';

const PresentationViewState = {
  OUTLINE_CREATION: 'outline_creation',
  WORKSPACE: 'workspace',
} as const;

type PresentationViewState = (typeof PresentationViewState)[keyof typeof PresentationViewState];

const PresentationOutlinePage = () => {
  const [models, defaultModel] = useLoaderData() as [ModelOption[], ModelOption];
  const [currentView, setCurrentView] = useState<PresentationViewState>(
    PresentationViewState.OUTLINE_CREATION
  );
  const [outlineData, setOutlineData] = useState<OutlineData>({
    topic: '',
    slideCount: 0,
    language: '',
    model: defaultModel.name,
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
        />
      ) : (
        <WorkspaceView initialOutlineData={outlineData} />
      )}
    </>
  );
};

export default PresentationOutlinePage;
