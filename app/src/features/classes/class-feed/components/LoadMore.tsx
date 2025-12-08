import { useTranslation } from 'react-i18next';

interface LoadMoreProps {
  onLoadMore: () => void;
  loading: boolean;
  hasMore: boolean;
  className?: string;
}

export const LoadMore = ({ onLoadMore, loading, hasMore, className = '' }: LoadMoreProps) => {
  const { t } = useTranslation('classes');
  if (!hasMore) return null;

  return (
    <div className={`py-6 text-center ${className}`}>
      <button
        onClick={onLoadMore}
        disabled={loading}
        className="rounded-lg bg-blue-500 px-6 py-3 font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <div className="flex items-center space-x-2">
            <div className="inline-block h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
            <span>{t('feed.list.loadingMore')}</span>
          </div>
        ) : (
          t('feed.list.loadMore')
        )}
      </button>
    </div>
  );
};
