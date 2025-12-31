import { useTranslation } from 'react-i18next';
import { PostCreator } from './PostCreator';
import { PostList } from './PostList';
import { usePosts } from '../hooks/useApi';
import type { FeedFilter } from '../types';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface FeedPageProps {
  classId: string;
}

export const FeedTab = ({ classId }: FeedPageProps) => {
  const { t } = useTranslation('classes');
  const { posts, loading, error, hasMore, loadMore, refresh, filter, updateFilter } = usePosts(classId);

  const handleFilterChange = (type: FeedFilter['type']) => {
    updateFilter({ type });
  };

  const filterOptions = [
    { value: 'all' as const, label: t('feed.header.filters.all') },
    { value: 'announcements' as const, label: t('feed.header.filters.announcements') },
    { value: 'posts' as const, label: t('feed.header.filters.posts') },
    { value: 'assignments' as const, label: t('feed.header.filters.assignments') },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Top Bar */}
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b px-6 py-4 backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          {/* Filter Tabs */}
          <nav className="flex gap-1">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFilterChange(option.value)}
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-colors',
                  'border-b-2',
                  filter.type === option.value
                    ? 'border-primary text-foreground'
                    : 'text-muted-foreground hover:text-foreground border-transparent'
                )}
              >
                {option.label}
              </button>
            ))}
          </nav>

          {/* Create Post Button */}
          <PostCreator classId={classId} onPostCreated={refresh} />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Error State */}
        {error && (
          <div className="border-destructive bg-destructive/10 mx-6 mt-6 border-l-4 p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-destructive h-5 w-5" />
              <p className="text-destructive text-sm font-medium">{error?.message || String(error)}</p>
            </div>
          </div>
        )}

        {/* Posts List */}
        <PostList posts={posts} onLoadMore={loadMore} hasMore={hasMore} loading={loading} />
      </div>
    </div>
  );
};
