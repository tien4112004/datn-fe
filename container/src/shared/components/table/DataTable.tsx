import { flexRender, type Row, type Table as TableType } from '@tanstack/react-table';
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from '@ui/table';
import TablePagination from './TablePagination';
import SkeletonTable from './SkeletonTable';
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from '@/components/ui/context-menu';
import { useLayoutEffect, useRef } from 'react';
import calculateTableSizing from './tableSizing';
import { useWindowSize } from 'usehooks-ts';
import './style.css';

interface DataTableProps<TData> {
  table: TableType<TData>;
  isLoading: boolean;
  emptyState: React.ReactNode;
  onClickRow?: (row: Row<TData>) => void;
  contextMenu?: (row: Row<TData>) => React.ReactNode;
}

function DataTable<TData>({ table, isLoading, emptyState, onClickRow, contextMenu }: DataTableProps<TData>) {
  // Resize logic. Source: https://github.com/TanStack/table/discussions/3192#discussioncomment-11896090
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const windowDimensions = useWindowSize();
  const headers = table.getFlatHeaders();
  useLayoutEffect(() => {
    if (tableContainerRef.current) {
      const initialColumnSizing = calculateTableSizing(headers, tableContainerRef.current?.clientWidth);
      table.setColumnSizing(initialColumnSizing);
    }
  }, [headers, windowDimensions.width, table]);

  if (isLoading) {
    return <SkeletonTable rows={5} columns={6} />;
  }

  return (
    <>
      <div ref={tableContainerRef} style={{ direction: table.options.columnResizeDirection }}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={(header.column.columnDef.meta as any)?.style?.className}
                    align={(header.column.columnDef.meta as any)?.style?.align}
                    sortKey={header.column.id}
                    isSorting={header.column.getIsSorted() || false}
                    onSort={header.column.getToggleSortingHandler()}
                    sortable={header.column.getCanSort()}
                    style={{
                      width: header.column.getSize(),
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                    <div
                      {...{
                        onDoubleClick: () => header.column.resetSize(),
                        onMouseDown: header.getResizeHandler(),
                        onTouchStart: header.getResizeHandler(),
                        className: `resizer ${table.options.columnResizeDirection} ${
                          header.column.getIsResizing() ? 'isResizing' : ''
                        }`,
                      }}
                    />
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => {
              const cells = row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={(cell.column.columnDef.meta as any)?.style?.className}
                  align={(cell.column.columnDef.meta as any)?.style?.align}
                  style={{
                    width: cell.column.getSize(),
                    maxWidth: cell.column.getSize(),
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ));

              const tableRow = (
                <TableRow key={row.id} onClick={() => onClickRow?.(row)}>
                  {cells}
                </TableRow>
              );

              if (contextMenu) {
                return (
                  <ContextMenu key={row.id} modal={false}>
                    <ContextMenuTrigger asChild>{tableRow}</ContextMenuTrigger>
                    <ContextMenuContent>{contextMenu(row)}</ContextMenuContent>
                  </ContextMenu>
                );
              }

              return tableRow;
            })}
          </TableBody>
        </Table>
      </div>

      {emptyState && table.getRowModel().rows.length === 0 && (
        <div className="flex min-h-24 items-center justify-center">{emptyState}</div>
      )}

      <TablePagination table={table} />
    </>
  );
}

export default DataTable;
