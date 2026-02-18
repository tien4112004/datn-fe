import { useEffect, useRef, useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageSquare } from 'lucide-react';
import VueRemoteWrapper from '@/features/presentation/components/remote/VueRemoteWrapper';
import GlobalSpinner from '@/shared/components/common/GlobalSpinner';
import { Button } from '@ui/button';
import { CommentDrawer } from '@/features/comments';
import { useCommentDrawerTrigger } from '../hooks/useDetailPresentation';
import type { Presentation } from '../types';

/** Notify Flutter via InAppWebView JavaScript handler */
const notifyFlutter = (handler: string, data: Record<string, unknown>) => {
  if ((window as any).flutter_inappwebview) {
    (window as any).flutter_inappwebview.callHandler(handler, data);
  }
};

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
  const { presentation } = useLoaderData() as { presentation: Presentation };
  const { i18n, t } = useTranslation('glossary', { keyPrefix: 'loading' });

  const [isCommentDrawerOpen, setIsCommentDrawerOpen] = useState(false);
  const localeAppliedRef = useRef(false);

  const userPermission = presentation?.permission;

  // Apply locale from URL (from Flutter) or localStorage - run only once
  useEffect(() => {
    if (localeAppliedRef.current) return;

    const params = new URLSearchParams(window.location.search);
    const urlLocale = params.get('locale');
    const savedLocale = localStorage.getItem('i18nextLng');
    const localeToApply = urlLocale || savedLocale;

    if (localeToApply && localeToApply !== i18n.language) {
      localeAppliedRef.current = true;
      i18n.changeLanguage(localeToApply);
      if (urlLocale) {
        localStorage.setItem('i18nextLng', urlLocale);
      }
    }
  }, [i18n]);

  // Notify Flutter that the embed page is ready
  useEffect(() => {
    notifyFlutter('mobileViewReady', {});
  }, []);

  // Notify Flutter when Vue app mounts successfully
  const handleVueMountSuccess = () => {
    notifyFlutter('presentationLoaded', {
      success: true,
      slideCount: presentation?.slides?.length ?? 0,
    });
  };

  const handleVueMountError = (err: Error) => {
    console.error('Vue mount error:', err);
    notifyFlutter('presentationLoaded', {
      success: false,
      error: err.message,
    });
  };

  // Listen for comment drawer open requests from Vue
  useCommentDrawerTrigger(() => setIsCommentDrawerOpen(true));

  return (
    <div className="fixed inset-0 overflow-hidden bg-white">
      <VueRemoteWrapper
        modulePath="editor"
        mountProps={{
          presentation,
          isRemote: true,
          mode: 'view',
          permission: userPermission || 'read',
        }}
        className="vue-remote !h-full !w-full"
        LoadingComponent={() => <GlobalSpinner text={t('presentation')} />}
        onMountSuccess={handleVueMountSuccess}
        onMountError={handleVueMountError}
      />

      {/* Comment Button */}
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
      <CommentDrawer
        isOpen={isCommentDrawerOpen}
        onOpenChange={setIsCommentDrawerOpen}
        documentId={presentation.id}
        documentType="presentation"
        userPermission={userPermission || 'read'}
      />
    </>
  );
};

export default PresentationEmbedPage;
