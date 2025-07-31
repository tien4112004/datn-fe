import * as React from 'react';

import { cn } from '@/shared/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@ui/dropdown-menu';

import { ArrowDown, ArrowUp, ChevronsUpDown, X } from 'lucide-react';

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

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
