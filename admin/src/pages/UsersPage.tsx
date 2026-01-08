import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useUsers } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DataTable, TablePagination } from '@/components/table';
import { Search } from 'lucide-react';
import { format } from 'date-fns';
import type { User } from '@/types/auth';

const columnHelper = createColumnHelper<User>();

export function UsersPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const pageSize = 10;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page when search changes
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading, error } = useUsers({
    page,
    pageSize,
    search: debouncedSearch || undefined,
  });

  const users: User[] = (data?.data as User[]) || [];
  const pagination = data?.pagination;

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => `${row.firstName} ${row.lastName}`, {
        id: 'name',
        header: 'Name',
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('phoneNumber', {
        header: 'Phone',
        cell: (info) => info.getValue() || '-',
      }),
      columnHelper.accessor('createdAt', {
        header: 'Created',
        cell: (info) => {
          const value = info.getValue();
          return value ? format(new Date(value), 'MMM d, yyyy') : '-';
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
                navigate(`/users/${info.row.original.id}`);
              }}
            >
              View
            </Button>
          </div>
        ),
      }),
    ],
    [navigate]
  );

  const table = useReactTable({
    data: users,
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">Manage user accounts</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                {pagination ? `${pagination.totalItems} total users` : 'Loading...'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  className="w-64 pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-destructive">Failed to load users</p>
            </div>
          ) : (
            <>
              <DataTable
                table={table}
                isLoading={isLoading}
                emptyState={<span className="text-muted-foreground">No users found</span>}
                onRowClick={(user) => navigate(`/users/${user.id}`)}
              />
              {pagination && pagination.totalPages > 1 && (
                <TablePagination table={table} totalItems={pagination.totalItems} />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
