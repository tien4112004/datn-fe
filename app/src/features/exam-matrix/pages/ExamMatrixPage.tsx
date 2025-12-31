import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import useExamMatrixStore from '@/features/exam-matrix/stores/examMatrixStore';
import {
  useExamMatrixList,
  useDeleteMatrices,
  useDuplicateMatrix,
  useExportMatrices,
  useImportMatrices,
} from '@/features/exam-matrix/hooks/useExamMatrixApi';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/shared/components/ui/breadcrumb';
import { Separator } from '@/shared/components/ui/separator';
import type { ExamMatrix } from '@/features/exam-matrix/types';
import type { ExamDraft } from '@/features/assignment/types/examDraft';
import { toast } from 'sonner';
import {
  MatrixTable,
  MatrixToolbar,
  MatrixFilters,
  MatrixDeleteDialog,
  ExamGeneratorDialog,
} from '../components';

export const ExamMatrixPage = () => {
  const { t } = useTranslation(I18N_NAMESPACES.EXAM_MATRIX);
  const { t: tCommon } = useTranslation('common', { keyPrefix: 'pages' });
  const navigate = useNavigate();

  // Store state
  const { filters } = useExamMatrixStore();

  // Local state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [generatorMatrix, setGeneratorMatrix] = useState<ExamMatrix | null>(null);

  // Queries
  const { data, isLoading } = useExamMatrixList(filters);
  const deleteMutation = useDeleteMatrices();
  const duplicateMutation = useDuplicateMatrix();
  const exportMutation = useExportMatrices();
  const importMutation = useImportMatrices();

  // Handlers
  const handleCreateNew = () => {
    navigate('/exam-matrix/builder');
  };

  const handleRowClick = (matrix: ExamMatrix) => {
    navigate(`/exam-matrix/builder/${matrix.id}`);
  };

  const handleDeleteSelected = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(selectedIds);
      setSelectedIds([]);
      setDeleteDialogOpen(false);
      toast.success(t('messages.deleted'));
    } catch (error) {
      console.error('Error deleting matrices:', error);
      toast.error(t('messages.error'));
    }
  };

  const handleDuplicateSelected = async () => {
    try {
      await duplicateMutation.mutateAsync(selectedIds[0]);
      setSelectedIds([]);
      toast.success(t('messages.duplicated'));
    } catch (error) {
      console.error('Error duplicating matrix:', error);
      toast.error(t('messages.error'));
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportMutation.mutateAsync(filters);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `exam-matrices-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(t('messages.exported'));
    } catch (error) {
      console.error('Error exporting matrices:', error);
      toast.error(t('messages.error'));
    }
  };

  const handleImport = async (file: File) => {
    try {
      const result = await importMutation.mutateAsync(file);
      toast.success(
        t('messages.imported', {
          success: result.success,
          failed: result.failed,
        })
      );
    } catch (error) {
      console.error('Error importing matrices:', error);
      toast.error(t('messages.error'));
    }
  };

  const handleGenerateExam = () => {
    if (selectedIds.length !== 1) {
      toast.error('Please select exactly one matrix');
      return;
    }

    const matrix = data?.matrices.find((m) => m.id === selectedIds[0]);
    if (!matrix) {
      toast.error('Matrix not found');
      return;
    }

    setGeneratorMatrix(matrix);
    setGeneratorOpen(true);
  };

  const handleGeneratorComplete = (draft: ExamDraft) => {
    setGeneratorOpen(false);
    setGeneratorMatrix(null);
    setSelectedIds([]);

    // Navigate to assignment editor with draft
    navigate('/assignments/create', {
      state: { examDraftId: draft.id },
    });

    toast.success(`Exam generated: ${draft.name}`);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Breadcrumb Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbPage>{tCommon('examMatrices')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-6 overflow-auto px-8 py-4">
        {/* Header */}
        <div>
          <h1 className="scroll-m-20 text-balance text-4xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground text-sm">{t('subtitle')}</p>
        </div>

        {/* Filters */}
        <MatrixFilters />

        {/* Toolbar */}
        <MatrixToolbar
          selectedCount={selectedIds.length}
          onCreateNew={handleCreateNew}
          onDeleteSelected={handleDeleteSelected}
          onDuplicateSelected={handleDuplicateSelected}
          onGenerateExam={handleGenerateExam}
          onExport={handleExport}
          onImport={handleImport}
        />

        {/* Table */}
        <MatrixTable
          matrices={data?.matrices || []}
          isLoading={isLoading}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onRowClick={handleRowClick}
        />

        {/* Exam Generator Dialog */}
        <ExamGeneratorDialog
          open={generatorOpen}
          matrix={generatorMatrix}
          onClose={() => setGeneratorOpen(false)}
          onComplete={handleGeneratorComplete}
        />

        {/* Delete Confirmation Dialog */}
        <MatrixDeleteDialog
          open={deleteDialogOpen}
          matrixCount={selectedIds.length}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </div>
  );
};
