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
} from '../hooks/useDetailPresentation';
import { useUnsavedChangesBlocker } from '@/shared/hooks';
import { UnsavedChangesDialog } from '@/shared/components/modals/UnsavedChangesDialog';
import { SmallScreenDialog } from '@/shared/components/modals/SmallScreenDialog';
import usePresentationStore from '../stores/usePresentationStore';
import { CriticalError } from '@aiprimary/api';
import { ERROR_TYPE } from '@/shared/constants';
import { useEffect, useRef, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { CommentDrawer } from '@/features/comments';
import { useDocumentPermission } from '@/shared/hooks/useDocumentPermission';
import { PermissionBadge } from '@/shared/components/common/PermissionBadge';

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
  const { permission: userPermission } = useDocumentPermission(id);

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
      />
      {isGenerating && <GlobalSpinner text={t('generatingPresentation')} lightBlur />}
      {!isGenerating && isSaving && <GlobalSpinner text={t('savingPresentation')} />}

      {/* Permission Badge */}
      {userPermission && !isViewModeParam && (
        <div className="fixed right-6 top-6 z-40">
          <PermissionBadge permission={userPermission} />
        </div>
      )}

      {/* Floating Comment Button */}
      {id && !isViewModeParam && (
        <Button
          onClick={() => setIsCommentDrawerOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg transition-shadow hover:shadow-xl"
          size="icon"
          title="Comments"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}

      {/* Comment Drawer */}
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
