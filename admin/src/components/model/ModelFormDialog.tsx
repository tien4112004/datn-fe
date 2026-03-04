import { useEffect, useState } from 'react';
import { Button } from '@ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@ui/dialog';
import { Input } from '@ui/input';
import { Label } from '@ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select';
import { MODEL_TYPES } from '@aiprimary/core';
import type { Model, ModelCreateData, ModelType, ModelUpdateData } from '@aiprimary/core';

interface ModelFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided the dialog is in edit mode; otherwise it is in create mode. */
  model?: Model | null;
  onSubmit: (data: ModelCreateData | ModelUpdateData) => void;
  providers: string[];
  isPending?: boolean;
}

const emptyForm = {
  modelName: '',
  displayName: '',
  provider: '',
  modelType: 'TEXT' as ModelType,
};

export function ModelFormDialog({
  open,
  onOpenChange,
  model,
  onSubmit,
  providers,
  isPending = false,
}: ModelFormDialogProps) {
  const isEditing = !!model;
  const [formData, setFormData] = useState(emptyForm);

  // Seed form when opening in edit mode; reset when opening in create mode
  useEffect(() => {
    if (open) {
      if (model) {
        setFormData({
          modelName: model.name,
          displayName: model.displayName,
          provider: model.provider,
          modelType: model.type,
        });
      } else {
        setFormData(emptyForm);
      }
    }
  }, [open, model]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setFormData(emptyForm);
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      const updateData: ModelUpdateData = {
        modelName: formData.modelName,
        displayName: formData.displayName,
        provider: formData.provider,
      };
      onSubmit(updateData);
    } else {
      const createData: ModelCreateData = {
        modelName: formData.modelName,
        displayName: formData.displayName,
        provider: formData.provider,
        modelType: formData.modelType,
      };
      onSubmit(createData);
    }
  };

  const isValid = formData.modelName.trim() && formData.displayName.trim() && formData.provider;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Model' : 'Create New Model'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the model name, display name, or provider.'
              : 'Add a new AI model to the platform'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="provider">Provider</Label>
            <Select
              value={formData.provider}
              onValueChange={(value) => setFormData({ ...formData, provider: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => (
                  <SelectItem key={provider} value={provider}>
                    {provider}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="modelName">Model Name</Label>
            <Input
              id="modelName"
              value={formData.modelName}
              onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
              placeholder="e.g., gpt-4o-mini"
              required
            />
            <p className="text-muted-foreground text-xs">The model identifier used by the provider</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              placeholder="e.g., GPT-4 Optimized"
              required
            />
          </div>

          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="modelType">Model Type</Label>
              <Select
                value={formData.modelType}
                onValueChange={(value) => setFormData({ ...formData, modelType: value as ModelType })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select model type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(MODEL_TYPES).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !isValid}>
              {isPending
                ? isEditing
                  ? 'Saving...'
                  : 'Creating...'
                : isEditing
                  ? 'Save Changes'
                  : 'Create Model'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
