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
import { Switch } from '@/components/ui/switch';
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

interface CoinPricingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pricing?: CoinPricing | null;
  onSubmit: (data: CoinPricingCreateRequest | CoinPricingUpdateRequest) => void;
  isPending?: boolean;
}

interface FormData {
  resourceType: ResourceType;
  modelName: string;
  baseCost: string;
  unitType: UnitType;
  unitMultiplier: string;
  description: string;
  isActive: boolean;
}

function getDefaultFormData(): FormData {
  return {
    resourceType: 'PRESENTATION',
    modelName: '',
    baseCost: '',
    unitType: 'PER_REQUEST',
    unitMultiplier: '1',
    description: '',
    isActive: true,
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

  const isEditing = !!pricing?.id;

  useEffect(() => {
    if (pricing) {
      setFormData({
        resourceType: pricing.resourceType,
        modelName: pricing.modelName || '',
        baseCost: pricing.baseCost.toString(),
        unitType: pricing.unitType,
        unitMultiplier: pricing.unitMultiplier.toString(),
        description: pricing.description || '',
        isActive: pricing.isActive,
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

    const multiplierNum = parseFloat(formData.unitMultiplier);
    if (isNaN(multiplierNum) || multiplierNum <= 0) {
      newErrors.unitMultiplier = 'Unit multiplier must be a positive number';
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
        unitMultiplier: parseFloat(formData.unitMultiplier),
        description: formData.description || null,
        isActive: formData.isActive,
      };
      onSubmit(updateData);
    } else {
      const createData: CoinPricingCreateRequest = {
        resourceType: formData.resourceType,
        modelName: formData.modelName || null,
        baseCost: parseInt(formData.baseCost, 10),
        unitType: formData.unitType,
        unitMultiplier: parseFloat(formData.unitMultiplier),
        description: formData.description || null,
        isActive: formData.isActive,
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

          {/* Model Name */}
          <div className="space-y-2">
            <Label htmlFor="modelName">Model Name (Optional)</Label>
            <Input
              id="modelName"
              value={formData.modelName}
              onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
              placeholder="e.g., gpt-4o, dall-e-3"
              disabled={isEditing}
            />
            <p className="text-muted-foreground text-xs">
              Leave empty for default pricing. Specify a model name for model-specific pricing.
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

          {/* Unit Multiplier */}
          <div className="space-y-2">
            <Label htmlFor="unitMultiplier">Unit Multiplier</Label>
            <Input
              id="unitMultiplier"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.unitMultiplier}
              onChange={(e) => setFormData({ ...formData, unitMultiplier: e.target.value })}
              placeholder="1.0"
            />
            {errors.unitMultiplier && <p className="text-sm text-red-500">{errors.unitMultiplier}</p>}
            <p className="text-muted-foreground text-xs">
              Multiplier for quantity-based pricing (total = baseCost * quantity * multiplier)
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

          {/* Active Status */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">Active</Label>
              <p className="text-muted-foreground text-xs">Enable or disable this pricing rule</p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
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
