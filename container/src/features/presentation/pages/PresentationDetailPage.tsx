import VueRemoteWrapper from '@/features/presentation/components/remote/VueRemoteWrapper';
import GlobalSpinner, { Spinner } from '@/shared/components/common/GlobalSpinner';
import { useTranslation } from 'react-i18next';
import { useLoaderData, useParams } from 'react-router-dom';
import type { Presentation } from '../types';
import { getSearchParamAsBoolean } from '@/shared/utils/searchParams';
import { useDetailPresentation } from '../hooks/useDetailPresentation';
import { useUnsavedChangesBlocker } from '../hooks/useUnsavedChangesBlocker';
import { UnsavedChangesDialog } from '../components/UnsavedChangesDialog';

const DetailPage = () => {
  const { presentation } = useLoaderData() as { presentation: Presentation | null };
  const { id } = useParams<{ id: string }>();
  const isGeneratingParam = getSearchParamAsBoolean('isGenerating', false) ?? false;

  const { app, updateApp, isProcessing, isStreaming, isSaving } = useDetailPresentation(
    presentation,
    id,
    isGeneratingParam
  );

  const { showDialog, setShowDialog, handleStay, handleProceed } = useUnsavedChangesBlocker();

  const { t } = useTranslation('glossary', { keyPrefix: 'loading' });

  return (
    <>
      <VueRemoteWrapper
        modulePath="editor"
        mountProps={{
          titleTest: 'random',
          isRemote: true,
          presentation,
        }}
        className="vue-remote"
        LoadingComponent={() => <GlobalSpinner text={t('presentation')} />}
        onMountSuccess={updateApp}
      />
      {isStreaming && app && <Spinner text={t('generatingPresentation')} />}
      {!isStreaming && isProcessing && <Spinner text={t('processingPresentation')} />}
      {isSaving && <GlobalSpinner text={t('savingPresentation') || 'Saving presentation...'} />}
      <UnsavedChangesDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onStay={handleStay}
        onLeave={handleProceed}
      />
    </>
  );
};

export default DetailPage;
