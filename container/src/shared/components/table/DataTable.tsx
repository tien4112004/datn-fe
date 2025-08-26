import { flexRender, type Table as TableType } from '@tanstack/react-table';
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from '@ui/table';
import TablePagination from './TablePagination';
import SkeletonTable from './SkeletonTable';

interface DataTableProps {
  table: TableType<any>;
  isLoading: boolean;
  emptyState: React.ReactNode;
  onClickRow?: (row: any) => void;
  onRightClickRow?: (row: any) => void;
}

const DataTable = ({ table, isLoading, emptyState, onClickRow, onRightClickRow }: DataTableProps) => {
  if (isLoading) {
    return <SkeletonTable rows={5} columns={6} />;
  }

  return (
    <>
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
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              onClick={() => onClickRow?.(row)}
              onContextMenu={() => onRightClickRow?.(row)}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={(cell.column.columnDef.meta as any)?.style?.className}
                  align={(cell.column.columnDef.meta as any)?.style?.align}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {emptyState && table.getRowModel().rows.length === 0 && (
        <div className="flex min-h-24 items-center justify-center">{emptyState}</div>
      )}
      <TablePagination table={table} />
    </>
  );
};

export default DataTable;
