import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { BrainCircuit, ClipboardList, Presentation } from 'lucide-react';
import { useRecentDocuments } from '../hooks/useApi';
import type { DocumentItem } from '../api';
import { getLocaleDateFns } from '@/shared/i18n/helper';
import { useTranslation } from 'react-i18next';

export const RecentDocuments = () => {
  const { documents, isLoading } = useRecentDocuments(12);
  const { t } = useTranslation('dashboard');

  const documentTypeIcons: Record<string, React.ElementType> = {
    mindmap: BrainCircuit,
    presentation: Presentation,
    assignment: ClipboardList,
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const relativeTime = formatDistanceToNow(date, {
      addSuffix: true,
      locale: getLocaleDateFns(),
    });

    return `${t('recentDocuments.edited')}: ${relativeTime}`;
  };

  const buildPath = (doc: DocumentItem) => {
    switch (doc.type) {
      case 'presentation':
        return `/presentation/${doc.id}`;
      case 'mindmap':
        return `/mindmap/${doc.id}`;
      case 'assignment':
        return `/assignments/edit/${doc.id}`;
      default:
        return '/';
    }
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <h2 className="mb-4 text-xl font-semibold sm:mb-6 sm:text-2xl">{t('recentDocuments.title')}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card flex flex-col rounded-lg border p-3 sm:p-4">
              <div className="bg-muted mb-2 aspect-video w-full animate-pulse rounded-md sm:mb-3" />
              <div className="bg-muted mb-2 h-3 w-3/4 animate-pulse rounded sm:h-4" />
              <div className="bg-muted h-2 w-1/2 animate-pulse rounded sm:h-3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="mb-4 text-xl font-semibold sm:mb-6 sm:text-2xl">{t('recentDocuments.title')}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-5">
        {documents.map((doc) => {
          const Icon = documentTypeIcons[doc.type] || Presentation;
          return (
            <Link
              key={doc.id}
              to={buildPath(doc)}
              className="hover:bg-muted/50 bg-card group flex flex-col rounded-lg border p-3 transition-colors sm:p-4"
            >
              <div className="bg-muted mb-2 aspect-video w-full overflow-hidden rounded-md sm:mb-3">
                {doc.thumbnail ? (
                  <img
                    src={doc.thumbnail}
                    alt={doc.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <Icon className="text-muted-foreground h-8 w-8 sm:h-12 sm:w-12" />
                  </div>
                )}
              </div>
              <h3 className="mb-1 line-clamp-2 text-xs font-medium sm:text-sm">{doc.title}</h3>
              <p className="text-muted-foreground truncate text-[10px] sm:text-xs">
                {formatDate(doc.updatedAt)}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
