import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import type { PresentationItem } from '../types/presentation';
import { Badge } from '@/components/ui/badge';
import ActionButton from './ActionButton';
import { usePresentations } from '../hooks/useApi';

const PresentationTable = () => {
  const columnHelper = createColumnHelper<PresentationItem>();

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('title', {
        header: 'Title',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('description', {
        header: 'Description',
        cell: (info) => <i>{info.getValue()}</i>,
        enableSorting: false,
      }),
      columnHelper.accessor('createdAt', {
        header: 'Created At',
        cell: (info) => info.renderValue(),
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => (
          <Badge variant={info.getValue() === 'active' ? 'default' : 'outline'} className="text-sm">
            {info.getValue()}
          </Badge>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: (info) => (
          <ActionButton
            onEdit={() => {
              console.log('Edit: ', info.row.original.id);
            }}
            onDelete={() => {
              console.log('Delete: ', info.row.original.id);
            }}
          />
        ),
        meta: {
          style: {
            align: 'center',
          },
        },
      }),
    ],
    []
  );

  const { presentationItems } = usePresentations();

  const [sorting, setSorting] = useState([{ id: 'createdAt', desc: true }]);

  useEffect(() => {
    console.log('Sorting changed:', sorting);
  }, [sorting]);

  const table = useReactTable({
    data: presentationItems || [],
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
  });

  return (
    <div className="p-2">
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
            <TableRow key={row.id}>
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
    </div>
  );
};

export default PresentationTable;
