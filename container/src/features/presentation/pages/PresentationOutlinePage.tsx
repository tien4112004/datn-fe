import { useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import { OutlineCreationView, WorkspaceView } from '@/features/presentation/components';
import type { ModelOption } from '@/features/model';
import { SidebarTrigger } from '@/shared/components/ui/sidebar';
import type { OutlineData } from '@/features/presentation/types';
// import { OutlineProvider } from '../context/OutlineContext';

const PresentationViewState = {
  OUTLINE_CREATION: 'outline_creation',
  WORKSPACE: 'workspace',
} as const;

type PresentationViewState = (typeof PresentationViewState)[keyof typeof PresentationViewState];

const PresentationOutlinePage = () => {
  const defaultModel = useLoaderData() as ModelOption;
  const [currentView, setCurrentView] = useState<PresentationViewState>(
    PresentationViewState.OUTLINE_CREATION
  );
  const [outlineData, setOutlineData] = useState<OutlineData>({
    slideCount: '',
    style: '',
    model: defaultModel.name,
    prompt: '',
  });

  const handleCreateOutline = (outlineData: OutlineData) => {
    setOutlineData(outlineData);
    setCurrentView(PresentationViewState.WORKSPACE);
  };

  return (
    <>
      <SidebarTrigger className="absolute left-4 top-4 z-50" />
      {currentView === PresentationViewState.OUTLINE_CREATION ? (
        <OutlineCreationView defaultModel={defaultModel} onCreateOutline={handleCreateOutline} />
      ) : (
        <WorkspaceView initialOutlineData={outlineData} />
      )}
    </>
  );
};

export default PresentationOutlinePage;
