import { DataTable, TablePagination } from '@/components/table';
import { ThemePreviewCard } from '@/components/theme';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSlideThemes } from '@/hooks';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Edit, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { Gradient, SlideTheme } from '@aiprimary/core';

const columnHelper = createColumnHelper<SlideTheme>();

function getBackgroundColor(bg: string | Gradient): string {
  if (typeof bg === 'string') return bg;
  // For gradient, return the first color
  return bg.colors[0]?.color || '#ffffff';
}

export function SlideThemesPage() {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const pageSize = 10;

  const { data, isLoading } = useSlideThemes({ page, pageSize });

  const themes = data?.data || [];
  const pagination = data?.pagination;

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'preview',
        header: 'Preview',
        cell: (info) => (
          <div className="w-60">
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

  const handleEdit = (theme: SlideTheme) => {
    navigate(`/slide-themes/${theme.id}`);
  };

  const handleCreate = () => {
    navigate('/slide-themes/new');
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
