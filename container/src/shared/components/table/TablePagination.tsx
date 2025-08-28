import { cn } from '@/shared/lib/utils';
import type { Table } from '@tanstack/react-table';
import { Button } from '@ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TablePaginationProps {
  table: Table<any>;
}

const PAGE_SIZE_OPTIONS = [5, 10, 20, 30, 40, 50];

function TablePagination({ table, className, ...props }: TablePaginationProps & React.ComponentProps<'div'>) {
  const { t } = useTranslation('table');
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
          <span className="text-muted-foreground text-sm">{t('rowsPerPage')}</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
              table.setPageIndex(0);
            }}
          >
            <SelectTrigger className="h-8 w-20">
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

        <span className="text-muted-foreground pl-2 text-sm">
          {t('showing')} {startItem} {t('to')} {endItem} {t('of')} {totalItems} {t('entries')}
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => table.firstPage()}
          disabled={!table.getCanPreviousPage()}
          aria-label={t('goToFirstPage')}
          className="h-8 w-8"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          aria-label={t('goToPreviousPage')}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {getPageNumbers().map((page) => (
          <Button
            key={page}
            variant={'outline'}
            onClick={() => table.setPageIndex(page - 1)}
            aria-label={`${t('goToPage')} ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
            className={cn(
              'h-8 w-8',
              currentPage === page
                ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
                : ''
            )}
          >
            {page}
          </Button>
        ))}

        <Button
          variant="outline"
          size="icon"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          aria-label={t('goToNextPage')}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => table.lastPage()}
          disabled={!table.getCanNextPage()}
          aria-label={t('goToLastPage')}
          className="h-8 w-8"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default TablePagination;
