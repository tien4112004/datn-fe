import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Switch } from '@/shared/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { useModels, usePatchModel } from '@/features/model/hooks/useApi';
import type { ModelOption } from '@/features/model/types/model';

const MEDIA_TYPE_COLORS = {
  presentation: 'bg-purple-50 text-purple-700 ring-purple-700/10',
  document: 'bg-blue-50 text-blue-700 ring-blue-700/10',
  image: 'bg-green-50 text-green-700 ring-green-700/10',
  video: 'bg-red-50 text-red-700 ring-red-700/10',
  mindmap: 'bg-orange-50 text-orange-700 ring-orange-700/10',
} as const;

interface ExtendedModelOption extends ModelOption {
  mediaTypes: string[];
}

const AIModelsTable = () => {
  const { t } = useTranslation('settings');
  const { models: apiModels, isLoading, isError } = useModels();
  const patchModelMutation = usePatchModel();

  // Extend API models with mock media types
  const extendedModels = useMemo((): ExtendedModelOption[] => {
    if (!apiModels) return [];

    return apiModels.map((model) => ({
      ...model,
      mediaTypes: ['presentation'], // fallback to document
    }));
  }, [apiModels]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">{t('devtools.aiModels.title')}</h3>
            <p className="text-muted-foreground text-sm">{t('devtools.aiModels.loading')}</p>
          </div>
          <div className="rounded-lg border p-8 text-center">
            <p className="text-muted-foreground">{t('devtools.aiModels.loadingModels')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !apiModels) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">{t('devtools.aiModels.title')}</h3>
            <p className="text-muted-foreground text-sm">{t('devtools.aiModels.errorLoading')}</p>
          </div>
          <div className="border-destructive/20 rounded-lg border p-8 text-center">
            <p className="text-destructive">{t('devtools.aiModels.errorMessage')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Get default model for a specific media type
  const getDefaultModelForMediaType = (mediaType: string) => {
    return extendedModels.find((model) => model.default && model.mediaTypes.includes(mediaType))?.id || '';
  };

  const getAvailableMediaTypes = () => {
    const mediaTypes = new Set<string>();
    extendedModels
      .filter((model) => model.enabled)
      .forEach((model) => {
        model.mediaTypes.forEach((type: string) => mediaTypes.add(type));
      });
    return Array.from(mediaTypes).sort();
  };

  const getModelsForMediaType = (mediaType: string) => {
    return extendedModels.filter((model) => model.enabled && model.mediaTypes.includes(mediaType));
  };

  const getMediaTypeColor = (type: string) => {
    return (
      MEDIA_TYPE_COLORS[type as keyof typeof MEDIA_TYPE_COLORS] || 'bg-gray-50 text-gray-700 ring-gray-700/10'
    );
  };

  const toggleModelEnabled = (modelId: string) => {
    const model = extendedModels.find((m) => m.id === modelId);
    if (!model) return;

    patchModelMutation.mutate({
      modelId,
      data: { enabled: !model.enabled },
    });
  };

  const setDefaultModelForMediaType = (_mediaType: string, modelId: string) => {
    // Set the selected model as default
    // Note: The API handles unsetting other models' default flag automatically
    patchModelMutation.mutate({
      modelId,
      data: { default: true },
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">{t('devtools.aiModels.title')}</h3>
          <p className="text-muted-foreground text-sm">{t('devtools.aiModels.subtitle')}</p>
        </div>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('devtools.aiModels.columns.model')}</TableHead>
                <TableHead>{t('devtools.aiModels.columns.provider')}</TableHead>
                <TableHead>{t('devtools.aiModels.columns.mediaTypes')}</TableHead>
                <TableHead>{t('devtools.aiModels.columns.modelId')}</TableHead>
                <TableHead>{t('devtools.aiModels.columns.status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {extendedModels.map((model) => (
                <TableRow key={model.id}>
                  <TableCell className="font-medium">{model.displayName || model.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{model.provider}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {model.mediaTypes.map((type: string) => (
                        <span
                          key={type}
                          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getMediaTypeColor(type)}`}
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-sm">{model.id}</TableCell>
                  <TableCell>
                    <Switch
                      checked={model.enabled}
                      onCheckedChange={() => toggleModelEnabled(model.id)}
                      disabled={patchModelMutation.isPending}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">{t('devtools.aiModels.defaultModels.title')}</h3>
          <p className="text-muted-foreground text-sm">{t('devtools.aiModels.defaultModels.subtitle')}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {getAvailableMediaTypes().map((mediaType) => {
            const availableModels = getModelsForMediaType(mediaType);
            const currentDefault = getDefaultModelForMediaType(mediaType);
            const defaultModel = extendedModels.find((m: ExtendedModelOption) => m.id === currentDefault);

            return (
              <div key={mediaType} className="space-y-2">
                <label className="text-sm font-medium">{mediaType}</label>
                <Select
                  value={currentDefault || ''}
                  onValueChange={(value) => setDefaultModelForMediaType(mediaType, value)}
                  disabled={patchModelMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        availableModels.length === 0
                          ? t('devtools.aiModels.defaultModels.noModelsAvailable')
                          : t('devtools.aiModels.defaultModels.selectDefaultModel')
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{model.name}</span>
                          <span className="text-muted-foreground text-xs">({model.provider})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {defaultModel && (
                  <p className="text-muted-foreground text-xs">
                    {t('devtools.aiModels.defaultModels.currentModel')}: {defaultModel.name}{' '}
                    {t('devtools.aiModels.defaultModels.by')} {defaultModel.provider}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        {getAvailableMediaTypes().length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-muted-foreground">{t('devtools.aiModels.defaultModels.noEnabledModels')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIModelsTable;
