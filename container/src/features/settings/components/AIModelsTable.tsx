import { useMemo } from 'react';
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
            <h3 className="text-lg font-medium">AI Models</h3>
            <p className="text-muted-foreground text-sm">Loading available AI models...</p>
          </div>
          <div className="rounded-lg border p-8 text-center">
            <p className="text-muted-foreground">Loading models...</p>
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
            <h3 className="text-lg font-medium">AI Models</h3>
            <p className="text-muted-foreground text-sm">Failed to load AI models.</p>
          </div>
          <div className="border-destructive/20 rounded-lg border p-8 text-center">
            <p className="text-destructive">Error loading models. Please try again later.</p>
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
          <h3 className="text-lg font-medium">AI Models</h3>
          <p className="text-muted-foreground text-sm">
            Manage available AI models and their configurations.
          </p>
        </div>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Media Types</TableHead>
                <TableHead>Model ID</TableHead>
                <TableHead>Status</TableHead>
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
          <h3 className="text-lg font-medium">Default Models</h3>
          <p className="text-muted-foreground text-sm">
            Set the default model for each media type. Only enabled models are available for selection.
          </p>
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
                        availableModels.length === 0 ? 'No models available' : 'Select default model'
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
                    Current: {defaultModel.name} by {defaultModel.provider}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        {getAvailableMediaTypes().length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-muted-foreground">
              No enabled models available. Enable at least one model to set defaults.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIModelsTable;
