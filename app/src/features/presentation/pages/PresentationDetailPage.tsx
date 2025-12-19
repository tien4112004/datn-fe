import VueRemoteWrapper from '@/features/presentation/components/remote/VueRemoteWrapper';
import GlobalSpinner from '@/shared/components/common/GlobalSpinner';
import { useTranslation } from 'react-i18next';
import { useLoaderData, useParams } from 'react-router-dom';
import type { Presentation } from '../types';
import { getSearchParamAsBoolean } from '@/shared/utils/searchParams';
import {
  usePresentationValidation,
  useMessageRemote,
  useSavePresentationRemote,
  type VueEditorApp,
} from '../hooks/useDetailPresentation';
import { useUnsavedChangesBlocker } from '@/shared/hooks';
import { UnsavedChangesDialog } from '@/shared/components/modals/UnsavedChangesDialog';
import { SmallScreenDialog } from '@/shared/components/modals/SmallScreenDialog';
import usePresentationStore from '../stores/usePresentationStore';
import { useState } from 'react';
import { CriticalError } from '@aiprimary/api';
import { ERROR_TYPE } from '@/shared/constants';

const DetailPage = () => {
  const { presentation } = useLoaderData() as { presentation: Presentation | null };
  const { id } = useParams<{ id: string }>();
  const isGeneratingParam = getSearchParamAsBoolean('isGenerating', false) ?? false;
  const isViewModeParam = getSearchParamAsBoolean('view', false) ?? false;
  const [vueApp, setVueApp] = useState<VueEditorApp | undefined>();

  // Validate and initialize - all processing logic is now in Vue
  usePresentationValidation(id, presentation, isGeneratingParam);
  useMessageRemote();
  const { isSaving } = useSavePresentationRemote(id!, vueApp);
  const { request } = usePresentationStore();

  // Additional runtime safety check
  if (!presentation && !isGeneratingParam) {
    throw new CriticalError('Presentation data is unavailable', ERROR_TYPE.RESOURCE_NOT_FOUND);
  }

  // Listen for dirty state changes from Vue
  const { showDialog, setShowDialog, handleStay, handleProceed } = useUnsavedChangesBlocker({
    eventName: 'app.presentation.dirty-state-changed',
  });

  const { t } = useTranslation('glossary', { keyPrefix: 'loading' });

  return (
    <>
      <VueRemoteWrapper
        modulePath="editor"
        mountProps={{
          presentation,
          isRemote: true,
          mode: isViewModeParam ? 'view' : 'edit',
          ...(isGeneratingParam && { generationRequest: request, isGenerating: true }),
        }}
        className="vue-remote"
        LoadingComponent={() => <GlobalSpinner text={t('presentation')} />}
        onMountSuccess={(mountedInstance) => {
          setVueApp(mountedInstance);
        }}
      />
      {isSaving && <GlobalSpinner text={t('savingPresentation')} />}
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
