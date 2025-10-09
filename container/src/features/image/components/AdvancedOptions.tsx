import { AnimatePresence, motion } from 'motion/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AutosizeTextarea } from '@/components/ui/autosize-textarea';
import { CardTitle } from '@/shared/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { MODEL_TYPES, useModels } from '@/features/model';
import { ModelSelect } from '@/shared/components/common/ModelSelect';
import { IMAGE_DIMENSION_OPTIONS, ART_STYLE_OPTIONS } from '@/features/image/types';
import type { CreateImageFormData } from '@/features/image/types';
import type { Control, UseFormRegister } from 'react-hook-form';
import { Controller } from 'react-hook-form';

interface AdvancedOptionsProps {
  register: UseFormRegister<CreateImageFormData>;
  control: Control<CreateImageFormData>;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
}

const AdvancedOptions = ({ register, control, isOpen, onToggle }: AdvancedOptionsProps) => {
  const { t } = useTranslation('image', { keyPrefix: 'create' });
  const { models, isLoading, isError } = useModels(MODEL_TYPES.IMAGE);

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
              {/* 1x2 Grid for Model and Art Style */}
              <div className="grid grid-cols-2 gap-4">
                {/* Image Models */}
                <div className="space-y-2">
                  <Label>{t('model.label')}</Label>
                  <Controller
                    name="model"
                    control={control}
                    render={({ field }) => (
                      <ModelSelect
                        models={models}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder={t('model.placeholder')}
                        label={t('model.label')}
                        isLoading={isLoading}
                        isError={isError}
                      />
                    )}
                  />
                </div>

                {/* Art Styles */}
                <div className="space-y-2">
                  <Label>{t('artStyle.label')}</Label>
                  <Controller
                    name="artStyle"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange} defaultValue="">
                        <SelectTrigger>
                          <SelectValue placeholder={t('artStyle.placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {ART_STYLE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {t(`artStyle.${opt.labelKey}` as never)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              {/* Image Dimensions - Full Width Visual Options */}
              <div className="space-y-3">
                <Label>{t('dimension.label')}</Label>
                <Controller
                  name="imageDimension"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                      {IMAGE_DIMENSION_OPTIONS.map((opt) => {
                        const [width, height] = opt.value.split('x').map(Number);
                        const aspectRatio = width / height;
                        const isSelected = field.value === opt.value;

                        return (
                          <div
                            key={opt.value}
                            className={`relative cursor-pointer rounded-lg border-2 p-3 transition-all duration-200 hover:shadow-md ${
                              isSelected
                                ? 'border-primary bg-primary/5 shadow-sm'
                                : 'border-border hover:border-primary/50'
                            } `}
                            onClick={() => field.onChange(opt.value)}
                          >
                            {/* Visual representation of aspect ratio */}
                            <div className="mb-2 flex items-center justify-center">
                              <div
                                className={`rounded border-2 transition-colors ${isSelected ? 'border-primary bg-primary/10' : 'border-muted-foreground/40 bg-muted/30'} `}
                                style={{
                                  width: aspectRatio >= 1 ? '40px' : `${40 * aspectRatio}px`,
                                  height: aspectRatio >= 1 ? `${40 / aspectRatio}px` : '40px',
                                }}
                              />
                            </div>

                            {/* Dimension text */}
                            <div className="text-center">
                              <div
                                className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}
                              >
                                {/* as never = trust me bro */}
                                {t(`dimension.${opt.labelKey}` as never)}
                              </div>
                              <div className="text-muted-foreground text-xs">
                                {aspectRatio > 1 ? 'Landscape' : aspectRatio < 1 ? 'Portrait' : 'Square'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                />
              </div>

              {/* Negative Prompt */}
              <div className="space-y-2">
                <Label>{t('negativePrompt.label')}</Label>
                <AutosizeTextarea
                  placeholder={t('negativePrompt.placeholder')}
                  minHeight={60}
                  maxHeight={120}
                  className="text-sm"
                  {...register('negativePrompt')}
                />
                <p className="text-muted-foreground text-xs">{t('negativePrompt.description')}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedOptions;
