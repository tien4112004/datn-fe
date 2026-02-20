import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@ui/dialog';
import { Button } from '@ui/button';
import { Input } from '@ui/input';
import { Textarea } from '@ui/textarea';
import { Label } from '@ui/label';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select';

const PRESET_ICONS = ['Zap', 'BookOpen', 'GraduationCap', 'Briefcase', 'Clock', 'Award'];

interface SavePresetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string, description: string, icon: string) => void;
}

export function SavePresetDialog({ open, onOpenChange, onSave }: SavePresetDialogProps) {
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT, {
    keyPrefix: 'assignmentEditor.generateMatrixDialog',
  });

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Zap');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSave = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = t('savePreset.errors.nameRequired');
    } else if (name.trim().length > 50) {
      newErrors.name = t('savePreset.errors.nameTooLong');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(name.trim(), description.trim(), icon);
    setName('');
    setDescription('');
    setIcon('Zap');
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('savePreset.title')}</DialogTitle>
          <DialogDescription>{t('savePreset.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="preset-name">{t('savePreset.fields.name')}</Label>
            <Input
              id="preset-name"
              placeholder={t('savePreset.fields.namePlaceholder')}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) {
                  setErrors({ ...errors, name: '' });
                }
              }}
              maxLength={50}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            <p className="text-xs text-gray-500 dark:text-gray-400">{name.length}/50</p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="preset-description">{t('savePreset.fields.description')}</Label>
            <Textarea
              id="preset-description"
              placeholder={t('savePreset.fields.descriptionPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              className="min-h-20 resize-none"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">{description.length}/200</p>
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <Label htmlFor="preset-icon">{t('savePreset.fields.icon')}</Label>
            <Select value={icon} onValueChange={setIcon}>
              <SelectTrigger id="preset-icon">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRESET_ICONS.map((iconName) => (
                  <SelectItem key={iconName} value={iconName}>
                    {iconName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('actions.cancel')}
          </Button>
          <Button onClick={handleSave}>{t('savePreset.save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
