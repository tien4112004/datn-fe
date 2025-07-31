import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import type { PresentationItem } from '../types/presentation';
import { Badge } from '@/components/ui/badge';
import ActionButton from './ActionButton';
import { cn } from '@/shared/lib/utils';

const defaultData: PresentationItem[] = [
  {
    id: '1',
    title: 'Introduction to React',
    description: 'A comprehensive overview of React fundamentals',
    createdAt: '2023-01-15',
    status: 'active',
  },
  {
    id: '2',
    title: 'Advanced TypeScript',
    description: 'Deep dive into TypeScript advanced features',
    createdAt: '2023-02-20',
    status: 'active',
  },
  {
    id: '3',
    title: 'Database Design Patterns',
    description: 'Best practices for database architecture',
    createdAt: '2023-03-10',
    status: 'inactive',
  },
];

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

  const [data] = useState<PresentationItem[]>(() => [...defaultData]);

  const table = useReactTable({
    data: data,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
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
                  align={(cell.column.columnDef.meta as any)?.style}
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
