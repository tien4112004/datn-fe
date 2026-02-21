import { DataTable, TablePagination } from '@/components/table';
import { useContexts, useDeleteContext } from '@/hooks';
import type { ContextFilterParams } from '@/types/api';
import type { Context } from '@/types/context';
import { getAllSubjects, getSubjectName, getElementaryGrades } from '@aiprimary/core';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Button } from '@ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card';
import { Checkbox } from '@ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@ui/dialog';
import { Input } from '@ui/input';
import { Label } from '@ui/label';
import { Edit, Plus, Trash2, Search, Filter, ChevronDown, X } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const columnHelper = createColumnHelper<Context>();

export function ContextsPage() {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const pageSize = 10;
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Pick<ContextFilterParams, 'subject' | 'grade'>>({});
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
  }, []);

  const queryParams: ContextFilterParams = {
    page: page - 1,
    pageSize,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(filters.subject && filters.subject.length > 0 && { subject: filters.subject }),
    ...(filters.grade && filters.grade.length > 0 && { grade: filters.grade }),
  };

  const { data, isLoading } = useContexts(queryParams);
  const deleteMutation = useDeleteContext();

  const subjects = getAllSubjects();
  const grades = getElementaryGrades();

  const hasActiveFilters =
    (Array.isArray(filters.subject) && filters.subject.length > 0) ||
    (Array.isArray(filters.grade) && filters.grade.length > 0);

  const handleCheckboxChange = (filterKey: 'subject' | 'grade', value: string, checked: boolean) => {
    const currentValues = (filters[filterKey] as string[]) || [];
    const newValues = checked ? [...currentValues, value] : currentValues.filter((v) => v !== value);
    setFilters({ ...filters, [filterKey]: newValues.length ? newValues : undefined });
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(1);
  };

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
    [navigate]
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
        <CardContent className="space-y-4">
          {/* Search and Filter Toggle */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className="h-10 w-10 shrink-0"
              title={isFiltersOpen ? 'Hide filters' : 'Show filters'}
            >
              <div className="flex items-center gap-1">
                <Filter className="h-5 w-5" />
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${isFiltersOpen ? 'rotate-180' : ''}`}
                />
              </div>
            </Button>
            <div className="relative max-w-md flex-1">
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search contexts..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Collapsible Filters */}
          <div
            className={`grid gap-4 overflow-hidden transition-all duration-300 ease-in-out ${
              isFiltersOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
            }`}
          >
            <div className="min-h-0">
              <div className="grid grid-cols-2 gap-4">
                {/* Subject Filter */}
                <div className="space-y-2">
                  <Label className="text-foreground mb-3 block text-sm font-semibold">Subject</Label>
                  <div className="max-h-32 space-y-2 overflow-y-auto">
                    {subjects.map((subject) => (
                      <label
                        key={subject.code}
                        className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md p-1 transition-colors"
                      >
                        <Checkbox
                          checked={Array.isArray(filters.subject) && filters.subject.includes(subject.code)}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange('subject', subject.code, checked as boolean)
                          }
                        />
                        <span className="text-xs font-medium">{getSubjectName(subject.code)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Grade Filter */}
                <div className="space-y-2">
                  <Label className="text-foreground mb-3 block text-sm font-semibold">Grade</Label>
                  <div className="max-h-32 space-y-2 overflow-y-auto">
                    {grades.map((grade) => (
                      <label
                        key={grade.code}
                        className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md p-1 transition-colors"
                      >
                        <Checkbox
                          checked={Array.isArray(filters.grade) && filters.grade.includes(grade.code)}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange('grade', grade.code, checked as boolean)
                          }
                        />
                        <span className="text-xs font-medium">{grade.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="w-full gap-2 font-semibold"
            >
              <X className="h-4 w-4" />
              Clear All Filters
            </Button>
          )}
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
