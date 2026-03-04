import { useCallback, useMemo, useState } from 'react';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card';
import { Button } from '@ui/button';
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
import { DataTable } from '@/components/table';
import { CoinPackageFormDialog } from '@/components/coin-package/CoinPackageFormDialog';
import { Plus, Pencil, Trash2, Coins, Power } from 'lucide-react';
import {
  useCoinPackages,
  useCreateCoinPackage,
  useUpdateCoinPackage,
  useDeleteCoinPackage,
  useToggleCoinPackageStatus,
} from '@/hooks';
import type { CoinPackage, CoinPackageCreateRequest, CoinPackageUpdateRequest } from '@/types/coinPackage';

const columnHelper = createColumnHelper<CoinPackage>();

const formatVND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

export function CoinPackagesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<CoinPackage | null>(null);
  const [deletingPackage, setDeletingPackage] = useState<CoinPackage | null>(null);

  const { data, isLoading, isError } = useCoinPackages();
  const createMutation = useCreateCoinPackage();
  const updateMutation = useUpdateCoinPackage();
  const deleteMutation = useDeleteCoinPackage();
  const toggleMutation = useToggleCoinPackageStatus();

  const packageList: CoinPackage[] =
    (data as unknown as { data: CoinPackage[] })?.data ??
    (Array.isArray(data) ? (data as CoinPackage[]) : []);

  const handleCreate = useCallback(() => {
    setEditingPackage(null);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((pkg: CoinPackage) => {
    setEditingPackage(pkg);
    setIsFormOpen(true);
  }, []);

  const handleDelete = useCallback((pkg: CoinPackage) => {
    setDeletingPackage(pkg);
  }, []);

  const handleToggle = useCallback(
    (pkg: CoinPackage) => {
      toggleMutation.mutate(pkg.id);
    },
    [toggleMutation]
  );

  const handleFormSubmit = useCallback(
    async (data: CoinPackageCreateRequest | CoinPackageUpdateRequest) => {
      try {
        if (editingPackage) {
          await updateMutation.mutateAsync({ id: editingPackage.id, data: data as CoinPackageUpdateRequest });
        } else {
          await createMutation.mutateAsync(data as CoinPackageCreateRequest);
        }
        setIsFormOpen(false);
        setEditingPackage(null);
      } catch {
        // Error handled by mutation hook
      }
    },
    [editingPackage, createMutation, updateMutation]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (deletingPackage) {
      try {
        await deleteMutation.mutateAsync(deletingPackage.id);
        setDeletingPackage(null);
      } catch {
        // Error handled by mutation hook
      }
    }
  }, [deletingPackage, deleteMutation]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Name',
        cell: (info) => <span className="font-mono text-sm font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor('coin', {
        header: 'Coins',
        cell: (info) => (
          <div className="flex items-center gap-1">
            <Coins className="h-4 w-4 text-yellow-500" />
            <span className="font-medium">{info.getValue()}</span>
          </div>
        ),
      }),
      columnHelper.accessor('bonus', {
        header: 'Bonus',
        cell: (info) => {
          const bonus = info.getValue();
          return bonus > 0 ? (
            <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
              +{bonus}
            </span>
          ) : (
            <span className="text-muted-foreground text-sm">—</span>
          );
        },
      }),
      columnHelper.accessor('price', {
        header: 'Price',
        cell: (info) => <span className="font-medium">{formatVND(info.getValue())}</span>,
      }),
      columnHelper.accessor('active', {
        header: 'Status',
        cell: (info) =>
          info.getValue() ? (
            <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
              Active
            </span>
          ) : (
            <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
              Inactive
            </span>
          ),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleToggle(row.original)}
              title={row.original.active ? 'Deactivate' : 'Activate'}
              className={
                row.original.active ? 'text-green-600 hover:text-green-700' : 'text-muted-foreground'
              }
              disabled={toggleMutation.isPending}
            >
              <Power className="h-4 w-4" />
            </Button>
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
    [handleEdit, handleDelete, handleToggle, toggleMutation.isPending]
  );

  const table = useReactTable({
    data: packageList,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Coin Packages</h1>
            <p className="text-muted-foreground">Manage purchasable coin packages</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <span className="text-muted-foreground">Loading coin packages...</span>
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
            <h1 className="text-3xl font-bold tracking-tight">Coin Packages</h1>
            <p className="text-muted-foreground">Manage purchasable coin packages</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <span className="text-destructive">Failed to load coin packages. Please try again.</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coin Packages</h1>
          <p className="text-muted-foreground">Manage purchasable coin packages</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Package
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Packages</CardTitle>
          <CardDescription>All available coin packages users can purchase</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            table={table}
            isLoading={isLoading}
            emptyState={<span className="text-muted-foreground">No coin packages found</span>}
          />
        </CardContent>
      </Card>

      <CoinPackageFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingPackage(null);
        }}
        coinPackage={editingPackage}
        onSubmit={handleFormSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      <AlertDialog open={!!deletingPackage} onOpenChange={(open) => !open && setDeletingPackage(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Coin Package</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingPackage?.name}</strong>? This action cannot be
              undone.
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

export default CoinPackagesPage;
