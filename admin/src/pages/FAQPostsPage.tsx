import { useEffect, useMemo, useState } from 'react';
import { useFAQPosts, useCreateFAQPost, useUpdateFAQPost, useDeleteFAQPost } from '@/hooks';
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable, TablePagination } from '@/components/table';
import type { FAQPost } from '@/types/api';

const columnHelper = createColumnHelper<FAQPost>();

interface FAQFormData {
  title: string;
  content: string;
  category: string;
  isPublished: boolean;
  order: number;
}

const defaultFormData: FAQFormData = {
  title: '',
  content: '',
  category: '',
  isPublished: false,
  order: 0,
};

export function FAQPostsPage() {
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<FAQPost | null>(null);
  const [deletingPost, setDeletingPost] = useState<FAQPost | null>(null);
  const [formData, setFormData] = useState<FAQFormData>(defaultFormData);
  const pageSize = 10;

  const { data, isLoading } = useFAQPosts({ page, pageSize });

  const createMutation = useCreateFAQPost();
  const updateMutation = useUpdateFAQPost();
  const deleteMutation = useDeleteFAQPost();

  // Handle dialog close after successful mutation
  useEffect(() => {
    if (createMutation.isSuccess || updateMutation.isSuccess) {
      handleCloseDialog();
    }
  }, [createMutation.isSuccess, updateMutation.isSuccess]);

  // Handle delete dialog close and state reset
  useEffect(() => {
    if (deleteMutation.isSuccess) {
      setDeleteDialogOpen(false);
      setDeletingPost(null);
    }
  }, [deleteMutation.isSuccess]);

  const posts = data?.data || [];
  const pagination = data?.pagination;

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPost(null);
    setFormData(defaultFormData);
  };

  const handleEdit = (post: FAQPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      category: post.category || '',
      isPublished: post.isPublished || false,
      order: post.order || 0,
    });
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingPost(null);
    setFormData(defaultFormData);
    setDialogOpen(true);
  };

  const handleDelete = (post: FAQPost) => {
    setDeletingPost(post);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingPost?.id) {
      deleteMutation.mutate(deletingPost.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!formData.content.trim()) {
      toast.error('Content is required');
      return;
    }

    const postData: FAQPost = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      category: formData.category.trim() || undefined,
      isPublished: formData.isPublished,
      order: formData.order,
    };

    if (editingPost?.id) {
      updateMutation.mutate({ id: editingPost.id, data: postData });
    } else {
      createMutation.mutate(postData);
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('title', {
        header: 'Title',
        cell: (info) => (
          <div className="flex items-center gap-2">
            <FileText className="text-muted-foreground h-4 w-4" />
            <span className="font-medium">{info.getValue()}</span>
          </div>
        ),
      }),
      columnHelper.accessor('category', {
        header: 'Category',
        cell: (info) => {
          const category = info.getValue();
          return category ? (
            <span className="bg-muted rounded px-2 py-1 text-sm">{category}</span>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          );
        },
      }),
      columnHelper.accessor('isPublished', {
        header: 'Status',
        cell: (info) => {
          const isPublished = info.getValue();
          return (
            <span
              className={`rounded px-2 py-1 text-xs font-medium ${
                isPublished
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}
            >
              {isPublished ? 'Published' : 'Draft'}
            </span>
          );
        },
      }),
      columnHelper.accessor('order', {
        header: 'Order',
        cell: (info) => <span className="text-muted-foreground text-sm">{info.getValue() ?? 0}</span>,
      }),
      columnHelper.accessor('updatedAt', {
        header: 'Last Updated',
        cell: (info) => {
          const date = info.getValue();
          return date ? (
            <span className="text-muted-foreground text-sm">{new Date(date).toLocaleDateString()}</span>
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
            <Button variant="outline" size="sm" onClick={() => handleEdit(row.original)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => handleDelete(row.original)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: posts,
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
          <h1 className="text-3xl font-bold tracking-tight">FAQ Posts</h1>
          <p className="text-muted-foreground">Manage frequently asked questions and help content</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New FAQ Post
        </Button>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPost ? 'Edit FAQ Post' : 'Create New FAQ Post'}</DialogTitle>
            <DialogDescription>
              {editingPost
                ? 'Update the FAQ post details below.'
                : 'Fill in the details to create a new FAQ post.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter FAQ title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter FAQ content (supports markdown)"
                  rows={6}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Getting Started"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="order">Display Order</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="isPublished"
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                />
                <Label htmlFor="isPublished">Publish immediately</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : editingPost
                    ? 'Update'
                    : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete FAQ Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingPost?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>All FAQ Posts</CardTitle>
          <CardDescription>
            {pagination ? `${pagination.totalItems} total posts` : 'Loading...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            table={table}
            isLoading={isLoading}
            emptyState={<span className="text-muted-foreground">No FAQ posts found</span>}
          />
          {pagination && pagination.totalPages > 1 && (
            <TablePagination table={table} totalItems={pagination.totalItems} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
