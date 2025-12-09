import VueRemoteWrapper from '@/features/presentation/components/remote/VueRemoteWrapper';
import GlobalSpinner from '@/shared/components/common/GlobalSpinner';
import { useTranslation } from 'react-i18next';
import { useLoaderData, useParams } from 'react-router-dom';
import type { Presentation } from '../types';
import { getSearchParamAsBoolean } from '@/shared/utils/searchParams';
import { useDetailPresentation } from '../hooks/useDetailPresentation';
import { useUnsavedChangesBlocker } from '@/shared/hooks';
import { UnsavedChangesDialog } from '@/shared/components/modals/UnsavedChangesDialog';
import { SmallScreenDialog } from '@/shared/components/modals/SmallScreenDialog';
import usePresentationStore from '../stores/usePresentationStore';

const DetailPage = () => {
  const { presentation } = useLoaderData() as { presentation: Presentation | null };
  const { id } = useParams<{ id: string }>();
  const isGeneratingParam = getSearchParamAsBoolean('isGenerating', false) ?? false;
  const isViewModeParam = getSearchParamAsBoolean('view', false) ?? false;

  // Validate and initialize - all processing logic is now in Vue
  const { updateApp, isStreaming, isSaving } = useDetailPresentation(presentation, id, isGeneratingParam);
  const { request } = usePresentationStore();

  // Listen for dirty state changes from Vue
  const { showDialog, setShowDialog, handleStay, handleProceed } = useUnsavedChangesBlocker({
    eventName: 'app.presentation.dirty-state-changed',
  });

  const { t } = useTranslation('glossary', { keyPrefix: 'loading' });

  return (
    <>
      {!isGeneratingParam ? (
        <VueRemoteWrapper
          modulePath="editor"
          mountProps={{
            presentation,
            isRemote: true,
            mode: isViewModeParam ? 'view' : 'edit',
          }}
          className="vue-remote"
          LoadingComponent={() => <GlobalSpinner text={t('presentation')} />}
          onMountSuccess={updateApp}
        />
      ) : (
        <VueRemoteWrapper
          modulePath="editor"
          mountProps={{
            presentation,
            isRemote: true,
            mode: isViewModeParam ? 'view' : 'edit',
            generationRequest: request,
            isGenerating: true,
          }}
          className="vue-remote"
          LoadingComponent={() => <GlobalSpinner text={t('presentation')} />}
          onMountSuccess={updateApp}
        />
      )}
      {isStreaming && <GlobalSpinner text={t('generatingPresentation')} />}
      {isSaving && <GlobalSpinner text={t('savingPresentation') || 'Saving presentation...'} />}
      <UnsavedChangesDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onStay={handleStay}
        onLeave={handleProceed}
      />
      <SmallScreenDialog />
    </>
  );
};

export default DetailPage;
