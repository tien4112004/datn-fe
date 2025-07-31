import * as React from 'react';

import { cn } from '@/shared/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from './button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

interface TablePaginationProps {
  table: {
    getCanPreviousPage: () => boolean;
    getCanNextPage: () => boolean;
    firstPage: () => void;
    nextPage: () => void;
    previousPage: () => void;
    lastPage: () => void;
    getPageCount: () => number;
    setPageIndex: (index: number) => void;
    setPageSize: (size: number) => void;
    getRowCount: () => number;
    getState: () => { pagination: { pageIndex: number; pageSize: number } };
  };
}

const alignVariants = cva('', {
  variants: {
    align: {
      left: 'text-left flex items-center justify-start',
      center: 'text-center flex items-center justify-center',
      right: 'text-right flex items-center justify-end',
      none: '',
    },
  },
  defaultVariants: {
    align: 'none',
  },
});

const sortableVariants = cva('', {
  variants: {
    sortable: {
      true: 'cursor-pointer hover:bg-muted/50 transition-colors',
      false: '',
    },
    sortState: {
      none: '',
      asc: 'bg-muted/30',
      desc: 'bg-muted/30',
    },
  },
  defaultVariants: {
    sortable: false,
    sortState: 'none',
  },
});

function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table data-slot="table" className={cn('w-full caption-bottom text-sm', className)} {...props} />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return <thead data-slot="table-header" className={cn('[&_tr]:border-b', className)} {...props} />;
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return <tbody data-slot="table-body" className={cn('[&_tr:last-child]:border-0', className)} {...props} />;
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn('bg-muted/50 border-t font-medium [&>tr]:last:border-b-0', className)}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn('hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors', className)}
      {...props}
    />
  );
}

interface SortableTableHeadProps {
  sortable?: boolean;
  sortKey?: string;
  onSort?: (key: string) => void;
  isSorting?: 'asc' | 'desc' | false;
}

function TableHead({
  className,
  align,
  sortable,
  sortKey,
  onSort,
  children,
  isSorting = false,
  ...props
}: React.ComponentProps<'th'> &
  VariantProps<typeof alignVariants> &
  VariantProps<typeof sortableVariants> &
  SortableTableHeadProps) {
  if (!sortable || !sortKey || !onSort) {
    return (
      <th
        data-slot="table-head"
        className={cn(
          'text-foreground h-10 whitespace-nowrap px-2 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
          className,
          alignVariants({ align })
        )}
        {...props}
      >
        {children}
      </th>
    );
  }

  const getSortIcon = () => {
    if (isSorting === 'asc') return <ArrowUp className="h-4 w-4" />;
    if (isSorting === 'desc') return <ArrowDown className="h-4 w-4" />;
    if (isSorting === false) return <ChevronsUpDown className="h-4 w-4" />;
    return <X className="h-4 w-4" />; // Fallback icon if no sorting state is provided
  };

  return (
    <th
      data-slot="table-head"
      className={cn(
        'text-foreground h-10 whitespace-nowrap px-2 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className,
        alignVariants({ align }),
        sortableVariants({ sortable, sortState: isSorting ? isSorting : 'none' })
      )}
      {...props}
    >
      <button className="flex w-full items-center gap-1" onClick={() => onSort(sortKey)}>
        {children}
        {getSortIcon()}
      </button>
    </th>
  );
}

function TableCell({
  className,
  align,
  ...props
}: React.ComponentProps<'td'> & VariantProps<typeof alignVariants> = {}) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        'whitespace-nowrap p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className,
        alignVariants({ align })
      )}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('text-muted-foreground mt-4 text-sm', className)}
      {...props}
    />
  );
}

function TablePagination({ table, className, ...props }: TablePaginationProps & React.ComponentProps<'div'>) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const currentPage = pageIndex + 1;
  const totalPages = table.getPageCount();
  const totalItems = table.getRowCount();

  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5;

    let start = Math.max(1, currentPage - Math.floor(showPages / 2));
    let end = Math.min(totalPages, start + showPages - 1);

    if (end === totalPages) {
      start = Math.max(1, end - showPages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const startItem = Math.min(Math.max(0, pageIndex * pageSize + 1), totalItems);
  const endItem = Math.min((pageIndex + 1) * pageSize, totalItems);

  return (
    <div
      data-slot="table-pagination"
      className={cn('flex items-center justify-between px-4 py-4', className)}
      {...props}
    >
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <span className="text-muted-foreground text-sm">Rows per page</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span className="text-muted-foreground pl-2 text-sm">
          Showing {startItem} to {endItem} of {totalItems} entries
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => table.firstPage()}
          disabled={!table.getCanPreviousPage()}
          aria-label="Go to first page"
          className="h-8 w-8"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          aria-label="Go to previous page"
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {getPageNumbers().map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? 'default' : 'outline'}
            onClick={() => table.setPageIndex(page - 1)}
            aria-label={`Go to page ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
            className="h-8 w-8"
          >
            {page}
          </Button>
        ))}

        <Button
          variant="outline"
          size="icon"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          aria-label="Go to next page"
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => table.lastPage()}
          disabled={!table.getCanNextPage()}
          aria-label="Go to last page"
          className="h-8 w-8"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TablePagination,
};
