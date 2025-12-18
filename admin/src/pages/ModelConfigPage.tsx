import { useCallback, useMemo } from 'react';
import { useModels, usePatchModel } from '@/hooks';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { DataTable } from '@/components/table';
import { MODEL_TYPES, type Model, type ModelType } from '@/types/api';

const columnHelper = createColumnHelper<Model>();

const MEDIA_TYPE_COLORS = {
  TEXT: 'bg-blue-50 text-blue-700 ring-blue-700/10',
  IMAGE: 'bg-green-50 text-green-700 ring-green-700/10',
} as const;

const getMediaTypeColor = (type: string) =>
  MEDIA_TYPE_COLORS[type as keyof typeof MEDIA_TYPE_COLORS] || 'bg-gray-50 text-gray-700 ring-gray-700/10';

const getDefaultModelForMediaType = (mediaType: string, models: Model[]) => {
  return models.find((model) => model.default && model.type === mediaType)?.id || '';
};

const getModelsForMediaType = (mediaType: string, models: Model[]) => {
  return models.filter((model) => model.enabled && model.type === mediaType) || [];
};

export function ModelConfigPage() {
  const { data, isLoading, isError } = useModels();

  const patchMutation = usePatchModel();

  const models = data?.data || [];

  const toggleModelEnabled = useCallback(
    async (model: Model) => {
      const newStatus = !model.enabled;
      try {
        await patchMutation.mutateAsync({
          id: model.id,
          data: { enabled: newStatus },
        });
        toast.success(`Model ${newStatus ? 'enabled' : 'disabled'} successfully`);
      } catch (error) {
        console.error('Failed to update model status:', error);
      }
    },
    [patchMutation]
  );

  const setDefaultModelForMediaType = useCallback(
    async (_mediaType: ModelType, modelId: string) => {
      await patchMutation.mutateAsync({
        id: modelId,
        data: { default: true },
      });
      toast.success('Default model updated successfully');
    },
    [patchMutation]
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row.displayName || row.name, {
        id: 'name',
        header: 'Model',
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor('provider', {
        header: 'Provider',
        cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor('type', {
        header: 'Type',
        cell: (info) => (
          <span
            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getMediaTypeColor(info.getValue())}`}
          >
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('id', {
        header: 'Model ID',
        cell: (info) => <span className="text-muted-foreground font-mono text-sm">{info.getValue()}</span>,
      }),
      columnHelper.display({
        id: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Switch
            checked={row.original.enabled}
            onCheckedChange={() => toggleModelEnabled(row.original)}
            disabled={patchMutation.isPending}
          />
        ),
      }),
    ],
    [toggleModelEnabled, patchMutation.isPending]
  );

  const table = useReactTable({
    data: models,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Model Configuration</h1>
          <p className="text-muted-foreground">Configure AI models and their settings</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>AI Models</CardTitle>
            <CardDescription>Enable or disable AI models for the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <span className="text-muted-foreground">Loading models...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Model Configuration</h1>
          <p className="text-muted-foreground">Configure AI models and their settings</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>AI Models</CardTitle>
            <CardDescription>Enable or disable AI models for the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <span className="text-destructive">Failed to load models. Please try again.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Model Configuration</h1>
        <p className="text-muted-foreground">Configure AI models and their settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Models</CardTitle>
          <CardDescription>Enable or disable AI models for the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            table={table}
            isLoading={isLoading}
            emptyState={<span className="text-muted-foreground">No models configured</span>}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Default Models</CardTitle>
          <CardDescription>
            Select the default model for each content type. This model will be used when no specific model is
            requested.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Object.values(MODEL_TYPES).map((mediaType) => {
              const availableModels = getModelsForMediaType(mediaType, models);
              const currentDefault = getDefaultModelForMediaType(mediaType, models);
              const defaultModel = models.find((m: Model) => m.id === currentDefault);

              return (
                <div key={mediaType} className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getMediaTypeColor(mediaType)}`}
                    >
                      {mediaType}
                    </span>
                  </label>
                  <Select
                    value={currentDefault || ''}
                    onValueChange={(value) => setDefaultModelForMediaType(mediaType, value)}
                    disabled={patchMutation.isPending || availableModels.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          availableModels.length === 0 ? 'No models available' : 'Select default model'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{model.displayName || model.name}</span>
                            <span className="text-muted-foreground text-xs">({model.provider})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {defaultModel && (
                    <p className="text-muted-foreground text-xs">
                      Current: {defaultModel.displayName || defaultModel.name} ({defaultModel.provider})
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          {Object.values(MODEL_TYPES).every((type) => getModelsForMediaType(type, models).length === 0) && (
            <div className="mt-4 rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">No enabled models available. Enable models above first.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
