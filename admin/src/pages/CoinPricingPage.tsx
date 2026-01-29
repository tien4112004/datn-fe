import { useCallback, useMemo, useState } from 'react';
import { useCoinPricing, useCreateCoinPricing, useUpdateCoinPricing, useDeleteCoinPricing } from '@/hooks';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DataTable } from '@/components/table';
import { CoinPricingFormDialog } from '@/components/coin/CoinPricingFormDialog';
import { Plus, Pencil, Trash2, Coins } from 'lucide-react';
import type {
  CoinPricing,
  CoinPricingCreateRequest,
  CoinPricingUpdateRequest,
  ResourceType,
} from '@/types/coin';
import { RESOURCE_TYPES, RESOURCE_TYPE_COLORS } from '@/types/coin';

const columnHelper = createColumnHelper<CoinPricing>();

export function CoinPricingPage() {
  const [resourceTypeFilter, setResourceTypeFilter] = useState<ResourceType | 'all'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPricing, setEditingPricing] = useState<CoinPricing | null>(null);
  const [deletingPricing, setDeletingPricing] = useState<CoinPricing | null>(null);

  const queryParams = resourceTypeFilter !== 'all' ? { resourceType: resourceTypeFilter } : undefined;
  const { data, isLoading, isError } = useCoinPricing(queryParams);

  const createMutation = useCreateCoinPricing();
  const updateMutation = useUpdateCoinPricing();
  const deleteMutation = useDeleteCoinPricing();

  const pricingList = data?.data || [];

  const handleCreate = useCallback(() => {
    setEditingPricing(null);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((pricing: CoinPricing) => {
    setEditingPricing(pricing);
    setIsFormOpen(true);
  }, []);

  const handleDelete = useCallback((pricing: CoinPricing) => {
    setDeletingPricing(pricing);
  }, []);

  const handleFormSubmit = useCallback(
    async (data: CoinPricingCreateRequest | CoinPricingUpdateRequest) => {
      try {
        if (editingPricing) {
          await updateMutation.mutateAsync({ id: editingPricing.id, data: data as CoinPricingUpdateRequest });
        } else {
          await createMutation.mutateAsync(data as CoinPricingCreateRequest);
        }
        setIsFormOpen(false);
        setEditingPricing(null);
      } catch {
        // Error is handled by the mutation hook
      }
    },
    [editingPricing, createMutation, updateMutation]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (deletingPricing) {
      try {
        await deleteMutation.mutateAsync(deletingPricing.id);
        setDeletingPricing(null);
      } catch {
        // Error is handled by the mutation hook
      }
    }
  }, [deletingPricing, deleteMutation]);

  const toggleActive = useCallback(
    async (pricing: CoinPricing) => {
      try {
        await updateMutation.mutateAsync({
          id: pricing.id,
          data: { isActive: !pricing.isActive },
        });
      } catch {
        // Error is handled by the mutation hook
      }
    },
    [updateMutation]
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor('resourceType', {
        header: 'Resource Type',
        cell: (info) => {
          const type = info.getValue();
          const colorClass = RESOURCE_TYPE_COLORS[type] || 'bg-gray-50 text-gray-700 ring-gray-700/10';
          return (
            <span
              className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${colorClass}`}
            >
              {info.row.original.resourceTypeDisplayName}
            </span>
          );
        },
      }),
      columnHelper.accessor('modelName', {
        header: 'Model',
        cell: (info) => {
          const modelName = info.getValue();
          return modelName ? (
            <span className="font-mono text-sm">{modelName}</span>
          ) : (
            <span className="text-muted-foreground text-sm italic">Default</span>
          );
        },
      }),
      columnHelper.accessor('baseCost', {
        header: 'Base Cost',
        cell: (info) => (
          <div className="flex items-center gap-1">
            <Coins className="h-4 w-4 text-yellow-500" />
            <span className="font-medium">{info.getValue()}</span>
          </div>
        ),
      }),
      columnHelper.accessor('unitType', {
        header: 'Unit Type',
        cell: (info) => (
          <span className="text-muted-foreground text-sm">{info.row.original.unitTypeDisplayName}</span>
        ),
      }),
      columnHelper.accessor('unitMultiplier', {
        header: 'Multiplier',
        cell: (info) => <span className="font-mono text-sm">{info.getValue()}x</span>,
      }),
      columnHelper.display({
        id: 'active',
        header: 'Active',
        cell: ({ row }) => (
          <Switch
            checked={row.original.isActive}
            onCheckedChange={() => toggleActive(row.original)}
            disabled={updateMutation.isPending}
          />
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleEdit(row.original)} title="Edit">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(row.original)}
              title="Delete"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      }),
    ],
    [toggleActive, updateMutation.isPending, handleEdit, handleDelete]
  );

  const table = useReactTable({
    data: pricingList,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Coin Pricing</h1>
            <p className="text-muted-foreground">Configure pricing for AI generation features</p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Pricing Configuration</CardTitle>
            <CardDescription>Define coin costs for each AI feature</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <span className="text-muted-foreground">Loading pricing configurations...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Coin Pricing</h1>
            <p className="text-muted-foreground">Configure pricing for AI generation features</p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Pricing Configuration</CardTitle>
            <CardDescription>Define coin costs for each AI feature</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <span className="text-destructive">
                Failed to load pricing configurations. Please try again.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coin Pricing</h1>
          <p className="text-muted-foreground">Configure pricing for AI generation features</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Pricing
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pricing Configuration</CardTitle>
              <CardDescription>Define coin costs for each AI feature</CardDescription>
            </div>
            <Select
              value={resourceTypeFilter}
              onValueChange={(value) => setResourceTypeFilter(value as ResourceType | 'all')}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {RESOURCE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            table={table}
            isLoading={isLoading}
            emptyState={<span className="text-muted-foreground">No pricing configurations found</span>}
          />
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <CoinPricingFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingPricing(null);
        }}
        pricing={editingPricing}
        onSubmit={handleFormSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingPricing} onOpenChange={(open) => !open && setDeletingPricing(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Pricing Configuration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the pricing configuration for{' '}
              <strong>{deletingPricing?.resourceTypeDisplayName}</strong>
              {deletingPricing?.modelName && (
                <>
                  {' '}
                  (model: <code>{deletingPricing.modelName}</code>)
                </>
              )}
              ? This action cannot be undone.
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
    </div>
  );
}

export default CoinPricingPage;
