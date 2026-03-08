import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  type ColumnDef,
  type PaginationState,
  type Updater,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Button } from '@ui/button';
import { Input } from '@ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui/table';
import { Eye, Pencil, Search, Trash2 } from 'lucide-react';
import { useAuth } from '@/shared/context/auth';
import type { Student } from '../../types';
import { StudentFormDialog } from './StudentFormDialog';
import { StudentDeleteConfirmation } from './StudentDeleteConfirmation';
import { StudentCredentialsModal, type StudentCredential } from '../credentials';
import { type StudentFormMode, useStudentMutations } from '../../hooks';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { CsvImportButton } from '../../../import-student';
import { format } from 'date-fns';
import { getLocaleDateFns } from '@/shared/i18n/helper';
import TablePagination from '@/components/table/TablePagination';

interface StudentListViewProps {
  students: Student[];
  allStudents?: Student[];
  classId: string;
  isLoading?: boolean;
  pagination: PaginationState;
  setPagination: (updaterOrValue: Updater<PaginationState>) => void;
  totalItems: number;
  search?: string;
  onSearchChange?: (value: string) => void;
}

export const StudentListView = ({
  students,
  allStudents = [],
  classId,
  isLoading = false,
  pagination,
  setPagination,
  totalItems,
  search: searchProp = '',
  onSearchChange,
}: StudentListViewProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'roster' });
  const { user } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [dialogMode, setDialogMode] = useState<StudentFormMode>('create');
  const [credentialsToShow, setCredentialsToShow] = useState<StudentCredential[]>([]);
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);

  const search = searchProp;

  const isStudent = user?.role === 'student';
  const isTeacher = !isStudent;

  // When search is active, filter allStudents client-side with client-side pagination.
  // When search is empty, fall back to server-paginated students.
  const isSearching = search.trim().length > 0;

  const filteredStudents = useMemo(() => {
    if (!isSearching) return null;
    const q = search.trim().toLowerCase();
    return allStudents.filter((s) => {
      const name = (s.fullName || `${s.firstName || ''} ${s.lastName || ''}`).toLowerCase();
      const parent = (s.parentName || '').toLowerCase();
      const phone = (s.parentPhone || '').toLowerCase();
      return name.includes(q) || parent.includes(q) || phone.includes(q);
    });
  }, [isSearching, search, allStudents]);

  const displayTotal = isSearching ? (filteredStudents ?? []).length : totalItems;

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

  const handleShowCredentials = (credentials: StudentCredential[]) => {
    setCredentialsToShow(credentials);
    setIsCredentialsModalOpen(true);
  };

  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: 'fullName',
      header: t('table.fullName'),
      cell: ({ row }) => (
        <Link
          to={`/classes/${classId}/students/${row.original.id}?tab=students`}
          className="font-medium hover:underline"
        >
          {row.getValue('fullName')}
        </Link>
      ),
    },
    {
      accessorKey: 'dateOfBirth',
      header: t('form.dateOfBirth'),
      cell: ({ row }) => {
        const dateOfBirth = row.getValue('dateOfBirth') as string | null | undefined;
        return (
          <div className="text-sm">
            {dateOfBirth
              ? format(new Date(dateOfBirth), 'P', {
                  locale: getLocaleDateFns(),
                })
              : '-'}
          </div>
        );
      },
    },
    {
      accessorKey: 'gender',
      header: t('form.gender'),
      cell: ({ row }) => {
        const gender = row.getValue('gender') as string | null | undefined;
        const genderLabel =
          gender === 'male'
            ? t('form.genderMale')
            : gender === 'female'
              ? t('form.genderFemale')
              : gender === 'other'
                ? t('form.genderOther')
                : null;
        return <div className="text-sm">{genderLabel ?? '-'}</div>;
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
    ...(isTeacher
      ? [
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
                  <Button variant="ghost" size="sm" asChild>
                    <Link
                      to={`/classes/${classId}/students/${student.id}?tab=students`}
                      aria-label={t('table.view', { studentName: student.fullName })}
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              );
            },
          } as ColumnDef<Student>,
        ]
      : []),
  ];

  const [clientPagination, setClientPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pagination.pageSize,
  });

  const handleSearchChange = (value: string) => {
    onSearchChange?.(value);
    setClientPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const activePagination = isSearching ? clientPagination : pagination;
  const activeSetPagination = isSearching ? setClientPagination : setPagination;

  const displayStudents = isSearching
    ? (filteredStudents ?? []).slice(
        clientPagination.pageIndex * clientPagination.pageSize,
        (clientPagination.pageIndex + 1) * clientPagination.pageSize
      )
    : students;

  const table = useReactTable({
    data: displayStudents,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: displayTotal,
    state: { pagination: activePagination },
    onPaginationChange: activeSetPagination,
  });

  return (
    <div className="space-y-4">
      {/* Header with Search + Add button */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1 lg:flex-none">
            <Search className="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4" />
            <Input
              placeholder={t('table.searchPlaceholder')}
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-8 lg:w-56"
            />
          </div>
          <p className="text-muted-foreground shrink-0 text-sm">
            {t('studentCount', { count: displayTotal })}
          </p>
        </div>
        {isTeacher && (
          <div className="flex items-center gap-2">
            <CsvImportButton
              classId={classId}
              onSuccess={(result) => {
                if (result.credentials && result.credentials.length > 0) {
                  handleShowCredentials(
                    result.credentials.map((c) => ({
                      studentId: c.studentId,
                      fullName: c.fullName,
                      username: c.username,
                      password: c.password,
                      email: c.email,
                    }))
                  );
                }
              }}
            />
            <Button onClick={handleOpenAddDialog}>{t('addStudentButton')}</Button>
          </div>
        )}
      </div>

      {/* Table / Card List */}
      {isLoading ? (
        <>
          {/* Mobile skeleton cards */}
          <div className="space-y-2 lg:hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-lg border p-3">
                <div className="bg-muted mb-2 h-4 w-36 animate-pulse rounded" />
                <div className="bg-muted mb-1 h-3 w-48 animate-pulse rounded" />
                <div className="bg-muted h-3 w-32 animate-pulse rounded" />
              </div>
            ))}
          </div>
          {/* Desktop skeleton table */}
          <div className="hidden overflow-x-auto rounded-md border lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  {['w-36', 'w-24', 'w-20', 'w-28', 'w-28', ...(isTeacher ? ['w-20'] : [])].map((w, i) => (
                    <TableHead key={i}>
                      <div className={`bg-muted h-4 animate-pulse rounded ${w}`} />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, rowIdx) => (
                  <TableRow key={rowIdx}>
                    <TableCell>
                      <div className="bg-muted h-4 w-32 animate-pulse rounded" />
                    </TableCell>
                    <TableCell>
                      <div className="bg-muted h-4 w-20 animate-pulse rounded" />
                    </TableCell>
                    <TableCell>
                      <div className="bg-muted h-4 w-14 animate-pulse rounded" />
                    </TableCell>
                    <TableCell>
                      <div className="bg-muted h-4 w-28 animate-pulse rounded" />
                    </TableCell>
                    <TableCell>
                      <div className="bg-muted h-4 w-24 animate-pulse rounded" />
                    </TableCell>
                    {isTeacher && (
                      <TableCell>
                        <div className="flex gap-2">
                          <div className="bg-muted h-8 w-8 animate-pulse rounded-md" />
                          <div className="bg-muted h-8 w-8 animate-pulse rounded-md" />
                          <div className="bg-muted h-8 w-8 animate-pulse rounded-md" />
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      ) : displayTotal === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border">
          <p className="text-muted-foreground mb-4">
            {isSearching ? t('table.noSearchResults') : t('noStudents')}
          </p>
          {isTeacher && !isSearching && <Button onClick={handleOpenAddDialog}>{t('addFirstStudent')}</Button>}
        </div>
      ) : (
        <>
          {/* Mobile card list */}
          <div className="space-y-2 lg:hidden">
            {displayStudents.map((student) => {
              const dob = student.dateOfBirth
                ? format(new Date(student.dateOfBirth), 'P', { locale: getLocaleDateFns() })
                : null;
              const gender =
                student.gender === 'male'
                  ? t('form.genderMale')
                  : student.gender === 'female'
                    ? t('form.genderFemale')
                    : student.gender === 'other'
                      ? t('form.genderOther')
                      : null;
              return (
                <div key={student.id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      to={`/classes/${classId}/students/${student.id}?tab=students`}
                      className="font-medium hover:underline"
                    >
                      {student.fullName}
                    </Link>
                    {isTeacher && (
                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(student)}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(student)}
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                          <Link to={`/classes/${classId}/students/${student.id}?tab=students`}>
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
                    {dob && <span>{dob}</span>}
                    {gender && <span>{gender}</span>}
                    {student.parentName && <span>{student.parentName}</span>}
                    {student.parentPhone && <span>{student.parentPhone}</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-md border lg:block">
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
        </>
      )}

      {/* Pagination */}
      {displayTotal > 0 && <TablePagination table={table} />}

      {/* Student Form Dialog */}
      {isTeacher && (
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
          onStudentCreated={(student) => {
            // Only show credentials on creation (username/password only returned then)
            if (student.username && student.password) {
              handleShowCredentials([
                {
                  studentId: student.id,
                  fullName: student.fullName || `${student.firstName} ${student.lastName}`,
                  username: student.username,
                  password: student.password,
                  email: student.parentContactEmail || undefined,
                },
              ]);
            }
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {isTeacher && (
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
      )}

      {/* Student Credentials Modal */}
      <StudentCredentialsModal
        open={isCredentialsModalOpen}
        onOpenChange={setIsCredentialsModalOpen}
        credentials={credentialsToShow}
        mode="single"
      />
    </div>
  );
};
