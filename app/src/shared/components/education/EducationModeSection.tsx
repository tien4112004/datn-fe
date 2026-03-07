import { AnimatePresence, motion } from 'motion/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select';
import { Label } from '@ui/label';
import { Switch } from '@ui/switch';
import { useTranslation } from 'react-i18next';
import { Controller, useWatch, type Control, type UseFormSetValue } from 'react-hook-form';
import { getAllGrades, getAllSubjects } from '@aiprimary/core';
import { GraduationCap } from 'lucide-react';
import { useEffect } from 'react';
import { useChapters } from '@/shared/hooks/useChapters';

interface EducationModeSectionProps<T extends Record<string, unknown>> {
  control: Control<T>;
  setValue: UseFormSetValue<T>;
  ns: string;
  keyPrefix: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EducationModeSection = ({ control, setValue, ns, keyPrefix }: EducationModeSectionProps<any>) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { t, i18n } = useTranslation(ns as any, { keyPrefix });
  const grades = getAllGrades();
  const subjects = getAllSubjects();

  const educationMode = useWatch({ control, name: 'educationMode' });
  const grade = useWatch({ control, name: 'grade' });
  const subject = useWatch({ control, name: 'subject' });

  const { chapters, isLoading: chaptersLoading } = useChapters(grade, subject);

  // Reset chapter when grade or subject changes
  useEffect(() => {
    setValue('chapter', '');
  }, [grade, subject, setValue]);

  return (
    <div className="mt-4">
      {/* Toggle Row */}
      <div className="flex items-center gap-3">
        <GraduationCap className="text-primary h-4 w-4" />
        <span className="text-medium font-medium">{t('educationMode.label')}</span>
        <Controller
          name="educationMode"
          control={control}
          render={({ field }) => (
            <Switch
              checked={Boolean(field.value)}
              onCheckedChange={(checked) => {
                field.onChange(checked);
                if (!checked) {
                  setValue('grade', '');
                  setValue('subject', '');
                  setValue('chapter', '');
                }
              }}
            />
          )}
        />
      </div>

      <AnimatePresence>
        {educationMode && (
          <motion.div
            key="educationFields"
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="border-primary/20 bg-primary/5 mt-3 space-y-3 rounded-lg border p-3">
              <p className="text-muted-foreground text-xs">{t('educationMode.description')}</p>

              {/* Grade + Subject row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    {t('grade.label')} <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="grade"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value || ''} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('grade.placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {grades.map((g) => (
                            <SelectItem key={g.code} value={g.code}>
                              {i18n.language === 'vi' ? g.name : g.nameEn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    {t('subject.label')} <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="subject"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value || ''} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('subject.placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((s) => (
                            <SelectItem key={s.code} value={s.code}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              {/* Chapter row */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  {t('chapter.label')} <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="chapter"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || ''}
                      onValueChange={field.onChange}
                      disabled={!grade || !subject || chaptersLoading}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            !grade || !subject
                              ? t('chapter.selectGradeSubjectFirst')
                              : chaptersLoading
                                ? t('chapter.loading')
                                : chapters.length === 0
                                  ? t('chapter.noChapters')
                                  : t('chapter.placeholder')
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {chapters.map((ch) => (
                          <SelectItem key={ch.id} value={ch.name}>
                            {ch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EducationModeSection;
