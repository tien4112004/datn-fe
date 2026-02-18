import { useArtStyles, useCreateArtStyle, useUpdateArtStyle } from '@/hooks';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';

import { ArtStyleFormDialog } from '@/components/art-style/ArtStyleFormDialog';
import { DataTable, TablePagination } from '@/components/table';
import { Button } from '@ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card';
import type { ArtStyleRequest } from '@/types/api';
import type { ArtStyle } from '@aiprimary/core';
import { Edit, Image, Plus } from 'lucide-react';

const columnHelper = createColumnHelper<ArtStyle>();

export function ArtStylesPage() {
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStyle, setEditingStyle] = useState<ArtStyle | null>(null);
  const pageSize = 10;

  const { data, isLoading } = useArtStyles({ page, pageSize });

  const createMutation = useCreateArtStyle();
  const updateMutation = useUpdateArtStyle();

  // Handle dialog close after successful mutation
  useEffect(() => {
    if (createMutation.isSuccess || updateMutation.isSuccess) {
      handleCloseDialog();
    }
  }, [createMutation.isSuccess, updateMutation.isSuccess]);

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

  const handleSubmit = (styleData: ArtStyleRequest) => {
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
