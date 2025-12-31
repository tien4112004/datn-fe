import { Button } from '@/shared/components/ui/button';
import { Plus, Trash2, Download, Upload, Copy, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';

interface MatrixToolbarProps {
  selectedCount: number;
  onCreateNew: () => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  onGenerateExam: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

export const MatrixToolbar = ({
  selectedCount,
  onCreateNew,
  onDeleteSelected,
  onDuplicateSelected,
  onGenerateExam,
  onExport,
  onImport,
}: MatrixToolbarProps) => {
  const { t } = useTranslation(I18N_NAMESPACES.EXAM_MATRIX);

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) onImport(file);
    };
    input.click();
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-2">
        <Button onClick={onCreateNew} className="gap-2">
          <Plus className="h-4 w-4" />
          {t('toolbar.createNew')}
        </Button>

        {selectedCount > 0 && (
          <>
            <Button variant="destructive" onClick={onDeleteSelected} className="gap-2">
              <Trash2 className="h-4 w-4" />
              {t('toolbar.delete')} ({selectedCount})
            </Button>

            {selectedCount === 1 && (
              <>
                <Button variant="outline" onClick={onDuplicateSelected} className="gap-2">
                  <Copy className="h-4 w-4" />
                  {t('toolbar.duplicate')}
                </Button>

                <Button variant="default" onClick={onGenerateExam} className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  {t('toolbar.generateExam')}
                </Button>
              </>
            )}
          </>
        )}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onExport} className="gap-2">
          <Download className="h-4 w-4" />
          {t('toolbar.export')}
        </Button>

        <Button variant="outline" onClick={handleImportClick} className="gap-2">
          <Upload className="h-4 w-4" />
          {t('toolbar.import')}
        </Button>
      </div>
    </div>
  );
};
