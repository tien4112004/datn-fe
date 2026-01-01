import { useTranslation } from 'react-i18next';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { AutosizeTextarea } from '@/shared/components/ui/autosize-textarea';
import { Button } from '@/shared/components/ui/button';
import { Plus } from 'lucide-react';
import useExamMatrixStore from '@/features/exam-matrix/stores/examMatrixStore';
import type { SubjectCode } from '@/features/exam-matrix/types';

interface MatrixConfigFormProps {
  onOpenTopicManager: () => void;
  onOpenGridEditor: () => void;
}

export const MatrixConfigForm = ({ onOpenTopicManager, onOpenGridEditor }: MatrixConfigFormProps) => {
  const { t } = useTranslation(I18N_NAMESPACES.EXAM_MATRIX);
  const { currentMatrix, updateMatrix } = useExamMatrixStore();

  if (!currentMatrix) return null;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateMatrix({ name: e.target.value });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateMatrix({ description: e.target.value });
  };

  const handleSubjectChange = (value: string) => {
    updateMatrix({ subjectCode: value as SubjectCode });
  };

  const handleTargetPointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      updateMatrix({ targetTotalPoints: value });
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Information Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">{t('builder.config.basicInfo')}</h3>
        </div>

        {/* Matrix Name */}
        <div className="space-y-2">
          <Label htmlFor="matrix-name">{t('builder.config.name')}</Label>
          <Input
            id="matrix-name"
            value={currentMatrix.name}
            onChange={handleNameChange}
            placeholder={t('builder.config.namePlaceholder')}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="matrix-description">{t('builder.config.description')}</Label>
          <AutosizeTextarea
            id="matrix-description"
            value={currentMatrix.description || ''}
            onChange={handleDescriptionChange}
            placeholder={t('builder.config.descriptionPlaceholder')}
            minHeight={60}
            maxHeight={200}
          />
        </div>

        {/* Subject Selection */}
        <div className="space-y-2">
          <Label htmlFor="matrix-subject">{t('builder.config.subject')}</Label>
          <Select value={currentMatrix.subjectCode} onValueChange={handleSubjectChange}>
            <SelectTrigger id="matrix-subject">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="T">{t('subjects.T')}</SelectItem>
              <SelectItem value="TV">{t('subjects.TV')}</SelectItem>
              <SelectItem value="TA">{t('subjects.TA')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Target Total Points */}
        <div className="space-y-2">
          <Label htmlFor="matrix-target-points">{t('builder.config.targetPoints')}</Label>
          <Input
            id="matrix-target-points"
            type="number"
            min="0"
            step="0.5"
            value={currentMatrix.targetTotalPoints}
            onChange={handleTargetPointsChange}
          />
          <p className="text-muted-foreground text-sm">{t('builder.config.targetPointsDescription')}</p>
        </div>
      </div>

      {/* Topics Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{t('builder.topics.title')}</h3>
            <p className="text-muted-foreground text-sm">{t('builder.topics.subtitle')}</p>
          </div>
          <Button onClick={onOpenTopicManager} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('builder.topics.manageTopic')}
          </Button>
        </div>

        {currentMatrix.topics.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-muted-foreground">{t('builder.topics.noTopics')}</p>
            <p className="text-muted-foreground mt-1 text-sm">{t('builder.topics.addFirstTopic')}</p>
          </div>
        ) : (
          <div className="rounded-lg border">
            <div className="divide-y">
              {currentMatrix.topics.map((topic) => (
                <div key={topic.id} className="p-4">
                  <div className="font-medium">{topic.name}</div>
                  {topic.description && (
                    <p className="text-muted-foreground mt-1 text-sm">{topic.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Matrix Grid Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{t('builder.grid.title')}</h3>
            <p className="text-muted-foreground text-sm">{t('builder.grid.subtitle')}</p>
          </div>
          <Button onClick={onOpenGridEditor} variant="outline" disabled={currentMatrix.topics.length === 0}>
            {currentMatrix.cells.length === 0
              ? t('builder.grid.clickToEdit')
              : `${currentMatrix.cells.length} ${t('builder.grid.topic')}`}
          </Button>
        </div>

        {currentMatrix.topics.length === 0 && (
          <div className="rounded-lg border border-dashed p-4 text-center">
            <p className="text-muted-foreground text-sm">{t('emptyStates.addTopicsFirst')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
