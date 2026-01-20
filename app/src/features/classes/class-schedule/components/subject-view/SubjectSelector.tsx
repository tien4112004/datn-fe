import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { getSubjectByCode } from '@aiprimary/core';

interface SubjectSelectorProps {
  subjectCodes: string[]; // Array of subject codes
  selectedSubjectCode: string | null;
  onSubjectChange: (subject: string) => void;
  isLoading?: boolean;
}

const SubjectSelector = ({
  subjectCodes,
  selectedSubjectCode,
  onSubjectChange,
  isLoading = false,
}: SubjectSelectorProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'schedule' });

  return (
    <div className="w-full max-w-xs">
      <Select value={selectedSubjectCode || ''} onValueChange={onSubjectChange} disabled={isLoading}>
        <SelectTrigger>
          <SelectValue placeholder={t('subjectView.selectSubject')} />
        </SelectTrigger>
        <SelectContent>
          {subjectCodes.map((code) => {
            const subject = getSubjectByCode(code);
            return (
              <SelectItem key={code} value={code}>
                {subject?.name || code}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SubjectSelector;
