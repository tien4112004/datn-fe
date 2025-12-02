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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, FileText, ExternalLink, BookOpen, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable, TablePagination } from '@/components/table';
import { BookFormDialog } from '@/components/book';
import type { Book, BookType } from '@/types/api';

const columnHelper = createColumnHelper<Book>();

export function BooksPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<BookType | 'ALL'>('ALL');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const pageSize = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['books', page, pageSize, typeFilter],
    queryFn: () =>
      adminApi.getBooks({
        page,
        pageSize,
        ...(typeFilter !== 'ALL' && { type: typeFilter }),
      }),
  });

  const createMutation = useMutation({
    mutationFn: (formData: FormData) => adminApi.createBook(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success('Book created successfully');
      handleCloseDialog();
    },
    onError: () => {
      toast.error('Failed to create book');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => adminApi.updateBook(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success('Book updated successfully');
      handleCloseDialog();
    },
    onError: () => {
      toast.error('Failed to update book');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success('Book deleted successfully');
      setDeletingId(null);
    },
    onError: () => {
      toast.error('Failed to delete book');
      setDeletingId(null);
    },
  });

  const books = data?.data || [];
  const pagination = data?.pagination;

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingBook(null);
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingBook(null);
    setDialogOpen(true);
  };

  const handleSubmit = (formData: FormData) => {
    if (editingBook?.id) {
      updateMutation.mutate({ id: editingBook.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this book?')) {
      setDeletingId(id);
      deleteMutation.mutate(id);
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('title', {
        header: 'Title',
        cell: (info) => (
          <div className="flex items-center gap-2">
            {info.row.original.thumbnailUrl ? (
              <img
                src={info.row.original.thumbnailUrl}
                alt={info.getValue()}
                className="h-10 w-8 rounded object-cover"
              />
            ) : (
              <div className="bg-muted flex h-10 w-8 items-center justify-center rounded">
                <FileText className="text-muted-foreground h-4 w-4" />
              </div>
            )}
            <span className="font-medium">{info.getValue()}</span>
          </div>
        ),
      }),
      columnHelper.accessor('type', {
        header: 'Type',
        cell: (info) => {
          const type = info.getValue();
          return (
            <div className="flex items-center gap-1">
              {type === 'TEXTBOOK' ? (
                <BookOpen className="h-4 w-4 text-blue-500" />
              ) : (
                <GraduationCap className="h-4 w-4 text-green-500" />
              )}
              <span className="text-sm">{type === 'TEXTBOOK' ? 'Textbook' : 'Teacher Book'}</span>
            </div>
          );
        },
      }),
      columnHelper.accessor('grade', {
        header: 'Grade',
        cell: (info) => {
          const grade = info.getValue();
          return grade ? (
            <span className="bg-muted rounded px-2 py-1 text-sm">Grade {grade}</span>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          );
        },
      }),
      columnHelper.accessor('subject', {
        header: 'Subject',
        cell: (info) => info.getValue() || <span className="text-muted-foreground text-sm">-</span>,
      }),
      columnHelper.accessor('isPublished', {
        header: 'Status',
        cell: (info) => (
          <span
            className={`rounded px-2 py-1 text-xs font-medium ${
              info.getValue()
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
            }`}
          >
            {info.getValue() ? 'Published' : 'Draft'}
          </span>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        meta: { align: 'right' as const },
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            {row.original.pdfUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(row.original.pdfUrl, '_blank')}
                title="View PDF"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => handleEdit(row.original)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => row.original.id && handleDelete(row.original.id)}
              disabled={deletingId === row.original.id}
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      }),
    ],
    [deletingId]
  );

  const table = useReactTable({
    data: books,
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
          <h1 className="text-3xl font-bold tracking-tight">Books</h1>
          <p className="text-muted-foreground">Manage textbooks and teacher books (PDF files)</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Book
        </Button>
      </div>

      <BookFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        book={editingBook}
        onSubmit={handleSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Books</CardTitle>
              <CardDescription>
                {pagination ? `${pagination.totalItems} total books` : 'Loading...'}
              </CardDescription>
            </div>
            <Select
              value={typeFilter}
              onValueChange={(value: BookType | 'ALL') => {
                setTypeFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="TEXTBOOK">Textbooks</SelectItem>
                <SelectItem value="TEACHERBOOK">Teacher Books</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            table={table}
            isLoading={isLoading}
            emptyState={<span className="text-muted-foreground">No books found</span>}
          />
          {pagination && pagination.totalPages > 1 && (
            <TablePagination table={table} totalItems={pagination.totalItems} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
