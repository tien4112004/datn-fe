import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Button } from '@ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui/table';
import { Badge } from '@ui/badge';
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
      accessorKey: 'status',
      header: t('table.status'),
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const statusColors = {
          active: 'bg-green-100 text-green-800',
          transferred: 'bg-blue-100 text-blue-800',
          graduated: 'bg-purple-100 text-purple-800',
          dropped: 'bg-gray-100 text-gray-800',
        };

        const statusLabels = {
          active: t('table.statusActive'),
          transferred: t('table.statusTransferred'),
          graduated: t('table.statusGraduated'),
          dropped: t('table.statusDropped'),
        };

        return (
          <Badge className={statusColors[status as keyof typeof statusColors] || ''}>
            {statusLabels[status as keyof typeof statusLabels] || status}
          </Badge>
        );
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
      <div className="flex items-center justify-between">
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
