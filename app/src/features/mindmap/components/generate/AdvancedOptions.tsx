import { AnimatePresence, motion } from 'motion/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select';
import { Label } from '@ui/label';
import { CardTitle } from '@ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Controller } from 'react-hook-form';

import { MAX_DEPTH_OPTIONS, MAX_BRANCHES_OPTIONS } from '@/features/mindmap/types/form';
import type { CreateMindmapFormData } from '@/features/mindmap/types/form';
import type { Control } from 'react-hook-form';

interface AdvancedOptionsProps {
  control: Control<CreateMindmapFormData>;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
}

const AdvancedOptions = ({ control, isOpen, onToggle }: AdvancedOptionsProps) => {
  const { t } = useTranslation('mindmap', { keyPrefix: 'create' });

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
              {/* Max Depth */}
              <div className="space-y-2">
                <Label>{t('maxDepth.label')}</Label>
                <Controller
                  name="maxDepth"
                  control={control}
                  render={({ field }) => (
                    <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MAX_DEPTH_OPTIONS.map((depth) => (
                          <SelectItem key={depth} value={String(depth)}>
                            {depth}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <p className="text-muted-foreground text-xs">{t('maxDepth.description')}</p>
              </div>

              {/* Max Branches Per Node */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('maxBranches.label')}</Label>
                  <Controller
                    name="maxBranchesPerNode"
                    control={control}
                    render={({ field }) => (
                      <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MAX_BRANCHES_OPTIONS.map((branches) => (
                            <SelectItem key={branches} value={String(branches)}>
                              {branches}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <p className="text-muted-foreground text-xs">{t('maxBranches.description')}</p>
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
