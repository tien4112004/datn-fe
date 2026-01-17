import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/shared/components/ui/breadcrumb';
import { useTranslation } from 'react-i18next';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import useAssessmentMatrixStore from '@/features/assessment-matrix/stores/assessmentMatrixStore';
import {
  useCreateMatrix,
  useUpdateMatrix,
  useAssessmentMatrix,
} from '@/features/assessment-matrix/hooks/useAssessmentMatrixApi';
import { toast } from 'sonner';
import { generateId } from '@/shared/lib/utils';
import { MatrixConfigForm } from '../components/MatrixConfigForm';
import { TopicManagementDialog } from '../components/TopicManagementDialog';
import { MatrixGridEditor } from '../components/MatrixGridEditor';
import { MatrixPreviewTable } from '../components/MatrixPreviewTable';
import { Save, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';

export function MatrixBuilderPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(I18N_NAMESPACES.EXAM_MATRIX);
  const { currentMatrix, setCurrentMatrix } = useAssessmentMatrixStore();
  const [activeTab, setActiveTab] = useState<'configuration' | 'preview'>('configuration');
  const [topicManagerOpen, setTopicManagerOpen] = useState(false);
  const [gridEditorOpen, setGridEditorOpen] = useState(false);

  const isEditMode = !!id;

  // Load existing matrix if in edit mode
  const {
    data: existingMatrix,
    isLoading: isLoadingMatrix,
    error: matrixError,
  } = useAssessmentMatrix(id || '');

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
      // Navigate back to previous page
      navigate(-1);
    } catch (error) {
      console.error('Error saving matrix:', error);
      toast.error(t('messages.error'));
    }
  };

  const handleCancel = () => {
    setCurrentMatrix(null);
    navigate(-1);
  };

  // Show loading state while fetching matrix in edit mode
  if (isEditMode && isLoadingMatrix) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">{t('loading.loading')}</div>
      </div>
    );
  }

  // Show error state if matrix not found
  if (isEditMode && matrixError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <div className="text-destructive">{t('emptyStates.matrixNotFound')}</div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          {t('buttons.backToList')}
        </Button>
      </div>
    );
  }

  // If no current matrix, return null
  if (!currentMatrix) {
    return null;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col space-y-6 overflow-hidden px-8 py-12">
          {/* Breadcrumb Navigation */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {isEditMode ? t('breadcrumbs.editMatrix') : t('breadcrumbs.createMatrix') + ' Demo'}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Warning Banner - API Not Implemented */}
          <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              <strong>Demo Mode:</strong> Assessment Matrix API is not yet connected to the backend. Data will
              be stored locally and not persisted to the server.
            </AlertDescription>
          </Alert>

          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight">
                  {isEditMode ? t('builder.editTitle') : t('builder.createTitle')}
                </h1>
              </div>
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as typeof activeTab)}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <div className="flex w-full justify-between p-1">
              <TabsList className="p-1">
                <div className="grid grid-cols-2">
                  <TabsTrigger
                    value="configuration"
                    className="data-[state=active]:bg-card data-[state=active]:shadow-sm"
                  >
                    {t('builder.tabs.configuration')}
                  </TabsTrigger>
                  <TabsTrigger
                    value="preview"
                    className="data-[state=active]:bg-card data-[state=active]:shadow-sm"
                  >
                    {t('builder.tabs.preview')}
                  </TabsTrigger>
                </div>
              </TabsList>

              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleCancel}>
                  {t('builder.actions.cancel')}
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {createMutation.isPending || updateMutation.isPending
                    ? t('loading.saving')
                    : t('builder.actions.save')}
                </Button>
              </div>
            </div>

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
        </div>
      </div>

      {/* Topic Management Dialog */}
      <TopicManagementDialog open={topicManagerOpen} onClose={() => setTopicManagerOpen(false)} />

      {/* Grid Editor Dialog */}
      <MatrixGridEditor open={gridEditorOpen} onClose={() => setGridEditorOpen(false)} />
    </div>
  );
}
