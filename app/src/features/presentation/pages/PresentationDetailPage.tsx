import VueRemoteWrapper from '@/features/presentation/components/remote/VueRemoteWrapper';
import GlobalSpinner from '@/shared/components/common/GlobalSpinner';
import { useTranslation } from 'react-i18next';
import { useLoaderData, useParams, useNavigate, useLocation } from 'react-router-dom';
import type { Presentation } from '../types';
import { getSearchParamAsBoolean } from '@/shared/utils/searchParams';
import {
  usePresentationValidation,
  useMessageRemote,
  useSavingIndicator,
  useGeneratingStoreSync,
  useCommentDrawerTrigger,
} from '../hooks/useDetailPresentation';
import { useUnsavedChangesBlocker } from '@/shared/hooks';
import { UnsavedChangesDialog } from '@/shared/components/modals/UnsavedChangesDialog';
import { SmallScreenDialog } from '@/shared/components/modals/SmallScreenDialog';
import usePresentationStore from '../stores/usePresentationStore';
import { CriticalError } from '@aiprimary/api';
import { ERROR_TYPE } from '@/shared/constants';
import { useEffect, useRef, useState } from 'react';
import { CommentDrawer } from '@/features/comments';

const DetailPage = () => {
  const { presentation } = useLoaderData() as { presentation: Presentation | null };
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isGeneratingParam = getSearchParamAsBoolean('isGenerating', false) ?? false;
  const isViewModeParam = getSearchParamAsBoolean('view', false) ?? false;
  const previousIsGenerating = useRef<boolean>(false);
  const [isCommentDrawerOpen, setIsCommentDrawerOpen] = useState(false);

  // Permission state
  const userPermission = presentation?.permission;

  // Validate and initialize - all processing logic is now in Vue
  usePresentationValidation(id, presentation, isGeneratingParam);
  useMessageRemote();
  const { isSaving } = useSavingIndicator();
  useGeneratingStoreSync(); // Sync Vue events to store
  const isGenerating = usePresentationStore((state) => state.isGenerating); // Read from store
  const { request } = usePresentationStore();

  // Remove isGenerating=true param from URL when generation completes
  useEffect(() => {
    if (previousIsGenerating.current && !isGenerating && isGeneratingParam) {
      // Generation just completed, remove the isGenerating param from URL
      const searchParams = new URLSearchParams(location.search);
      searchParams.delete('isGenerating');
      const newSearch = searchParams.toString();
      const newPath = `${location.pathname}${newSearch ? `?${newSearch}` : ''}`;
      navigate(newPath, { replace: true });
    }
    previousIsGenerating.current = isGenerating;
  }, [isGenerating, isGeneratingParam, location.pathname, location.search, navigate]);

  // Additional runtime safety check
  if (!presentation && !isGeneratingParam) {
    throw new CriticalError('Presentation data is unavailable', ERROR_TYPE.RESOURCE_NOT_FOUND);
  }

  // Listen for dirty state changes from Vue
  const { showDialog, setShowDialog, handleStay, handleProceed } = useUnsavedChangesBlocker({
    eventName: 'app.presentation.dirty-state-changed',
  });

  // Listen for comment drawer open requests from Vue
  useCommentDrawerTrigger(() => setIsCommentDrawerOpen(true));

  const { t } = useTranslation('glossary', { keyPrefix: 'loading' });

  // Determine mode based on permission and view mode parameter
  // - read permission: always 'view' (read-only)
  // - comment permission: always 'view' (can view and comment, but not edit)
  // - edit permission: respects isViewModeParam toggle
  // - undefined permission: default to 'view' for safety
  const mode = userPermission === 'edit' ? (isViewModeParam ? 'view' : 'edit') : 'view';

  return (
    <>
      <VueRemoteWrapper
        modulePath="editor"
        mountProps={{
          presentation,
          isRemote: true,
          mode,
          permission: userPermission,
          ...(isGeneratingParam && { generationRequest: request, isGenerating: true }),
        }}
        className="vue-remote"
        LoadingComponent={() => <GlobalSpinner text={t('presentation')} />}
      />
      {isGenerating && <GlobalSpinner text={t('generatingPresentation')} lightBlur />}
      {!isGenerating && isSaving && <GlobalSpinner text={t('savingPresentation')} />}

      {/* Comment Drawer - Triggered by Vue app via 'app.presentation.open-comments' event */}
      {id && (
        <CommentDrawer
          isOpen={isCommentDrawerOpen}
          onOpenChange={setIsCommentDrawerOpen}
          documentId={id}
          documentType="presentation"
          userPermission={userPermission || 'read'}
        />
      )}

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
