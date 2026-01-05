import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Button } from '@ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui/table';
import { Pencil, Trash2 } from 'lucide-react';
import type { Student } from '../../types';
import { StudentFormDialog } from './StudentFormDialog';
import { StudentDeleteConfirmation } from './StudentDeleteConfirmation';
import { type StudentFormMode, useStudentMutations } from '../../hooks';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { CsvImportButton } from '../../../import-student';

interface StudentListViewProps {
  students: Student[];
  classId: string;
  isLoading?: boolean;
}

export const StudentListView = ({ students, classId, isLoading = false }: StudentListViewProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'roster' });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [dialogMode, setDialogMode] = useState<StudentFormMode>('create');

  // Delete confirmation dialog state
  const deleteConfirmation = useConfirmDialog<Student>();

  // Get mutations
  const { deleteStudent, isDeleting } = useStudentMutations(classId);

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setDialogMode('edit');
  };

  const handleDelete = (student: Student) => {
    deleteConfirmation.openDialog(student);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmation.pendingAction) {
      deleteStudent.mutate(deleteConfirmation.pendingAction.id, {
        onSettled: () => {
          deleteConfirmation.cancel();
        },
      });
    }
  };

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setEditingStudent(null);
    setDialogMode('create');
  };

  const handleOpenAddDialog = () => {
    setDialogMode('create');
    setEditingStudent(null);
    setIsAddDialogOpen(true);
  };

  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: 'fullName',
      header: t('table.fullName'),
      cell: ({ row }) => <div className="font-medium">{row.getValue('fullName')}</div>,
    },
    {
      accessorKey: 'dateOfBirth',
      header: t('form.dateOfBirth'),
      cell: ({ row }) => {
        const dateOfBirth = row.getValue('dateOfBirth') as string | null | undefined;
        return <div className="text-sm">{dateOfBirth || '-'}</div>;
      },
    },
    {
      accessorKey: 'gender',
      header: t('form.gender'),
      cell: ({ row }) => {
        const gender = row.getValue('gender') as string | null | undefined;
        return <div className="text-sm capitalize">{gender || '-'}</div>;
      },
    },
    {
      accessorKey: 'parentName',
      header: t('table.parentName'),
      cell: ({ row }) => {
        const parentName = row.getValue('parentName') as string | null | undefined;
        return <div className="text-sm">{parentName || '-'}</div>;
      },
    },
    {
      accessorKey: 'parentPhone',
      header: t('table.parentPhone'),
      cell: ({ row }) => {
        const parentPhone = row.getValue('parentPhone') as string | null | undefined;
        return <div className="text-sm">{parentPhone || '-'}</div>;
      },
    },
    {
      accessorKey: 'parentContactEmail',
      header: t('table.parentEmail'),
      cell: ({ row }) => {
        const email = row.getValue('parentContactEmail') as string | null | undefined;
        return <div className="max-w-xs truncate text-sm">{email || '-'}</div>;
      },
    },
    {
      id: 'actions',
      header: t('table.actions'),
      cell: ({ row }) => {
        const student = row.original;

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(student)}
              aria-label={t('table.edit', { studentName: student.fullName })}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(student)}
              aria-label={t('table.delete', { studentName: student.fullName })}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: students,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">{t('loadingRoster')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Add button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-muted-foreground text-sm">{t('studentCount', { count: students.length })}</p>
        </div>
        <div className="flex items-center gap-2">
          <CsvImportButton classId={classId} />
          <Button onClick={handleOpenAddDialog}>{t('addStudentButton')}</Button>
        </div>
      </div>

      {/* Table */}
      {students.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border">
          <p className="text-muted-foreground mb-4">{t('noStudents')}</p>
          <Button onClick={handleOpenAddDialog}>{t('addFirstStudent')}</Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
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
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Student Form Dialog */}
      <StudentFormDialog
        open={isAddDialogOpen || editingStudent !== null}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseDialog();
          }
        }}
        classId={classId}
        mode={dialogMode}
        initialData={editingStudent || undefined}
      />

      {/* Delete Confirmation Dialog */}
      <StudentDeleteConfirmation
        open={deleteConfirmation.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            deleteConfirmation.cancel();
          }
        }}
        studentName={deleteConfirmation.pendingAction?.fullName || ''}
        onConfirm={handleConfirmDelete}
        onCancel={deleteConfirmation.cancel}
        isDeleting={isDeleting}
      />
    </div>
  );
};
