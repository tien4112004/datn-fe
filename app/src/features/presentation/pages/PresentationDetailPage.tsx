import VueRemoteWrapper from '@/features/presentation/components/remote/VueRemoteWrapper';
import GlobalSpinner from '@/shared/components/common/GlobalSpinner';
import { useTranslation } from 'react-i18next';
import { useLoaderData, useParams, useNavigate, useLocation } from 'react-router-dom';
import type { Presentation } from '../types';
import { getSearchParamAsBoolean } from '@/shared/utils/searchParams';
import { useAuth } from '@/shared/context/auth';
import {
  usePresentationValidation,
  useMessageRemote,
  useSavingIndicator,
  useGeneratingStoreSync,
  useCommentDrawerTrigger,
  useNavigationRequest,
} from '../hooks/useDetailPresentation';
import { useUnsavedChangesBlocker } from '@/shared/hooks';
import { UnsavedChangesDialog } from '@/shared/components/modals/UnsavedChangesDialog';
import { SmallScreenDialog } from '@/shared/components/modals/SmallScreenDialog';
import usePresentationStore from '../stores/usePresentationStore';
import { CriticalError } from '@aiprimary/api';
import { ERROR_TYPE } from '@/shared/constants';
import { useEffect, useRef, useState, useCallback } from 'react';
import { CommentDrawer } from '@/features/comments';
import { useDuplicatePresentation } from '../hooks/useApi';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';

const DetailPage = () => {
  const { presentation } = useLoaderData() as { presentation: Presentation | null };
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isGeneratingParam = getSearchParamAsBoolean('isGenerating', false) ?? false;
  const isViewModeParam = getSearchParamAsBoolean('view', false) ?? false;
  const previousIsGenerating = useRef<boolean>(false);
  const [isCommentDrawerOpen, setIsCommentDrawerOpen] = useState(false);

  // Permission state
  const userPermission = presentation?.permission;
  const isStudent = user?.role === 'student';

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

  // Listen for navigation requests from Vue (triggers React Router, respects unsaved changes blocker)
  useNavigationRequest(navigate);

  // Handle duplicate presentation requests from Vue
  const duplicateMutation = useDuplicatePresentation();
  const isDuplicating = duplicateMutation.isPending;
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [pendingDuplicateId, setPendingDuplicateId] = useState<string | null>(null);

  useEffect(() => {
    const handleConfirmDuplicate = (event: Event) => {
      const customEvent = event as CustomEvent<{ presentationId: string }>;
      const presentationId = customEvent.detail.presentationId;

      if (presentationId) {
        setPendingDuplicateId(presentationId);
        setDuplicateDialogOpen(true);
      }
    };

    window.addEventListener('app.presentation.confirm-duplicate', handleConfirmDuplicate);
    return () => window.removeEventListener('app.presentation.confirm-duplicate', handleConfirmDuplicate);
  }, []);

  const handleDuplicateConfirm = useCallback(async () => {
    if (pendingDuplicateId) {
      try {
        const duplicated = await duplicateMutation.mutateAsync(pendingDuplicateId);
        // Navigate to the duplicated presentation
        navigate(`/presentation/${duplicated.id}`);
      } catch (error) {
        // Error handling is done in the mutation
        console.error('Duplicate failed:', error);
      }
    }
    setDuplicateDialogOpen(false);
    setPendingDuplicateId(null);
  }, [pendingDuplicateId, duplicateMutation, navigate]);

  const handleDuplicateCancel = useCallback(() => {
    setDuplicateDialogOpen(false);
    setPendingDuplicateId(null);
  }, []);

  const { t } = useTranslation('glossary', { keyPrefix: 'loading' });
  const { t: tPresentation } = useTranslation('presentation');

  // Determine mode based on permission and view mode parameter
  // - read permission: always 'view' (read-only)
  // - comment permission: always 'view' (can view and comment, but not edit)
  // - edit permission: respects isViewModeParam toggle
  // - undefined permission: default to 'view' for safety
  const mode = userPermission === 'edit' ? (isViewModeParam ? 'view' : 'edit') : 'view';

  return (
    <>
      <VueRemoteWrapper
        key={id}
        modulePath="editor"
        mountProps={{
          presentation,
          isRemote: true,
          mode,
          permission: userPermission,
          isStudent,
          ...(isGeneratingParam && { generationRequest: request, isGenerating: true }),
        }}
        className="vue-remote"
        LoadingComponent={() => <GlobalSpinner text={t('presentation')} />}
      />
      {isGenerating && <GlobalSpinner text={t('generatingPresentation')} lightBlur />}
      {!isGenerating && isSaving && <GlobalSpinner text={t('savingPresentation')} />}
      {isDuplicating && <GlobalSpinner text={tPresentation('duplicate.loading')} />}

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

      {/* Duplicate Confirmation Dialog - Triggered by Vue app */}
      <AlertDialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tPresentation('duplicate.title')}</AlertDialogTitle>
            <AlertDialogDescription>{tPresentation('duplicate.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDuplicateCancel}>
              {tPresentation('duplicate.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDuplicateConfirm}>
              {tPresentation('duplicate.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DetailPage;
