import DOMPurify from 'dompurify';
import { TreeDeciduous } from 'lucide-react';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import LoadingButton from '@/components/common/LoadingButton';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { MODEL_TYPES, useModels } from '@/features/model';
import { ModelSelect } from '@/features/model/components/ModelSelect';

import type { SingleNodeContext } from '../../../types/aiModification';
import type { ExpandNodeFormData, ExpandNodeParams } from '../../../types/expandNode';
import { EXPAND_MAX_CHILDREN_OPTIONS, EXPAND_MAX_DEPTH_OPTIONS } from '../../../types/expandNode';

interface ExpandNodeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  context: SingleNodeContext;
  onExpand: (params: ExpandNodeParams) => Promise<void>;
  isExpanding?: boolean;
}

/**
 * Dialog for expanding a single mindmap node with AI-generated children.
 * Allows configuration of generation parameters: depth, branching, language, education level, and model.
 */
export function ExpandNodeDialog({
  isOpen,
  onOpenChange,
  context,
  onExpand,
  isExpanding = false,
}: ExpandNodeDialogProps): React.ReactElement {
  const { t } = useTranslation('mindmap');
  const { models, isLoading: isModelsLoading, isError: isModelsError } = useModels(MODEL_TYPES.TEXT);

  const form = useForm<ExpandNodeFormData>({
    defaultValues: {
      maxChildren: 5,
      maxDepth: 2,
      model: models.find((m) => m.default) || models[0] || { name: '', provider: '' },
    },
  });

  const nodeContent = typeof context.node.data.content === 'string' ? context.node.data.content : '';

  const onSubmit = async (data: ExpandNodeFormData) => {
    try {
      await onExpand({
        nodeId: context.node.id,
        nodeContent,
        maxChildren: data.maxChildren,
        maxDepth: data.maxDepth,
        model: data.model.name,
        provider: data.model.provider,
      });

      form.reset();
      onOpenChange(false);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('expandNode.dialog.title')}</DialogTitle>
          <DialogDescription>{t('expandNode.dialog.description')}</DialogDescription>
        </DialogHeader>

        {/* Current Node Content */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">{t('expandNode.currentNode')}</Label>
          <div
            className="prose prose-sm max-w-none rounded bg-gray-50 p-3 text-sm text-gray-700"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(nodeContent) }}
          />
        </div>

        {/* Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Max Children */}
          <div className="space-y-2">
            <Label htmlFor="maxChildren" className="text-sm font-semibold">
              {t('expandNode.maxChildren')}
            </Label>
            <select
              id="maxChildren"
              {...form.register('maxChildren', { valueAsNumber: true })}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
              disabled={isExpanding}
            >
              {EXPAND_MAX_CHILDREN_OPTIONS.map((num) => (
                <option key={num} value={num}>
                  {num} node{num !== 1 ? 's' : ''}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500">{t('expandNode.maxChildren.hint')}</p>
          </div>

          {/* Max Depth */}
          <div className="space-y-2">
            <Label htmlFor="maxDepth" className="text-sm font-semibold">
              {t('expandNode.maxDepth')}
            </Label>
            <select
              id="maxDepth"
              {...form.register('maxDepth', { valueAsNumber: true })}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
              disabled={isExpanding}
            >
              {EXPAND_MAX_DEPTH_OPTIONS.map((num) => (
                <option key={num} value={num}>
                  {num} level{num !== 1 ? 's' : ''}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500">{t('expandNode.maxDepth.hint')}</p>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">{t('expandNode.model')}</Label>
            <Controller
              control={form.control}
              name="model"
              render={({ field }) => (
                <ModelSelect
                  models={models}
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isExpanding || isModelsLoading}
                  isLoading={isModelsLoading}
                  isError={isModelsError}
                />
              )}
            />
            <p className="text-xs text-gray-500">{t('expandNode.model.hint')}</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isExpanding}
              className="flex-1"
            >
              {t('expandNode.cancel')}
            </Button>
            <LoadingButton
              type="submit"
              loading={isExpanding}
              loadingText={t('expandNode.generating')}
              className="flex-1 gap-2"
            >
              <TreeDeciduous className="h-4 w-4" />
              {t('expandNode.generate')}
            </LoadingButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
