import { useSlideTemplates, useUpdateSlideTemplate } from '@/hooks';
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
import { Edit, FileJson, Plus, RefreshCw } from 'lucide-react';
import * as frontendDataTemplates from '@aiprimary/frontend-data';
import { toast } from 'sonner';

const columnHelper = createColumnHelper<SlideTemplate>();

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100] as const;

export function SlideTemplatesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isSyncing, setIsSyncing] = useState(false);

  const { data, isLoading, refetch } = useSlideTemplates({ page, pageSize });
  const updateTemplate = useUpdateSlideTemplate();

  const templates = data?.data || [];
  const pagination = data?.pagination;

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
    setIsSyncing(true);

    try {
      const frontendTemplates = getAllFrontendTemplates();

      if (frontendTemplates.length === 0) {
        toast.error('No templates found in frontend-data');
        return;
      }

      toast.info(`Starting sync of ${frontendTemplates.length} templates...`);

      let synced = 0;
      let failed = 0;

      for (const template of frontendTemplates) {
        try {
          // Use template.id as the ID for PUT request
          if (template.id) {
            await updateTemplate.mutateAsync({
              id: template.id,
              data: template,
            });
            synced++;
          } else {
            console.warn('Template without ID:', template.name);
            failed++;
          }
        } catch (error) {
          console.error(`Failed to sync template ${template.name}:`, error);
          failed++;
        }
      }

      if (failed === 0) {
        toast.success(`Successfully synced ${synced} templates!`);
      } else {
        toast.warning(`Synced ${synced} templates, ${failed} failed`);
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => (window.location.href = `/slide-templates/${row.original.id}`)}
          >
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
