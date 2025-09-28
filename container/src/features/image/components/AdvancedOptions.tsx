import { AnimatePresence, motion } from 'motion/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AutosizeTextarea } from '@/components/ui/autosize-textarea';
import { CardTitle } from '@/shared/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useModels } from '@/features/model';
import { ModelSelect } from '@/shared/components/common/ModelSelect';
import { IMAGE_DIMENSION_OPTIONS, ART_STYLE_OPTIONS, THEME_OPTIONS } from '@/features/image/types';
import type { CreateImageFormData } from '@/features/image/types';
import type { Control, UseFormRegister, ControllerRenderProps } from 'react-hook-form';
import { Controller } from 'react-hook-form';

interface AdvancedOptionsProps {
  register: UseFormRegister<CreateImageFormData>;
  control: Control<CreateImageFormData>;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
}

const AdvancedOptions = ({ register, control, isOpen, onToggle }: AdvancedOptionsProps) => {
  const { t } = useTranslation('image', { keyPrefix: 'createImage' });
  const { models, isLoading, isError } = useModels();

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
              {/* 2x2 Grid for Dropdowns */}
              <div className="grid grid-cols-2 gap-4">
                {/* Image Models */}
                <div className="space-y-2">
                  <Label>{t('imageModel')}</Label>
                  <Controller
                    name="imageModel"
                    control={control}
                    render={({
                      field,
                    }: {
                      field: ControllerRenderProps<CreateImageFormData, 'imageModel'>;
                    }) => (
                      <ModelSelect
                        models={models}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder={t('imageModelPlaceholder')}
                        label={t('imageModel')}
                        isLoading={isLoading}
                        isError={isError}
                      />
                    )}
                  />
                </div>

                {/* Image Dimension */}
                <div className="space-y-2">
                  <Label>{t('imageDimension')}</Label>
                  <Controller
                    name="imageDimension"
                    control={control}
                    render={({
                      field,
                    }: {
                      field: ControllerRenderProps<CreateImageFormData, 'imageDimension'>;
                    }) => (
                      <Select value={field.value} onValueChange={field.onChange} defaultValue="">
                        <SelectTrigger>
                          <SelectValue placeholder={t('imageDimensionPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {IMAGE_DIMENSION_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {t(`dimensions.${opt.labelKey}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* Art Styles */}
                <div className="space-y-2">
                  <Label>{t('artStyle')}</Label>
                  <Controller
                    name="artStyle"
                    control={control}
                    render={({
                      field,
                    }: {
                      field: ControllerRenderProps<CreateImageFormData, 'artStyle'>;
                    }) => (
                      <Select value={field.value} onValueChange={field.onChange} defaultValue="">
                        <SelectTrigger>
                          <SelectValue placeholder={t('artStylePlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {ART_STYLE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {t(`artStyles.${opt.labelKey}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* Theme */}
                <div className="space-y-2">
                  <Label>{t('theme')}</Label>
                  <Controller
                    name="theme"
                    control={control}
                    render={({ field }: { field: ControllerRenderProps<CreateImageFormData, 'theme'> }) => (
                      <Select value={field.value} onValueChange={field.onChange} defaultValue="">
                        <SelectTrigger>
                          <SelectValue placeholder={t('themePlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {THEME_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {t(`themes.${opt.labelKey}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              {/* Negative Prompt */}
              <div className="space-y-2">
                <Label>{t('negativePrompt')}</Label>
                <AutosizeTextarea
                  placeholder={t('negativePromptPlaceholder')}
                  minHeight={60}
                  maxHeight={120}
                  className="text-sm"
                  {...register('negativePrompt')}
                />
                <p className="text-muted-foreground text-xs">{t('negativePromptDescription')}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedOptions;
