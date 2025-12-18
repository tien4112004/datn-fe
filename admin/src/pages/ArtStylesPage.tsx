import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { adminApi } from '@/api/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, TablePagination } from '@/components/table';
import { ArtStyleFormDialog } from '@/components/art-style/ArtStyleFormDialog';
import { Plus, Edit, Image } from 'lucide-react';
import { toast } from 'sonner';
import type { ArtStyle } from '@/types/api';

const columnHelper = createColumnHelper<ArtStyle>();

export function ArtStylesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStyle, setEditingStyle] = useState<ArtStyle | null>(null);
  const pageSize = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['artStyles', page, pageSize],
    queryFn: () => adminApi.getArtStyles({ page, pageSize }),
  });

  const createMutation = useMutation({
    mutationFn: (data: ArtStyle) => adminApi.createArtStyle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artStyles'] });
      toast.success('Art style created successfully');
      handleCloseDialog();
    },
    onError: () => {
      toast.error('Failed to create art style');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ArtStyle }) => adminApi.updateArtStyle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artStyles'] });
      toast.success('Art style updated successfully');
      handleCloseDialog();
    },
    onError: () => {
      toast.error('Failed to update art style');
    },
  });

  const styles = data?.data || [];
  const pagination = data?.pagination;

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'preview',
        header: 'Preview',
        cell: (info) => {
          const visual = info.row.original.visual;
          return (
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border bg-gray-100">
              {visual ? (
                <img src={visual} alt={info.row.original.name} className="h-full w-full object-cover" />
              ) : (
                <Image className="h-6 w-6 text-gray-400" />
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor('name', {
        header: 'Name',
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),

      columnHelper.accessor('labelKey', {
        header: 'Label Key',
        cell: (info) => <code className="bg-muted rounded px-2 py-1 text-sm">{info.getValue()}</code>,
      }),
      columnHelper.accessor('isEnabled', {
        header: 'Status',
        cell: (info) => {
          const isEnabled = info.getValue();
          return (
            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                isEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}
            >
              {isEnabled ? 'Enabled' : 'Disabled'}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: (info) => (
          <div className="text-right">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(info.row.original);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: styles,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: pagination?.totalPages ?? -1,
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize,
      },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater({ pageIndex: page - 1, pageSize });
        setPage(newState.pageIndex + 1);
      }
    },
  });

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingStyle(null);
  };

  const handleEdit = (style: ArtStyle) => {
    setEditingStyle(style);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingStyle(null);
    setDialogOpen(true);
  };

  const handleSubmit = (styleData: ArtStyle) => {
    if (editingStyle?.id) {
      updateMutation.mutate({ id: editingStyle.id, data: styleData });
    } else {
      createMutation.mutate(styleData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Art Styles</h1>
          <p className="text-muted-foreground">Manage art styles for image generation</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Art Style
        </Button>
      </div>

      <ArtStyleFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        artStyle={editingStyle}
        onSubmit={handleSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      <Card>
        <CardHeader>
          <CardTitle>All Art Styles</CardTitle>
          <CardDescription>
            {pagination ? `${pagination.totalItems} total art styles` : 'Loading...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            table={table}
            isLoading={isLoading}
            emptyState={<span className="text-muted-foreground">No art styles found</span>}
          />
          {pagination && pagination.totalPages > 1 && (
            <TablePagination table={table} totalItems={pagination.totalItems} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
