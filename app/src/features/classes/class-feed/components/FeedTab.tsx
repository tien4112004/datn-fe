import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { PostCreator } from './PostCreator';
import { PostList } from './PostList';
import { usePosts } from '../hooks/useApi';
import type { FeedFilter } from '../types';
import { AlertCircle, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useAuth } from '@/shared/context/auth';
import { useState, useEffect } from 'react';

interface FeedPageProps {
  classId: string;
  initialFilter?: FeedFilter['type'];
  onNavigateToFeed?: () => void;
}

export const FeedTab = ({ classId, initialFilter, onNavigateToFeed }: FeedPageProps) => {
  const { t } = useTranslation('classes');
  const { user } = useAuth();
  const { posts, loading, error, hasMore, loadMore, refresh, filter, updateFilter } = usePosts(
    classId,
    initialFilter
  );
  const location = useLocation();

  const [banner, setBanner] = useState<string | null>(location.state?.banner ?? null);

  useEffect(() => {
    if (location.state?.banner) {
      setBanner(location.state.banner);
      // Clear from history state so it doesn't reappear on re-render
      window.history.replaceState(
        { ...window.history.state, usr: { ...location.state, banner: undefined } },
        ''
      );
    }
  }, [location.state?.banner]);

  const isStudent = user?.role === 'student';
  const isTeacher = !isStudent;

  const handleFilterChange = (type: FeedFilter['type']) => {
    if (type === 'all' && onNavigateToFeed) {
      onNavigateToFeed();
      return;
    }
    updateFilter({ type });
  };

  const filterOptions = [
    { value: 'all' as const, label: t('feed.header.filters.all') },
    { value: 'Post' as const, label: t('feed.header.filters.posts') },
    { value: 'Exercise' as const, label: t('feed.header.filters.homework') },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Sticky Top Bar */}
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-10 backdrop-blur">
        <div className="container mx-auto max-w-4xl px-4 py-3 md:px-6 md:py-4">
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            {/* Filter Tabs */}
            <nav className="flex-1">
              <div className="flex gap-1">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleFilterChange(option.value)}
                    className={cn(
                      'rounded-lg px-4 py-2 text-sm font-medium transition-all',
                      filter.type === option.value
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </nav>

            {isTeacher && (
              <PostCreator
                classId={classId}
                onPostCreated={refresh}
                initialType={filter.type === 'Exercise' ? 'Exercise' : 'Post'}
              />
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="container mx-auto max-w-4xl">
            {/* Deleted Content Banner */}
            {banner && (
              <div className="bg-destructive/10 border-destructive mt-4 flex items-center gap-3 border-l-4 px-5 py-4 md:mt-6">
                <AlertCircle className="text-destructive h-5 w-5 shrink-0" />
                <p className="text-destructive flex-1 text-base font-medium">{banner}</p>
                <button
                  onClick={() => setBanner(null)}
                  className="text-destructive/70 hover:text-destructive ml-2 shrink-0"
                  aria-label="Dismiss"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="border-destructive bg-destructive/10 mt-4 border-l-4 p-3 md:mt-6 md:p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="text-destructive h-5 w-5" />
                  <p className="text-destructive text-sm font-medium">{error?.message || String(error)}</p>
                </div>
              </div>
            )}

            {/* Posts List */}
            <PostList
              posts={posts}
              onLoadMore={loadMore}
              hasMore={hasMore}
              loading={loading}
              filterType={filter.type}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
