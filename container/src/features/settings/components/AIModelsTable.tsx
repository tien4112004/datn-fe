import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Switch } from '@/shared/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { useModels, usePatchModel } from '@/features/model/hooks/useApi';
import { MODEL_TYPES, type Model } from '@/features/model/types/model';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import DataTable from '@/components/table/DataTable';

const MEDIA_TYPE_COLORS = {
  TEXT: 'bg-blue-50 text-blue-700 ring-blue-700/10',
  IMAGE: 'bg-green-50 text-green-700 ring-green-700/10',
} as const;

const AIModelsTable = () => {
  const { t } = useTranslation('settings');
  const { models: apiModels, isLoading, isError } = useModels(null);
  const patchModelMutation = usePatchModel();
  const columnHelper = createColumnHelper<Model>();

  const modelsColumns = useMemo(
    () => [
      columnHelper.accessor((row) => row.displayName || row.name, {
        header: t('devtools.aiModels.columns.model'),
        cell: (info) => {
          return <div className="font-medium">{info.getValue()}</div>;
        },
        enableSorting: false,
      }),
      columnHelper.accessor('provider', {
        header: t('devtools.aiModels.columns.provider'),
        cell: (info) => {
          return <div className="text-muted-foreground">{info.getValue()}</div>;
        },
        enableSorting: false,
      }),
      columnHelper.accessor('type', {
        header: t('devtools.aiModels.columns.mediaTypes'),
        cell: (info) => {
          return (
            <span
              className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getMediaTypeColor(info.getValue())}`}
            >
              {info.getValue()}
            </span>
          );
        },
        enableSorting: false,
      }),
      columnHelper.accessor('id', {
        header: t('devtools.aiModels.columns.modelId'),
        cell: (info) => {
          return <div className="text-muted-foreground">{info.getValue()}</div>;
        },
        enableSorting: false,
      }),
      columnHelper.accessor('enabled', {
        header: t('devtools.aiModels.columns.status'),
        cell: (info) => {
          const model = info.row.original;
          return (
            <Switch
              checked={model.enabled}
              onCheckedChange={() => toggleModelEnabled(model.id)}
              disabled={patchModelMutation.isPending}
            />
          );
        },
        enableSorting: false,
      }),
    ],
    []
  );

  const modelsTable = useReactTable({
    data: apiModels || [],
    columns: modelsColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Get default model for a specific media type
  const getDefaultModelForMediaType = useCallback(
    (mediaType: string) => {
      return apiModels?.find((model) => model.default && model.type === mediaType)?.id || '';
    },
    [apiModels]
  );

  const getModelsForMediaType = useCallback(
    (mediaType: string) => {
      return apiModels?.filter((model) => model.enabled && model.type === mediaType) || [];
    },
    [apiModels]
  );

  const getMediaTypeColor = useCallback((type: string) => {
    return (
      MEDIA_TYPE_COLORS[type as keyof typeof MEDIA_TYPE_COLORS] || 'bg-gray-50 text-gray-700 ring-gray-700/10'
    );
  }, []);

  const toggleModelEnabled = useCallback(
    (modelId: string) => {
      const model = apiModels?.find((m) => m.id === modelId);
      if (!model) return;

      patchModelMutation.mutate({
        modelId,
        data: { enabled: !model.enabled },
      });
    },
    [apiModels, patchModelMutation]
  );

  const setDefaultModelForMediaType = useCallback(
    (_mediaType: string, modelId: string) => {
      // Set the selected model as default
      // Note: The API handles unsetting other models' default flag automatically
      patchModelMutation.mutate({
        modelId,
        data: { default: true },
      });
    },
    [patchModelMutation]
  );

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

  if (isError) {
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

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">{t('devtools.aiModels.title')}</h3>
          <p className="text-muted-foreground text-sm">{t('devtools.aiModels.subtitle')}</p>
        </div>

        <DataTable
          table={modelsTable}
          className="rounded-lg border"
          isLoading={isLoading}
          emptyState={
            <div className="p-8 text-center">
              <p className="text-muted-foreground">{t('devtools.aiModels.emptyState')}</p>
            </div>
          }
          showPagination={false}
        />
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">{t('devtools.aiModels.defaultModels.title')}</h3>
          <p className="text-muted-foreground text-sm">{t('devtools.aiModels.defaultModels.subtitle')}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.values(MODEL_TYPES).map((mediaType) => {
            const availableModels = getModelsForMediaType(mediaType);
            const currentDefault = getDefaultModelForMediaType(mediaType);
            const defaultModel = apiModels.find((m: Model) => m.id === currentDefault);

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
        {Object.values(MODEL_TYPES).length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-muted-foreground">{t('devtools.aiModels.defaultModels.noEnabledModels')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIModelsTable;
