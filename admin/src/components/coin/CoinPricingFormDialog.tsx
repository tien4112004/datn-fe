import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type {
  CoinPricing,
  CoinPricingCreateRequest,
  CoinPricingUpdateRequest,
  ResourceType,
  UnitType,
} from '@/types/coin';
import { RESOURCE_TYPES, UNIT_TYPES } from '@/types/coin';
import { useEffect, useState } from 'react';
import { useModels } from '@/hooks';

interface CoinPricingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pricing?: CoinPricing | null;
  onSubmit: (data: CoinPricingCreateRequest | CoinPricingUpdateRequest) => void;
  isPending?: boolean;
}

interface FormData {
  resourceType: ResourceType;
  modelId: number | null;
  baseCost: string;
  unitType: UnitType;
  description: string;
}

function getDefaultFormData(): FormData {
  return {
    resourceType: 'PRESENTATION',
    modelId: null,
    baseCost: '',
    unitType: 'PER_REQUEST',
    description: '',
  };
}

export function CoinPricingFormDialog({
  open,
  onOpenChange,
  pricing,
  onSubmit,
  isPending = false,
}: CoinPricingFormDialogProps) {
  const [formData, setFormData] = useState<FormData>(getDefaultFormData());
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const { data: modelsResponse } = useModels();
  const models = modelsResponse?.data || [];

  const isEditing = !!pricing?.id;

  useEffect(() => {
    if (pricing) {
      setFormData({
        resourceType: pricing.resourceType,
        modelId: pricing.modelId,
        baseCost: pricing.baseCost.toString(),
        unitType: pricing.unitType,
        description: pricing.description || '',
      });
    } else {
      setFormData(getDefaultFormData());
    }
    setErrors({});
  }, [pricing, open]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!isEditing && !formData.resourceType) {
      newErrors.resourceType = 'Resource type is required';
    }

    const baseCostNum = parseInt(formData.baseCost, 10);
    if (isNaN(baseCostNum) || baseCostNum < 0) {
      newErrors.baseCost = 'Base cost must be a non-negative number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (isEditing) {
      const updateData: CoinPricingUpdateRequest = {
        baseCost: parseInt(formData.baseCost, 10),
        unitType: formData.unitType,
        description: formData.description || null,
      };
      onSubmit(updateData);
    } else {
      const createData: CoinPricingCreateRequest = {
        resourceType: formData.resourceType,
        modelId: formData.modelId,
        baseCost: parseInt(formData.baseCost, 10),
        unitType: formData.unitType,
        description: formData.description || null,
      };
      onSubmit(createData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Coin Pricing' : 'Create New Coin Pricing'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the pricing configuration for this AI feature'
              : 'Configure pricing for an AI generation feature'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Resource Type */}
          <div className="space-y-2">
            <Label htmlFor="resourceType">Resource Type *</Label>
            <Select
              value={formData.resourceType}
              onValueChange={(value) => setFormData({ ...formData, resourceType: value as ResourceType })}
              disabled={isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select resource type" />
              </SelectTrigger>
              <SelectContent>
                {RESOURCE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.resourceType && <p className="text-sm text-red-500">{errors.resourceType}</p>}
            {isEditing && (
              <p className="text-muted-foreground text-xs">Resource type cannot be changed after creation</p>
            )}
          </div>

          {/* Model */}
          <div className="space-y-2">
            <Label htmlFor="modelId">Model (Optional)</Label>
            <Select
              value={formData.modelId?.toString() || 'default'}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  modelId: value === 'default' ? null : parseInt(value, 10),
                })
              }
              disabled={isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select model (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default (all models)</SelectItem>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.displayName} ({model.provider})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-xs">
              Select "Default" for default pricing. Choose a specific model for model-specific pricing.
            </p>
          </div>

          {/* Base Cost */}
          <div className="space-y-2">
            <Label htmlFor="baseCost">Base Cost (Coins) *</Label>
            <Input
              id="baseCost"
              type="number"
              min="0"
              value={formData.baseCost}
              onChange={(e) => setFormData({ ...formData, baseCost: e.target.value })}
              placeholder="e.g., 10"
            />
            {errors.baseCost && <p className="text-sm text-red-500">{errors.baseCost}</p>}
          </div>

          {/* Unit Type */}
          <div className="space-y-2">
            <Label htmlFor="unitType">Unit Type</Label>
            <Select
              value={formData.unitType}
              onValueChange={(value) => setFormData({ ...formData, unitType: value as UnitType })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select unit type" />
              </SelectTrigger>
              <SelectContent>
                {UNIT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-xs">
              How the cost is calculated (per request, per item, etc.)
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe this pricing rule..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : isEditing ? 'Update Pricing' : 'Create Pricing'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CoinPricingFormDialog;
