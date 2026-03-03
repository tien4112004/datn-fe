import { useState } from 'react';
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
import type { ModelCreateData, ModelType } from '@aiprimary/core';

interface CreateModelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ModelCreateData) => void;
  providers: string[];
  isPending?: boolean;
}

const initialFormData: ModelCreateData = {
  modelName: '',
  displayName: '',
  provider: '',
  modelType: 'TEXT' as ModelType,
};

export function CreateModelDialog({
  open,
  onOpenChange,
  onSubmit,
  providers,
  isPending = false,
}: CreateModelDialogProps) {
  const [formData, setFormData] = useState<ModelCreateData>(initialFormData);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setFormData(initialFormData);
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isValid = formData.modelName.trim() && formData.displayName.trim() && formData.provider;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Model</DialogTitle>
          <DialogDescription>Add a new AI model to the platform</DialogDescription>
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !isValid}>
              {isPending ? 'Creating...' : 'Create Model'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
