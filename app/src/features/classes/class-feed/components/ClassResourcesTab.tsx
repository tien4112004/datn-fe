import { Loader2, FolderOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useClassResources } from '../hooks';
import { useLinkedResources } from '../hooks/useLinkedResources';
import { ResourceCard } from './ResourceCard';

interface ClassResourcesTabProps {
  classId: string;
}

export const ClassResourcesTab = ({ classId }: ClassResourcesTabProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'resources.tab' });
  const { resources: linkedResourcesResponse, loading, error } = useClassResources(classId);

  // Use the linked resources hook to enrich the data with titles and thumbnails
  const { data: enrichedResources, isLoading: isEnriching } = useLinkedResources({
    linkedResources: linkedResourcesResponse,
    enabled: linkedResourcesResponse.length > 0,
  });

  const isLoading = loading || isEnriching;
  const resources = enrichedResources || [];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <p className="text-destructive font-medium">{t('error')}</p>
          <p className="text-muted-foreground text-sm">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
        </div>
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <FolderOpen className="text-muted-foreground mx-auto h-12 w-12" />
          <h3 className="mt-4 text-lg font-semibold">{t('empty.title')}</h3>
          <p className="text-muted-foreground mt-2 text-sm">{t('empty.description')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="mb-4 text-xl font-semibold sm:mb-6 sm:text-2xl">{t('title')}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-5">
        {resources.map((resource) => (
          <ResourceCard
            key={`${resource.type}:${resource.id}`}
            id={resource.id}
            type={resource.type}
            title={resource.title}
            thumbnail={resource.thumbnail}
            permissionLevel={resource.permissionLevel}
            variant="card"
          />
        ))}
      </div>
    </div>
  );
};
