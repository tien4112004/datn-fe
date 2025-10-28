import { cn } from '@/shared/lib/utils';
import type { Table } from '@tanstack/react-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select';
import { useTranslation } from 'react-i18next';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
  PaginationStart,
  PaginationEnd,
} from '@ui/pagination';

interface TablePaginationProps {
  table: Table<any>;
  pageSizeOptions?: number[];
}

const PAGE_SIZE_OPTIONS = [5, 10, 20, 30, 40, 50];

function TablePagination({
  table,
  className,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  ...props
}: TablePaginationProps & React.ComponentProps<'div'>) {
  const { t } = useTranslation('common', { keyPrefix: 'table.pagination' });
  const { pageIndex, pageSize } = table.getState().pagination;
  const currentPage = pageIndex + 1;
  const totalPages = table.getPageCount();
  const totalItems = table.getRowCount();

  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5;
    const sidePages = 2; // Pages to show on each side of current page

    if (totalPages <= showPages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate start and end for middle pages
      const start = Math.max(2, currentPage - sidePages);
      const end = Math.min(totalPages - 1, currentPage + sidePages);

      // Add ellipsis before middle pages if needed
      if (start > 2) {
        pages.push('ellipsis-start');
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis after middle pages if needed
      if (end < totalPages - 1) {
        pages.push('ellipsis-end');
      }

      // Always show last page if more than 1 page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
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
              {pageSizeOptions.map((size) => (
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

      <Pagination className="mx-0 flex w-auto items-center space-x-2">
        <PaginationContent>
          {/* First Page Button */}
          <PaginationItem>
            <PaginationStart
              onClick={() => table.firstPage()}
              className={cn(
                'h-8 cursor-pointer',
                !table.getCanPreviousPage() && 'pointer-events-none opacity-50'
              )}
              aria-label={t('goToFirstPage')}
              label={t('firstPage')}
            />
          </PaginationItem>

          {/* Previous button */}
          <PaginationItem>
            <PaginationPrevious
              onClick={() => table.previousPage()}
              className={cn(
                'h-8 cursor-pointer',
                !table.getCanPreviousPage() && 'pointer-events-none opacity-50'
              )}
              aria-label={t('goToPreviousPage')}
              label={t('previous')}
            />
          </PaginationItem>

          {/* Page numbers */}
          {getPageNumbers().map((page) => {
            if (typeof page === 'string') {
              return (
                <PaginationItem key={page}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }

            return (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => table.setPageIndex(page - 1)}
                  isActive={currentPage === page}
                  aria-label={`${t('goToPage')} ${page}`}
                  aria-current={currentPage === page ? 'page' : undefined}
                  className="h-8 w-8 cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          {/* Next button */}
          <PaginationItem>
            <PaginationNext
              onClick={() => table.nextPage()}
              className={cn(
                'h-8 cursor-pointer',
                !table.getCanNextPage() && 'pointer-events-none opacity-50'
              )}
              aria-label={t('goToNextPage')}
              label={t('next')}
            />
          </PaginationItem>

          {/* End button */}
          <PaginationItem>
            <PaginationEnd
              onClick={() => table.lastPage()}
              className={cn(
                'h-8 cursor-pointer',
                !table.getCanNextPage() && 'pointer-events-none opacity-50'
              )}
              aria-label={t('goToLastPage')}
              label={t('lastPage')}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

export default TablePagination;
