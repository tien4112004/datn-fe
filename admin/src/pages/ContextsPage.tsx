import { DataTable, TablePagination } from '@/components/table';
import { Button } from '@ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@ui/dialog';
import { useContexts, useDeleteContext } from '@/hooks';
import type { Context } from '@/types/context';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const columnHelper = createColumnHelper<Context>();

export function ContextsPage() {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const pageSize = 10;
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useContexts({ page: page - 1, pageSize }); // Backend 0-indexed
  const deleteMutation = useDeleteContext();

  const contexts = data?.data || [];
  const pagination = data?.pagination;

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('title', {
        header: 'Title',
        cell: (info) => (
          <div className="max-w-[200px] truncate font-medium" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('content', {
        header: 'Content',
        cell: (info) => (
          <div className="max-w-[400px] truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('grade', {
        header: 'Grade',
        cell: (info) => info.getValue() || '-',
      }),
      columnHelper.accessor('subject', {
        header: 'Subject',
        cell: (info) => info.getValue() || '-',
      }),
      columnHelper.accessor('author', {
        header: 'Author',
        cell: (info) => info.getValue() || '-',
      }),
      columnHelper.accessor('createdAt', {
        header: 'Created At',
        cell: (info) => {
          const date = info.getValue();
          return date ? new Date(date).toLocaleDateString() : '-';
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: (info) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/contexts/${info.row.original.id}`);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteId(info.row.original.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      }),
    ],
    [navigate, deleteId]
  );

  const table = useReactTable({
    data: contexts,
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

  const handleCreate = () => {
    navigate('/contexts/new');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contexts</h1>
          <p className="text-muted-foreground">Manage reading contexts (Ngữ liệu / Bài đọc)</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Context
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Contexts</CardTitle>
          <CardDescription>
            {pagination ? `${pagination.totalItems} total items` : 'Loading...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            table={table}
            isLoading={isLoading}
            emptyState={<span className="text-muted-foreground">No contexts found</span>}
          />
          {pagination && pagination.totalPages > 1 && (
            <TablePagination table={table} totalItems={pagination.totalItems} />
          )}
        </CardContent>
      </Card>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the context.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ContextsPage;
