export type ResourceType =
  | 'PRESENTATION'
  | 'SLIDE'
  | 'IMAGE'
  | 'MINDMAP'
  | 'QUESTION'
  | 'ASSIGNMENT'
  | 'OUTLINE';

export type UnitType = 'PER_REQUEST' | 'PER_SLIDE' | 'PER_IMAGE' | 'PER_QUESTION';

export interface CoinPricing {
  id: string;
  resourceType: ResourceType;
  resourceTypeDisplayName: string;
  modelName: string | null;
  baseCost: number;
  unitType: UnitType;
  unitTypeDisplayName: string;
  unitMultiplier: number;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CoinPricingCreateRequest {
  resourceType: ResourceType;
  modelName?: string | null;
  baseCost: number;
  unitType?: UnitType;
  unitMultiplier?: number;
  description?: string | null;
  isActive?: boolean;
}

export interface CoinPricingUpdateRequest {
  baseCost?: number;
  unitType?: UnitType;
  unitMultiplier?: number;
  description?: string | null;
  isActive?: boolean;
}

export interface CoinPricingQueryParams {
  resourceType?: ResourceType;
  isActive?: boolean;
}

export interface EnumOption {
  value: string;
  label: string;
}

export const RESOURCE_TYPES: { value: ResourceType; label: string }[] = [
  { value: 'PRESENTATION', label: 'Presentation' },
  { value: 'SLIDE', label: 'Slide' },
  { value: 'IMAGE', label: 'Image' },
  { value: 'MINDMAP', label: 'Mindmap' },
  { value: 'QUESTION', label: 'Question' },
  { value: 'ASSIGNMENT', label: 'Assignment' },
  { value: 'OUTLINE', label: 'Outline' },
];

export const UNIT_TYPES: { value: UnitType; label: string }[] = [
  { value: 'PER_REQUEST', label: 'Per Request' },
  { value: 'PER_SLIDE', label: 'Per Slide' },
  { value: 'PER_IMAGE', label: 'Per Image' },
  { value: 'PER_QUESTION', label: 'Per Question' },
];

export const RESOURCE_TYPE_COLORS: Record<ResourceType, string> = {
  PRESENTATION: 'bg-blue-50 text-blue-700 ring-blue-700/10',
  SLIDE: 'bg-cyan-50 text-cyan-700 ring-cyan-700/10',
  IMAGE: 'bg-green-50 text-green-700 ring-green-700/10',
  MINDMAP: 'bg-purple-50 text-purple-700 ring-purple-700/10',
  QUESTION: 'bg-orange-50 text-orange-700 ring-orange-700/10',
  ASSIGNMENT: 'bg-pink-50 text-pink-700 ring-pink-700/10',
  OUTLINE: 'bg-yellow-50 text-yellow-700 ring-yellow-700/10',
};
