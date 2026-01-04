import {
  useSlideTemplates,
  useUpdateSlideTemplate,
  useCreateSlideTemplate,
  useDeleteSlideTemplate,
} from '@/hooks';
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DataTable, TablePagination } from '@/components/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { SlideTemplate } from '@aiprimary/core';
import { Edit, FileJson, Plus, RefreshCw, Trash2 } from 'lucide-react';
import * as frontendDataTemplates from '@aiprimary/frontend-data';
import { toast } from 'sonner';
import { getAvailableLayouts } from '@/utils/defaultTemplates';

const columnHelper = createColumnHelper<SlideTemplate>();

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100] as const;

export function SlideTemplatesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [layoutFilter, setLayoutFilter] = useState<string | 'ALL'>('ALL');
  const [isSyncing, setIsSyncing] = useState(false);

  const { data, isLoading, refetch } = useSlideTemplates({
    page,
    pageSize,
    ...(layoutFilter !== 'ALL' && { layout: layoutFilter }),
  });
  const updateTemplate = useUpdateSlideTemplate();
  const createTemplate = useCreateSlideTemplate();
  const deleteTemplate = useDeleteSlideTemplate();

  const templates = data?.data || [];
  const pagination = data?.pagination;

  const handleDelete = async (template: SlideTemplate) => {
    if (!template.id) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete template "${template.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteTemplate.mutateAsync(template.id);
      refetch();
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  // Collect all templates from frontend-data
  const getAllFrontendTemplates = (): SlideTemplate[] => {
    const allTemplates: SlideTemplate[] = [];

    // Extract template arrays from frontend-data exports
    if (frontendDataTemplates.listTemplates) allTemplates.push(...frontendDataTemplates.listTemplates);
    if (frontendDataTemplates.labeledListTemplates)
      allTemplates.push(...frontendDataTemplates.labeledListTemplates);
    if (frontendDataTemplates.titleTemplates) allTemplates.push(...frontendDataTemplates.titleTemplates);
    if (frontendDataTemplates.twoColumnTemplates)
      allTemplates.push(...frontendDataTemplates.twoColumnTemplates);
    if (frontendDataTemplates.twoColumnWithImageTemplates)
      allTemplates.push(...frontendDataTemplates.twoColumnWithImageTemplates);
    if (frontendDataTemplates.mainImageTemplates)
      allTemplates.push(...frontendDataTemplates.mainImageTemplates);
    if (frontendDataTemplates.tableOfContentsTemplates)
      allTemplates.push(...frontendDataTemplates.tableOfContentsTemplates);
    if (frontendDataTemplates.timelineTemplates)
      allTemplates.push(...frontendDataTemplates.timelineTemplates);
    if (frontendDataTemplates.pyramidTemplates) allTemplates.push(...frontendDataTemplates.pyramidTemplates);

    return allTemplates;
  };

  const handleSync = async () => {
    const frontendTemplates = getAllFrontendTemplates();

    if (frontendTemplates.length === 0) {
      toast.error('No templates found in frontend-data');
      return;
    }

    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to sync ${frontendTemplates.length} templates from frontend-data?\n\n` +
        `This will update all existing templates with matching IDs. This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setIsSyncing(true);

    try {
      toast.info(`Starting sync of ${frontendTemplates.length} templates...`);

      let synced = 0;
      let created = 0;
      let failed = 0;

      for (const template of frontendTemplates) {
        try {
          if (!template.id) {
            console.warn('Template without ID:', template.name);
            failed++;
            continue;
          }

          // Try to update first, create if it doesn't exist (upsert)
          try {
            await updateTemplate.mutateAsync({
              id: template.id,
              data: template,
            });
            synced++;
          } catch (updateError) {
            // If update fails (likely 404), try to create
            try {
              await createTemplate.mutateAsync(template);
              created++;
            } catch (createError) {
              console.error(`Failed to create template ${template.name}:`, createError);
              failed++;
            }
          }
        } catch (error) {
          console.error(`Failed to sync template ${template.name}:`, error);
          failed++;
        }
      }

      if (failed === 0) {
        const message =
          created > 0
            ? `Successfully synced ${synced} templates and created ${created} new templates!`
            : `Successfully synced ${synced} templates!`;
        toast.success(message);
      } else {
        toast.warning(`Synced ${synced} templates, created ${created}, ${failed} failed`);
      }

      // Refresh the list
      refetch();
    } catch (error) {
      toast.error('Sync failed', {
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Name',
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor('layout', {
        header: 'Layout',
        cell: (info) => <span className="bg-muted rounded px-2 py-1 text-sm">{info.getValue()}</span>,
      }),
      columnHelper.accessor('containers', {
        header: 'Config',
        cell: (info) => {
          const containers = info.getValue();
          const containerCount = containers ? Object.keys(containers as object).length : 0;
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
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => (window.location.href = `/slide-templates/${row.original.id}`)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(row.original)}
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      }),
    ],
    [handleDelete]
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
        <div className="flex gap-2">
          <Button onClick={handleSync} disabled={isSyncing} variant="outline">
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync from frontend-data'}
          </Button>
          <Button onClick={() => navigate('/slide-templates/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Templates</CardTitle>
              <CardDescription>
                {pagination ? `${pagination.totalItems} total templates` : 'Loading...'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">Layout:</span>
                <Select
                  value={layoutFilter}
                  onValueChange={(value: string) => {
                    setLayoutFilter(value);
                    setPage(1); // Reset to first page when filter changes
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by layout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Layouts</SelectItem>
                    {getAvailableLayouts().map((layout) => (
                      <SelectItem key={layout} value={layout}>
                        {layout.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">Items per page:</span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => {
                    setPageSize(Number(value));
                    setPage(1); // Reset to first page when changing page size
                  }}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
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
