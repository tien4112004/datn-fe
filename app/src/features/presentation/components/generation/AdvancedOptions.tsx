import { AnimatePresence, motion } from 'motion/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select';
import { Label } from '@ui/label';
import { CardTitle } from '@ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Controller } from 'react-hook-form';
import { getAllGrades, getAllSubjects } from '@aiprimary/core';

import { LANGUAGE_OPTIONS } from '@/features/presentation/types';
import type { UnifiedFormData } from '@/features/presentation/contexts/PresentationFormContext';
import type { Control } from 'react-hook-form';

interface AdvancedOptionsProps {
  control: Control<UnifiedFormData>;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
}

const AdvancedOptions = ({ control, isOpen, onToggle }: AdvancedOptionsProps) => {
  const { t, i18n } = useTranslation('presentation', { keyPrefix: 'createOutline' });
  const grades = getAllGrades();
  const subjects = getAllSubjects();

  const toggleOptions = () => {
    onToggle(!isOpen);
  };

  return (
    <div className="mt-4">
      {/* Title Toggle */}
      <div className="group flex cursor-pointer items-center" onClick={toggleOptions}>
        <CardTitle className="text-medium">{t('advancedOptions')}</CardTitle>
        {isOpen ? (
          <ChevronUp className="text-muted-foreground group-hover:text-foreground ml-2 h-4 w-4 transition-colors" />
        ) : (
          <ChevronDown className="text-muted-foreground group-hover:text-foreground ml-2 h-4 w-4 transition-colors" />
        )}
      </div>

      {/* Animated Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="advancedOptions"
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20, delay: 0.1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, duration: 0.4 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="mt-4 space-y-4 px-1">
              {/* 1x2 Grid for Language and Grade */}
              <div className="grid grid-cols-2 gap-4">
                {/* Language */}
                <div className="space-y-2">
                  <Label>{t('language.label')}</Label>
                  <Controller
                    name="language"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('language.placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {t(`language.${opt.labelKey.split('.')[1]}` as never)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* Grade */}
                <div className="space-y-2">
                  <Label>{t('grade.label')}</Label>
                  <Controller
                    name="grade"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || 'none'}
                        onValueChange={(val) => field.onChange(val === 'none' ? '' : val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('grade.placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{t('grade.none')}</SelectItem>
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
              </div>

              {/* Subject Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Subject */}
                <div className="space-y-2">
                  <Label>{t('subject.label')}</Label>
                  <Controller
                    name="subject"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || 'none'}
                        onValueChange={(val) => field.onChange(val === 'none' ? '' : val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('subject.placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{t('subject.none')}</SelectItem>
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedOptions;
