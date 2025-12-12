import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { adminApi } from '@/api/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, FileJson } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable, TablePagination } from '@/components/table';
import { TemplateFormDialog } from '@/components/template';
import type { SlideTemplate } from '@/types/api';

const columnHelper = createColumnHelper<SlideTemplate>();

export function SlideTemplatesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SlideTemplate | null>(null);
  const pageSize = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['slideTemplates', page, pageSize],
    queryFn: () => adminApi.getSlideTemplates({ page, pageSize }),
  });

  const createMutation = useMutation({
    mutationFn: (data: SlideTemplate) => adminApi.createSlideTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slideTemplates'] });
      toast.success('Template created successfully');
      handleCloseDialog();
    },
    onError: () => {
      toast.error('Failed to create template');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SlideTemplate }) => adminApi.updateSlideTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slideTemplates'] });
      toast.success('Template updated successfully');
      handleCloseDialog();
    },
    onError: () => {
      toast.error('Failed to update template');
    },
  });

  const templates = data?.data || [];
  const pagination = data?.pagination;

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTemplate(null);
  };

  const handleEdit = (template: SlideTemplate) => {
    setEditingTemplate(template);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setDialogOpen(true);
  };

  const handleSubmit = (templateData: SlideTemplate) => {
    if (editingTemplate?.id) {
      updateMutation.mutate({ id: editingTemplate.id, data: templateData });
    } else {
      createMutation.mutate(templateData);
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Name',
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor('config', {
        header: 'Config',
        cell: (info) => {
          const config = info.getValue();
          const containerCount = config?.containers ? Object.keys(config.containers as object).length : 0;
          return (
            <div className="text-muted-foreground flex items-center gap-1">
              <FileJson className="h-4 w-4" />
              <span className="text-sm">{containerCount} containers</span>
            </div>
          );
        },
      }),
      columnHelper.accessor('parameters', {
        header: 'Parameters',
        cell: (info) => {
          const params = info.getValue() || [];
          return params.length > 0 ? (
            <span className="text-sm">{params.length} params</span>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        meta: { align: 'right' as const },
        cell: ({ row }) => (
          <Button variant="outline" size="sm" onClick={() => handleEdit(row.original)}>
            <Edit className="h-4 w-4" />
          </Button>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: templates,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Slide Templates</h1>
          <p className="text-muted-foreground">Manage slide layouts and templates with JSON configuration</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>

      <TemplateFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        template={editingTemplate}
        onSubmit={handleSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      <Card>
        <CardHeader>
          <CardTitle>All Templates</CardTitle>
          <CardDescription>
            {pagination ? `${pagination.totalItems} total templates` : 'Loading...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            table={table}
            isLoading={isLoading}
            emptyState={<span className="text-muted-foreground">No templates found</span>}
          />
          {pagination && pagination.totalPages > 1 && (
            <TablePagination table={table} totalItems={pagination.totalItems} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
