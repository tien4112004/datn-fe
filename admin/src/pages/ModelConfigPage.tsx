import { useCallback, useMemo, useState } from 'react';
import { useModels, useCreateModel, useDeleteModel, usePatchModel, useUpdateModel } from '@/hooks';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card';
import { Button } from '@ui/button';
import { Switch } from '@ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@ui/alert-dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from '@/components/table';
import { ModelFormDialog } from '@/components/model/ModelFormDialog';
import type { Model, ModelCreateData, ModelType, ModelUpdateData } from '@aiprimary/core';
import { MODEL_TYPES } from '@aiprimary/core';

const columnHelper = createColumnHelper<Model>();

const MEDIA_TYPE_COLORS = {
  TEXT: 'bg-blue-50 text-blue-700 ring-blue-700/10',
  IMAGE: 'bg-green-50 text-green-700 ring-green-700/10',
} as const;

type ModelFilter = 'active' | 'all';

const getMediaTypeColor = (type: string) =>
  MEDIA_TYPE_COLORS[type as keyof typeof MEDIA_TYPE_COLORS] || 'bg-gray-50 text-gray-700 ring-gray-700/10';

const getDefaultModelForMediaType = (mediaType: string, models: Model[]) => {
  return models.find((model) => model.default && model.type === mediaType && !model.deletedAt)?.id || '';
};

const getModelsForMediaType = (mediaType: string, models: Model[]) => {
  return models.filter((model) => model.enabled && model.type === mediaType && !model.deletedAt) || [];
};

export function ModelConfigPage() {
  const [filter, setFilter] = useState<ModelFilter>('active');
  const includeDeleted = filter === 'all';
  const { data, isLoading, isError } = useModels(undefined, includeDeleted);
  const createMutation = useCreateModel();
  const deleteMutation = useDeleteModel();
  const patchMutation = usePatchModel();
  const updateMutation = useUpdateModel();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [deletingModel, setDeletingModel] = useState<Model | null>(null);

  const models = data?.data || [];

  const providers = useMemo(
    () => [...new Set(models.filter((m) => !m.deletedAt).map((m) => m.provider))].sort(),
    [models]
  );

  const handleFormSubmit = useCallback(
    async (data: ModelCreateData | ModelUpdateData) => {
      if (editingModel) {
        await updateMutation.mutateAsync({ id: editingModel.id, data: data as ModelUpdateData });
        setEditingModel(null);
      } else {
        await createMutation.mutateAsync(data as ModelCreateData);
        setCreateDialogOpen(false);
      }
    },
    [editingModel, updateMutation, createMutation]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingModel) return;
    await deleteMutation.mutateAsync(deletingModel.id);
    setDeletingModel(null);
  }, [deletingModel, deleteMutation]);

  const toggleModelEnabled = useCallback(
    async (model: Model) => {
      const newStatus = !model.enabled;
      try {
        await patchMutation.mutateAsync({
          id: model.id,
          data: { isEnabled: newStatus },
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
        data: { isDefault: true },
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
        cell: (info) => {
          const isDeleted = !!info.row.original.deletedAt;
          return (
            <span className={`font-medium ${isDeleted ? 'text-muted-foreground line-through' : ''}`}>
              {info.getValue()}
              {isDeleted && (
                <span className="ml-2 inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 no-underline ring-1 ring-inset ring-red-700/10">
                  Deleted
                </span>
              )}
            </span>
          );
        },
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
        cell: ({ row }) => {
          if (row.original.deletedAt) return null;
          return (
            <Switch
              checked={row.original.enabled}
              onCheckedChange={() => toggleModelEnabled(row.original)}
              disabled={patchMutation.isPending}
            />
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          if (row.original.deletedAt) return null;
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingModel(row.original)}
                disabled={updateMutation.isPending}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeletingModel(row.original)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="text-destructive h-4 w-4" />
              </Button>
            </div>
          );
        },
      }),
    ],
    [toggleModelEnabled, patchMutation.isPending, deleteMutation.isPending, updateMutation.isPending]
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

  // Use only active models for default model selection
  const activeModels = models.filter((m) => !m.deletedAt);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Model Configuration</h1>
        <p className="text-muted-foreground">Configure AI models and their settings</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>AI Models</CardTitle>
            <CardDescription>Enable or disable AI models for the platform</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={(v) => setFilter(v as ModelFilter)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Model
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            table={table}
            isLoading={isLoading}
            emptyState={<span className="text-muted-foreground">No models configured</span>}
          />
        </CardContent>
      </Card>

      <ModelFormDialog
        open={createDialogOpen || !!editingModel}
        onOpenChange={(open) => {
          if (!open) {
            setCreateDialogOpen(false);
            setEditingModel(null);
          }
        }}
        model={editingModel}
        onSubmit={handleFormSubmit}
        providers={providers}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      <AlertDialog open={!!deletingModel} onOpenChange={(open) => !open && setDeletingModel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Model</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong>{deletingModel?.displayName || deletingModel?.name}</strong>
              {deletingModel?.provider && <> ({deletingModel.provider})</>}? The model will be archived and
              can still be viewed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
              const availableModels = getModelsForMediaType(mediaType, activeModels);
              const currentDefault = getDefaultModelForMediaType(mediaType, activeModels);
              const defaultModel = activeModels.find((m: Model) => m.id === currentDefault);

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
          {Object.values(MODEL_TYPES).every(
            (type) => getModelsForMediaType(type, activeModels).length === 0
          ) && (
            <div className="mt-4 rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">No enabled models available. Enable models above first.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
