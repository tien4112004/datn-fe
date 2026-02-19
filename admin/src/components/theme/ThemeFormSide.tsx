import { Button } from '@ui/button';
import { Label } from '@ui/label';
import { Textarea } from '@ui/textarea';
import type { SlideTheme } from '@aiprimary/core';
import { useEffect, useState } from 'react';
import { ThemePreviewCard } from './ThemePreviewCard';
import ThemeThumbnailPreview from './ThemeThumbnailPreview';

interface ThemeFormSideProps {
  formData: Partial<SlideTheme>;
  setFormData: (theme: Partial<SlideTheme>) => void;
  onCancel?: () => void;
  isPending?: boolean;
  initialTheme?: SlideTheme | null;
  editMode: 'form' | 'json';
}

export default function ThemeFormSide({
  formData,
  setFormData,
  onCancel,
  isPending = false,
  initialTheme,
  editMode,
}: ThemeFormSideProps) {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Keep JSON editor in sync with form data
    try {
      setJsonText(JSON.stringify(formData, null, 2));
      setError(undefined);
    } catch (err) {
      // ignore
    }
  }, [formData]);

  const applyJson = () => {
    try {
      const parsed = JSON.parse(jsonText) as Partial<SlideTheme>;
      // sanitize incoming JSON to drop server-side fields
      delete (parsed as any).createdAt;
      delete (parsed as any).updatedAt;

      setFormData(parsed);
      setError(undefined);
    } catch (err: any) {
      setError(err?.message || 'Invalid JSON');
    }
  };

  const handleJsonSubmit = () => {
    applyJson();
  };

  const resetJson = () => setJsonText(JSON.stringify(formData, null, 2));

  return (
    <div className="space-y-4">
      {editMode === 'form' && (
        <>
          <Label>Thumbnails</Label>
          <div className="bg-muted/30 h-[44vh] overflow-auto rounded-lg border p-4">
            <div className="h-full space-y-3">
              <ThemeThumbnailPreview theme={formData as SlideTheme} size={'auto'} />
            </div>
          </div>

          <Label>Preview</Label>
          <div className="mt-0 w-60">
            <ThemePreviewCard theme={formData as SlideTheme} title={formData.name || 'Theme Title'} />
          </div>

          <p className="text-muted-foreground text-sm">This is how your theme will look in presentations</p>

          <div className="flex items-center justify-end gap-3">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isPending}>
              {initialTheme ? 'Update Theme' : 'Create Theme'}
            </Button>
          </div>
        </>
      )}

      {editMode === 'json' && (
        <>
          <Label className="mb-2">Theme JSON</Label>
          <Textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            className="h-full font-mono text-sm"
          />
          {error && <div className="text-destructive text-sm">{error}</div>}

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={resetJson}>
              Reset
            </Button>
            <Button type="button" onClick={handleJsonSubmit} disabled={isPending}>
              Apply
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
