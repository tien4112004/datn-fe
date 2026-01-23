import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Settings2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { useReactFlow } from '@xyflow/react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AutosizeTextarea } from '@/components/ui/autosize-textarea';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Separator } from '@/shared/components/ui/separator';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { LAYOUT_TYPE } from '../../types';
import type { MindMapNode, MindMapEdge } from '../../types';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { ModelSelect } from '@/features/model/components/ModelSelect';
import { useModels, MODEL_TYPES } from '@/features/model';
import { LANGUAGE_OPTIONS, MAX_DEPTH_OPTIONS, MAX_BRANCHES_OPTIONS } from '../../types/form';
import type { CreateMindmapFormData } from '../../types/form';
import { useGenerateMindmap } from '../../hooks/useApi';
import { convertAiDataToMindMapNodes, getTreeLayoutType } from '../../services/utils';
import { useCoreStore, useLayoutStore, useUndoRedoStore } from '../../stores';
import { MINDMAP_TYPES } from '../../types/constants';

interface GenerateTreeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

function GenerateTreeDialog({ isOpen, onOpenChange }: GenerateTreeDialogProps) {
  const { t } = useTranslation(I18N_NAMESPACES.MINDMAP);
  const reactFlowInstance = useReactFlow();

  // Get models
  const { models, isLoading: isModelsLoading, isError: isModelsError } = useModels(MODEL_TYPES.TEXT);

  // Get stores
  const { nodes, setNodes, setEdges } = useCoreStore();
  const { applyAutoLayout } = useLayoutStore();
  const { prepareToPushUndo, pushToUndoStack } = useUndoRedoStore();

  // Get API hook
  const generateMutation = useGenerateMindmap();

  // Get current layout type from existing nodes
  const currentLayoutType = nodes.length > 0 ? getTreeLayoutType(nodes) : LAYOUT_TYPE.HORIZONTAL_BALANCED;

  // Form state using react-hook-form
  const form = useForm<CreateMindmapFormData>({
    defaultValues: {
      topic: '',
      model: {
        name: '',
        provider: '',
      },
      language: 'en',
      maxDepth: 3,
      maxBranchesPerNode: 5,
    },
  });

  const { control, handleSubmit, watch, reset } = form;
  const topicValue = watch('topic');

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: CreateMindmapFormData) => {
    setError(null);
    setIsGenerating(true);
    prepareToPushUndo();

    try {
      // Generate AI nodes using the API
      const aiResponse = await generateMutation.mutateAsync({
        topic: data.topic,
        model: data.model.name,
        provider: data.model.provider,
        language: data.language,
        maxDepth: data.maxDepth,
        maxBranchesPerNode: data.maxBranchesPerNode,
      });

      // Get current viewport center as base position
      const viewportCenter = reactFlowInstance.screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });

      // Convert AI response to mindmap nodes/edges with layout applied
      const { nodes: aiNodes, edges: aiEdges } = await convertAiDataToMindMapNodes(
        aiResponse,
        viewportCenter,
        currentLayoutType
      );

      // Add generated nodes to the existing mindmap
      setNodes((existingNodes: MindMapNode[]) => [
        ...existingNodes.map((node) => ({ ...node, selected: false })),
        ...aiNodes.map((node) => ({ ...node, selected: true })),
      ]);
      setEdges((existingEdges: MindMapEdge[]) => [...existingEdges, ...aiEdges]);

      // Apply layout to the newly added root node
      const newRootNode = aiNodes.find((n) => n.type === MINDMAP_TYPES.ROOT_NODE);
      if (newRootNode) {
        setTimeout(() => {
          applyAutoLayout(newRootNode.id);
        }, 200);
      }

      pushToUndoStack();
      reset();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate mindmap tree');
      console.error('Tree generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCancel = () => {
    reset();
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] !max-w-4xl p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="text-primary h-5 w-5" />
            {t('generate.title')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden px-4">
          <div className="flex flex-1">
            {/* Left Side - Form and Options */}
            <div className="flex w-full flex-col border-r">
              <ScrollArea className="flex-1 p-6">
                {/* Topic Section */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="topic">{t('create.promptTitle')}</Label>
                    <Controller
                      name="topic"
                      control={control}
                      rules={{ required: true, minLength: 1, maxLength: 500 }}
                      render={({ field }) => (
                        <div className="px-2">
                          <AutosizeTextarea
                            id="topic"
                            placeholder={t('create.promptPlaceholder')}
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            minHeight={80}
                            maxHeight={200}
                            className="w-full"
                          />
                        </div>
                      )}
                    />
                    <p className="text-muted-foreground text-xs">{t('generate.prompt.hint')}</p>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Advanced Options Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Settings2 className="text-muted-foreground h-4 w-4" />
                    <h3 className="font-semibold">{t('generate.options.title')}</h3>
                  </div>

                  {/* Model and Language Row */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Model */}
                    <div className="space-y-2">
                      <Label>{t('create.model.label')}</Label>
                      <Controller
                        name="model"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <ModelSelect
                            models={models}
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder={t('create.model.placeholder')}
                            label={t('create.model.label')}
                            isLoading={isModelsLoading}
                            isError={isModelsError}
                          />
                        )}
                      />
                    </div>

                    {/* Language */}
                    <div className="space-y-2">
                      <Label>{t('create.language.label')}</Label>
                      <Controller
                        name="language"
                        control={control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder={t('create.language.placeholder')} />
                            </SelectTrigger>
                            <SelectContent>
                              {LANGUAGE_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {t(`create.language.${opt.labelKey}` as never)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>

                  {/* Max Depth and Max Branches Row */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Max Depth */}
                    <div className="space-y-2">
                      <Label>{t('create.maxDepth.label')}</Label>
                      <Controller
                        name="maxDepth"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={String(field.value)}
                            onValueChange={(v) => field.onChange(Number(v))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {MAX_DEPTH_OPTIONS.map((depth) => (
                                <SelectItem key={depth} value={String(depth)}>
                                  {depth}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <p className="text-muted-foreground text-xs">{t('create.maxDepth.description')}</p>
                    </div>

                    {/* Max Branches Per Node */}
                    <div className="space-y-2">
                      <Label>{t('create.maxBranches.label')}</Label>
                      <Controller
                        name="maxBranchesPerNode"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={String(field.value)}
                            onValueChange={(v) => field.onChange(Number(v))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {MAX_BRANCHES_OPTIONS.map((branches) => (
                                <SelectItem key={branches} value={String(branches)}>
                                  {branches}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <p className="text-muted-foreground text-xs">{t('create.maxBranches.description')}</p>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="border-t bg-red-50 px-6 py-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <DialogFooter className="border-t px-6 py-4">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isGenerating}>
              {t('generate.actions.cancel')}
            </Button>
            <Button type="submit" disabled={!topicValue.trim() || isGenerating} className="gap-2">
              <Sparkles className="h-4 w-4" />
              {isGenerating ? t('create.generating') : t('generate.actions.generate')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default GenerateTreeDialog;
