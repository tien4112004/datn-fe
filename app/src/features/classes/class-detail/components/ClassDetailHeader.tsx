import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { getGradeLabel } from '../../shared/utils/grades';
import type { Class } from '../../shared/types';

interface ClassDetailHeaderProps {
  currentClass: Class;
}

export const ClassDetailHeader = ({ currentClass }: ClassDetailHeaderProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'detail' });

  return (
    <>
      <div className="space-y-6 px-8 py-6">
        {/* Class Header */}
        <div className="space-y-4">
          {/* Title and Status */}
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{currentClass.name}</h1>
            <Badge variant={currentClass.isActive ? 'default' : 'secondary'}>
              {currentClass.isActive ? t('status.active') : t('status.inactive')}
            </Badge>
          </div>

          {/* Metadata */}
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            {currentClass.settings?.grade && (
              <span className="font-medium">{getGradeLabel(currentClass.settings.grade)}</span>
            )}
            <span className="bg-muted-foreground/30 inline-block h-1 w-1 rounded-full"></span>
            {currentClass.settings?.academicYear && <span>{currentClass.settings.academicYear}</span>}
            {currentClass.settings?.class && (
              <>
                <span className="bg-muted-foreground/30 inline-block h-1 w-1 rounded-full"></span>
                <span>{currentClass.settings.class}</span>
              </>
            )}
          </div>

          {/* Description */}
          {currentClass.description && (
            <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
              {currentClass.description}
            </p>
          )}
        </div>
      </div>
    </>
  );
};
