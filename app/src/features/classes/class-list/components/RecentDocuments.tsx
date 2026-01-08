import { useMemo } from 'react';
import { Link } from 'react-router-dom';

interface DocumentItem {
  id: string;
  title: string;
  thumbnail?: string;
  updatedAt: string;
  type: 'presentation' | 'mindmap';
  path: string;
}

// Mock data
const mockDocuments: DocumentItem[] = [
  {
    id: 'doc-1',
    title: 'Introduction to React Hooks',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    type: 'presentation',
    path: '/presentation/doc-1',
  },
  {
    id: 'doc-2',
    title: 'Project Architecture Overview',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    type: 'mindmap',
    path: '/mindmap/doc-2',
  },
  {
    id: 'doc-3',
    title: 'Advanced TypeScript Patterns',
    thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=300&fit=crop',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    type: 'presentation',
    path: '/presentation/doc-3',
  },
  {
    id: 'doc-4',
    title: 'Database Schema Design',
    thumbnail: undefined,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    type: 'mindmap',
    path: '/mindmap/doc-4',
  },
];

export const RecentDocuments = () => {
  const isLoading = false;

  const documents = useMemo(() => {
    return mockDocuments
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 4);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Edited: Today';
    if (diffDays === 1) return 'Edited: Yesterday';
    if (diffDays < 7) return `Edited: ${diffDays} days ago`;
    if (diffDays < 30)
      return `Edited: ${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return `Edited: ${date.toLocaleDateString()}`;
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <h2 className="mb-6 text-2xl font-semibold">Recent Documents</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card flex flex-col rounded-lg border p-4">
              <div className="bg-muted mb-3 aspect-video w-full animate-pulse rounded-md" />
              <div className="bg-muted mb-2 h-4 w-3/4 animate-pulse rounded" />
              <div className="bg-muted h-3 w-1/2 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="mb-6 text-2xl font-semibold">Recent Documents</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {documents.map((doc) => (
          <Link
            key={doc.id}
            to={doc.path}
            className="hover:bg-muted/50 bg-card group flex flex-col rounded-lg border p-4 transition-colors"
          >
            <div className="bg-muted mb-3 aspect-video w-full overflow-hidden rounded-md">
              {doc.thumbnail ? (
                <img
                  src={doc.thumbnail}
                  alt={doc.title}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <span className="text-muted-foreground text-xs">No preview</span>
                </div>
              )}
            </div>
            <h3 className="mb-1 truncate text-sm font-medium">{doc.title}</h3>
            <p className="text-muted-foreground text-xs">{formatDate(doc.updatedAt)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};
