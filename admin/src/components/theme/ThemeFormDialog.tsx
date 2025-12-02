import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemePreviewCard } from './ThemePreviewCard';
import ThemeThumbnailPreview from './ThemeThumbnailPreview';
import type { SlideTheme, PPTElementShadow, PPTElementOutline } from '@/types/api';
import { Plus, Trash2 } from 'lucide-react';

interface ThemeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme?: SlideTheme | null;
  onSubmit: (theme: SlideTheme) => void;
  isPending?: boolean;
}

const DEFAULT_SHADOW: PPTElementShadow = {
  h: 0,
  v: 0,
  blur: 0,
  color: 'rgba(0,0,0,0)',
};

const DEFAULT_OUTLINE: PPTElementOutline = {
  style: 'solid',
  width: 0,
  color: '#000000',
};

const DEFAULT_THEME_COLORS = ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B', '#10B981'];

function getDefaultTheme(): Partial<SlideTheme> {
  return {
    name: '',
    backgroundColor: '#ffffff',
    themeColors: [...DEFAULT_THEME_COLORS],
    fontColor: '#1f2937',
    fontName: 'Inter',
    titleFontName: 'Inter',
    titleFontColor: '#111827',
    labelFontName: 'Inter',
    labelFontColor: '#6b7280',
    outline: { ...DEFAULT_OUTLINE },
    shadow: { ...DEFAULT_SHADOW },
    accentImageShape: 'default',
  };
}

export function ThemeFormDialog({
  open,
  onOpenChange,
  theme,
  onSubmit,
  isPending = false,
}: ThemeFormDialogProps) {
  const [formData, setFormData] = useState<Partial<SlideTheme>>(getDefaultTheme());

  useEffect(() => {
    if (theme) {
      setFormData({
        ...theme,
        themeColors: theme.themeColors?.length ? [...theme.themeColors] : [...DEFAULT_THEME_COLORS],
        outline: theme.outline || { ...DEFAULT_OUTLINE },
        shadow: theme.shadow || { ...DEFAULT_SHADOW },
      });
    } else {
      setFormData(getDefaultTheme());
    }
  }, [theme, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as SlideTheme);
  };

  const updateThemeColor = (index: number, color: string) => {
    const newColors = [...(formData.themeColors || [])];
    newColors[index] = color;
    setFormData({ ...formData, themeColors: newColors });
  };

  const addThemeColor = () => {
    const newColors = [...(formData.themeColors || []), '#6366F1'];
    setFormData({ ...formData, themeColors: newColors });
  };

  const removeThemeColor = (index: number) => {
    const newColors = (formData.themeColors || []).filter((_, i) => i !== index);
    setFormData({ ...formData, themeColors: newColors });
  };

  const previewTheme: SlideTheme = {
    backgroundColor: formData.backgroundColor || '#ffffff',
    themeColors: formData.themeColors || DEFAULT_THEME_COLORS,
    fontColor: formData.fontColor || '#1f2937',
    fontName: formData.fontName || 'Inter',
    titleFontName: formData.titleFontName,
    titleFontColor: formData.titleFontColor,
    labelFontName: formData.labelFontName,
    labelFontColor: formData.labelFontColor,
    outline: formData.outline || DEFAULT_OUTLINE,
    shadow: formData.shadow || DEFAULT_SHADOW,
    name: formData.name,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{theme ? 'Edit Theme' : 'Create New Theme'}</DialogTitle>
          <DialogDescription>
            {theme ? 'Update the theme details below' : 'Configure a new slide theme'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left column - Form */}
            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Theme Name</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter theme name"
                  required
                />
              </div>

              {/* Background Color */}
              <div className="space-y-2">
                <Label htmlFor="backgroundColor">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={
                      typeof formData.backgroundColor === 'string' ? formData.backgroundColor : '#ffffff'
                    }
                    onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                    className="h-9 w-16 p-1"
                  />
                  <Input
                    value={typeof formData.backgroundColor === 'string' ? formData.backgroundColor : ''}
                    onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              {/* Font Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fontName">Font Family</Label>
                  <Input
                    id="fontName"
                    value={formData.fontName || ''}
                    onChange={(e) => setFormData({ ...formData, fontName: e.target.value })}
                    placeholder="Inter"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fontColor">Font Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="fontColor"
                      type="color"
                      value={formData.fontColor || '#000000'}
                      onChange={(e) => setFormData({ ...formData, fontColor: e.target.value })}
                      className="h-9 w-16 p-1"
                    />
                    <Input
                      value={formData.fontColor || ''}
                      onChange={(e) => setFormData({ ...formData, fontColor: e.target.value })}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Title Font Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="titleFontName">Title Font</Label>
                  <Input
                    id="titleFontName"
                    value={formData.titleFontName || ''}
                    onChange={(e) => setFormData({ ...formData, titleFontName: e.target.value })}
                    placeholder="Inter"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="titleFontColor">Title Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="titleFontColor"
                      type="color"
                      value={formData.titleFontColor || '#000000'}
                      onChange={(e) => setFormData({ ...formData, titleFontColor: e.target.value })}
                      className="h-9 w-16 p-1"
                    />
                    <Input
                      value={formData.titleFontColor || ''}
                      onChange={(e) => setFormData({ ...formData, titleFontColor: e.target.value })}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Theme Colors */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Theme Colors</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addThemeColor}>
                    <Plus className="mr-1 h-4 w-4" />
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(formData.themeColors || []).map((color, index) => (
                    <div key={index} className="bg-muted flex items-center gap-1 rounded-md p-1">
                      <Input
                        type="color"
                        value={color}
                        onChange={(e) => updateThemeColor(index, e.target.value)}
                        className="h-8 w-10 border-0 p-0.5"
                      />
                      {(formData.themeColors?.length || 0) > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => removeThemeColor(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column - Preview */}
            <div className="space-y-4">
              <Label>Preview</Label>
              <div className="bg-muted/30 space-y-3 rounded-lg border p-4">
                <ThemePreviewCard theme={previewTheme} title={formData.name || 'Theme Title'} />
                <div>
                  <Label className="mb-2">Thumbnail Preview</Label>
                  <ThemeThumbnailPreview theme={previewTheme} size={320} />
                </div>
              </div>
              <p className="text-muted-foreground text-sm">
                This is how your theme will look in presentations
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {theme ? 'Update Theme' : 'Create Theme'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ThemeFormDialog;
