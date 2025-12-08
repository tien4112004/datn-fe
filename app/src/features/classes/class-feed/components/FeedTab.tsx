import { useTranslation } from 'react-i18next';
import { PostCreator } from './PostCreator';
import { PostList } from './PostList';
import { usePosts } from '../hooks/useApi';
import type { FeedFilter } from '../types';
import { Button } from '@/components/ui/button';
import { useClassStore } from '../../shared/stores';

interface FeedPageProps {
  classId: string;
}

export const FeedTab = ({ classId }: FeedPageProps) => {
  const { t } = useTranslation('classes');
  const { posts, loading, error, hasMore, loadMore, refresh, filter, updateFilter } = usePosts(classId);
  const { selectedClass } = useClassStore();

  const handleFilterChange = (type: FeedFilter['type']) => {
    updateFilter({ type });
  };

  const filterOptions = [
    { value: 'all' as const, label: t('feed.header.filters.all') },
    { value: 'announcements' as const, label: t('feed.header.filters.announcements') },
    { value: 'posts' as const, label: t('feed.header.filters.posts') },
  ];

  return (
    <div className="min-h-screen">
      <div className="border-b bg-white px-4 py-6">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            {t('feed.header.title', { className: selectedClass?.name })}
          </h1>
          <p className="mb-4 text-gray-600">{t('feed.header.subtitle')}</p>

          {/* Filter Tabs */}
          <div className="flex justify-between">
            <div className="flex space-x-1">
              {filterOptions.map((option) => (
                <Button
                  key={option.value}
                  onClick={() => handleFilterChange(option.value)}
                  className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                  variant={filter.type === option.value ? 'default' : 'outline'}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <PostCreator className="ml-4" classId={classId} onPostCreated={refresh} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
        {/* Error State */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center">
              <svg
                className="mr-2 h-5 w-5 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-700">{error?.message || String(error)}</p>
            </div>
            <button
              onClick={() => refresh()}
              className="mt-2 text-sm text-red-600 underline hover:text-red-800"
            >
              {t('feed.errors.tryAgain')}
            </button>
          </div>
        )}

        {/* Posts List */}
        <PostList posts={posts} onLoadMore={loadMore} hasMore={hasMore} loading={loading} />
      </div>
    </div>
  );
};
