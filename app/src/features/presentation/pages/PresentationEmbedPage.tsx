import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageSquare } from 'lucide-react';
import VueRemoteWrapper from '@/features/presentation/components/remote/VueRemoteWrapper';
import GlobalSpinner from '@/shared/components/common/GlobalSpinner';
import { Button } from '@/components/ui/button';
import { CommentDrawer } from '@/features/comments';
import { getPresentationApiService } from '../api';
import { useCommentDrawerTrigger } from '../hooks/useDetailPresentation';
import type { Presentation } from '../types';

/**
 * PresentationEmbedPage - Public presentation viewer for webview embedding.
 *
 * Key differences from PresentationDetailPage:
 * - Uses token-based authentication (via localStorage access_token injected by Flutter)
 * - Forced view-only mode (no editing capabilities)
 * - No unsaved changes tracking/blocking
 * - Simplified UI optimized for mobile viewing
 * - Comment button for accessing CommentDrawer
 *
 * Route: /presentation/embed/:id (public route for webview)
 * Auth: Token-based via localStorage (injected by Flutter WebView)
 */
const PresentationEmbedPage = () => {
  const { id } = useParams<{ id: string }>();
  const { i18n, t } = useTranslation('glossary', { keyPrefix: 'loading' });

  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCommentDrawerOpen, setIsCommentDrawerOpen] = useState(false);

  // Apply locale from localStorage (injected by Flutter WebView)
  useEffect(() => {
    const savedLocale = localStorage.getItem('i18nextLng');
    if (savedLocale && savedLocale !== i18n.language) {
      i18n.changeLanguage(savedLocale);
    }
  }, [i18n]);

  // Fetch presentation data
  useEffect(() => {
    const fetchPresentation = async () => {
      if (!id) {
        setError('No presentation ID provided');
        setIsLoading(false);
        notifyFlutter(false, 0, 'No presentation ID provided');
        return;
      }

      try {
        setIsLoading(true);
        // getPresentationApiService will auto-detect webview mode and use token-based auth
        const apiService = getPresentationApiService();
        const data = await apiService.getPresentationById(id);

        if (!data) {
          throw new Error('Presentation not found');
        }

        setPresentation(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch presentation:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load presentation';
        setError(errorMessage);
        setIsLoading(false);
        notifyFlutter(false, 0, errorMessage);
      }
    };

    fetchPresentation();
  }, [id]);

  // Helper to notify Flutter WebView
  const notifyFlutter = (success: boolean, slideCount: number = 0, errorMessage?: string) => {
    if ((window as any).flutter_inappwebview) {
      (window as any).flutter_inappwebview.callHandler('presentationLoaded', {
        success,
        slideCount,
        ...(errorMessage && { error: errorMessage }),
      });
    }
  };

  // Notify Flutter when Vue app is mounted successfully
  const handleVueMountSuccess = () => {
    notifyFlutter(true, presentation?.slides?.length ?? 0);
  };

  // Notify Flutter of mount errors
  const handleVueMountError = (err: Error) => {
    console.error('Vue mount error:', err);
    notifyFlutter(false, 0, err.message);
  };

  const userPermission = presentation?.permission;

  // Listen for comment drawer open requests from Vue (if Vue implements this event)
  useCommentDrawerTrigger(() => setIsCommentDrawerOpen(true));

  // Show loading state
  if (isLoading) {
    return <GlobalSpinner text={t('presentation')} />;
  }

  // Show error state
  if (error || !presentation) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white p-4">
        <div className="text-center text-red-500">
          <p className="font-bold">Error loading presentation</p>
          <p className="text-sm">{error || 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-white">
      <VueRemoteWrapper
        modulePath="editor"
        mountProps={{
          presentation,
          isRemote: true,
          mode: 'view', // Always view-only in embed mode
          permission: userPermission || 'read',
        }}
        className="vue-remote !h-full !w-full"
        LoadingComponent={() => <GlobalSpinner text={t('presentation')} />}
        onMountSuccess={handleVueMountSuccess}
        onMountError={handleVueMountError}
      />

      {/* Comment Button - Fixed position in top-right corner */}
      <div className="fixed right-4 top-4 z-10">
        <Button
          onClick={() => setIsCommentDrawerOpen(true)}
          title="Comments"
          variant="outline"
          size="icon"
          className="touch-manipulation shadow-md"
        >
          <MessageSquare size={18} />
        </Button>
      </div>

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
    </div>
  );
};

export default PresentationEmbedPage;
