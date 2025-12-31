import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/components/ui/breadcrumb';
import { Separator } from '@/shared/components/ui/separator';
import { useTranslation } from 'react-i18next';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import useExamMatrixStore from '@/features/exam-matrix/stores/examMatrixStore';
import {
  useCreateMatrix,
  useUpdateMatrix,
  useExamMatrixList,
} from '@/features/exam-matrix/hooks/useExamMatrixApi';
import { toast } from 'sonner';
import { generateId } from '@/shared/lib/utils';
import { MatrixConfigForm } from '../components/MatrixConfigForm';
import { TopicManagementDialog } from '../components/TopicManagementDialog';
import { MatrixGridEditor } from '../components/MatrixGridEditor';
import { MatrixPreviewTable } from '../components/MatrixPreviewTable';

export function MatrixBuilderPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(I18N_NAMESPACES.EXAM_MATRIX);
  const { t: tCommon } = useTranslation('common', { keyPrefix: 'pages' });
  const { currentMatrix, setCurrentMatrix } = useExamMatrixStore();
  const [activeTab, setActiveTab] = useState<'configuration' | 'preview'>('configuration');
  const [topicManagerOpen, setTopicManagerOpen] = useState(false);
  const [gridEditorOpen, setGridEditorOpen] = useState(false);

  const isEditMode = !!id;

  // Load existing matrices to find the one being edited
  const { data: matrices } = useExamMatrixList({});
  const existingMatrix = isEditMode ? matrices?.matrices.find((m) => m.id === id) : null;

  const createMutation = useCreateMatrix();
  const updateMutation = useUpdateMatrix();

  // Initialize current matrix when page loads
  useEffect(() => {
    if (isEditMode && existingMatrix) {
      // Edit mode - load existing matrix
      setCurrentMatrix(existingMatrix);
    } else if (!isEditMode) {
      // Create mode - initialize empty matrix
      setCurrentMatrix({
        id: generateId(),
        name: '',
        description: '',
        subjectCode: 'T',
        targetTotalPoints: 100,
        topics: [],
        cells: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    setActiveTab('configuration');
  }, [isEditMode, existingMatrix, setCurrentMatrix]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      setCurrentMatrix(null);
    };
  }, [setCurrentMatrix]);

  const handleSave = async () => {
    if (!currentMatrix) return;

    // Basic validation
    if (!currentMatrix.name.trim()) {
      toast.error(t('validation.nameRequired'));
      return;
    }

    if (currentMatrix.targetTotalPoints <= 0) {
      toast.error(t('validation.targetPointsPositive'));
      return;
    }

    if (currentMatrix.topics.length === 0) {
      toast.error(t('validation.noTopics'));
      return;
    }

    if (currentMatrix.cells.length === 0) {
      toast.error(t('validation.noCells'));
      return;
    }

    try {
      if (isEditMode && existingMatrix) {
        // Update existing matrix
        await updateMutation.mutateAsync({
          id: currentMatrix.id,
          data: { matrix: currentMatrix },
        });
        toast.success(t('messages.updated'));
      } else {
        // Create new matrix
        const { id: _, createdAt, updatedAt, ...matrixData } = currentMatrix;
        await createMutation.mutateAsync({ matrix: matrixData });
        toast.success(t('messages.created'));
      }
      // Navigate back to list page
      navigate('/exam-matrix');
    } catch (error) {
      console.error('Error saving matrix:', error);
      toast.error(t('messages.error'));
    }
  };

  const handleCancel = () => {
    setCurrentMatrix(null);
    navigate('/exam-matrix');
  };

  if (!currentMatrix) {
    return null;
  }

  return (
    <div className="flex h-full flex-col">
      {/* Breadcrumb Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/exam-matrix">{tCommon('examMatrices')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{isEditMode ? tCommon('editMatrix') : tCommon('createMatrix')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      {/* Page Content */}
      <div className="flex flex-1 flex-col overflow-hidden px-8 py-6">
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as typeof activeTab)}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="configuration">{t('builder.tabs.configuration')}</TabsTrigger>
              <TabsTrigger value="preview">{t('builder.tabs.preview')}</TabsTrigger>
            </TabsList>

            <TabsContent value="configuration" className="mt-4 flex-1 space-y-6 overflow-auto">
              <MatrixConfigForm
                onOpenTopicManager={() => setTopicManagerOpen(true)}
                onOpenGridEditor={() => setGridEditorOpen(true)}
              />
            </TabsContent>

            <TabsContent value="preview" className="mt-4 flex-1 overflow-auto">
              <MatrixPreviewTable />
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={handleCancel}>
              {t('builder.actions.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : t('builder.actions.save')}
            </Button>
          </div>
        </div>
      </div>

      {/* Topic Management Dialog */}
      <TopicManagementDialog open={topicManagerOpen} onClose={() => setTopicManagerOpen(false)} />

      {/* Grid Editor Dialog */}
      <MatrixGridEditor open={gridEditorOpen} onClose={() => setGridEditorOpen(false)} />
    </div>
  );
}
