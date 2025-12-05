import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { adminApi } from '@/api/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, TablePagination } from '@/components/table';
import { ThemeFormDialog, ThemePreviewCard } from '@/components/theme';
import { Plus, Edit } from 'lucide-react';
import { toast } from 'sonner';
import type { SlideTheme, Gradient } from '@/types/api';

const columnHelper = createColumnHelper<SlideTheme>();

function getBackgroundColor(bg: string | Gradient): string {
  if (typeof bg === 'string') return bg;
  // For gradient, return the first color
  return bg.colors[0]?.color || '#ffffff';
}

export function SlideThemesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<SlideTheme | null>(null);
  const pageSize = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['slideThemes', page, pageSize],
    queryFn: () => adminApi.getSlideThemes({ page, pageSize }),
  });

  const createMutation = useMutation({
    mutationFn: (data: SlideTheme) => adminApi.createSlideTheme(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slideThemes'] });
      toast.success('Theme created successfully');
      handleCloseDialog();
    },
    onError: () => {
      toast.error('Failed to create theme');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SlideTheme }) => adminApi.updateSlideTheme(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slideThemes'] });
      toast.success('Theme updated successfully');
      handleCloseDialog();
    },
    onError: () => {
      toast.error('Failed to update theme');
    },
  });

  const themes = data?.data || [];
  const pagination = data?.pagination;

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'preview',
        header: 'Preview',
        cell: (info) => (
          <div className="w-24">
            <ThemePreviewCard theme={info.row.original} title={info.row.original.name || 'Theme'} />
          </div>
        ),
      }),
      columnHelper.accessor('name', {
        header: 'Name',
        cell: (info) => <span className="font-medium">{info.getValue() || 'Untitled'}</span>,
      }),
      columnHelper.accessor('backgroundColor', {
        header: 'Background',
        cell: (info) => {
          const bg = info.getValue();
          const color = getBackgroundColor(bg);
          return (
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded border" style={{ backgroundColor: color }} />
              <span className="text-muted-foreground text-sm">{color}</span>
            </div>
          );
        },
      }),
      columnHelper.accessor('fontColor', {
        header: 'Font Color',
        cell: (info) => (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded border" style={{ backgroundColor: info.getValue() }} />
            <span className="text-muted-foreground text-sm">{info.getValue()}</span>
          </div>
        ),
      }),
      columnHelper.accessor('fontName', {
        header: 'Font',
        cell: (info) => info.getValue() || '-',
      }),
      columnHelper.accessor('themeColors', {
        header: 'Theme Colors',
        cell: (info) => {
          const colors = info.getValue() || [];
          return (
            <div className="flex gap-1">
              {colors.slice(0, 5).map((color, i) => (
                <div
                  key={i}
                  className="h-5 w-5 rounded-sm border"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
              {colors.length > 5 && (
                <span className="text-muted-foreground text-xs">+{colors.length - 5}</span>
              )}
            </div>
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
    data: themes,
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
    setEditingTheme(null);
  };

  const handleEdit = (theme: SlideTheme) => {
    setEditingTheme(theme);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingTheme(null);
    setDialogOpen(true);
  };

  const handleSubmit = (themeData: SlideTheme) => {
    if (editingTheme?.id) {
      updateMutation.mutate({ id: editingTheme.id, data: themeData });
    } else {
      createMutation.mutate(themeData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Slide Themes</h1>
          <p className="text-muted-foreground">Manage slide themes and color schemes</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Theme
        </Button>
      </div>

      <ThemeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        theme={editingTheme}
        onSubmit={handleSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      <Card>
        <CardHeader>
          <CardTitle>All Themes</CardTitle>
          <CardDescription>
            {pagination ? `${pagination.totalItems} total themes` : 'Loading...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            table={table}
            isLoading={isLoading}
            emptyState={<span className="text-muted-foreground">No themes found</span>}
          />
          {pagination && pagination.totalPages > 1 && (
            <TablePagination table={table} totalItems={pagination.totalItems} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
