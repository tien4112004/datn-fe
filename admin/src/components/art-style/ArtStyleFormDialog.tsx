import { Button } from '@ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@ui/dialog';
import { Input } from '@ui/input';
import { Label } from '@ui/label';
import { Textarea } from '@ui/textarea';
import type { ArtStyleRequest } from '@/types/api';
import type { ArtStyle } from '@aiprimary/core';
import { Image, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ArtStyleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artStyle?: ArtStyle | null;
  onSubmit: (artStyle: ArtStyleRequest) => void;
  isPending?: boolean;
}

const SUPPORTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function getDefaultFormData(): ArtStyleRequest & { visualPreview?: string } {
  return {
    id: '',
    name: '',
    labelKey: '',
    visual: undefined,
    modifiers: '',
    visualPreview: undefined,
  };
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ArtStyleFormDialog({
  open,
  onOpenChange,
  artStyle,
  onSubmit,
  isPending = false,
}: ArtStyleFormDialogProps) {
  const [formData, setFormData] = useState<ArtStyleRequest & { visualPreview?: string }>(
    getDefaultFormData()
  );
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (artStyle) {
      setFormData({
        id: artStyle.id,
        name: artStyle.name,
        labelKey: artStyle.labelKey,
        visual: undefined, // Reset visual to undefined; use visualPreview for display
        modifiers: artStyle.modifiers,
        visualPreview: artStyle.visual, // Show existing image in preview
      });
    } else {
      setFormData(getDefaultFormData());
    }
    setFileError(null);
  }, [artStyle, open]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);

    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      setFileError('Unsupported image type. Please use PNG, JPG, GIF, or WebP.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError('File size exceeds 5MB limit.');
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setFormData((prev) => ({
        ...prev,
        visual: base64,
        visualPreview: base64,
      }));
    } catch {
      setFileError('Failed to read file.');
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      visual: undefined,
      visualPreview: undefined,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { visualPreview, ...submitData } = formData;
    onSubmit(submitData as ArtStyleRequest);
  };

  const isEditing = !!artStyle?.id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] !max-w-6xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Art Style' : 'Create New Art Style'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the art style details below'
              : 'Configure a new art style for image generation'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Left column - Form */}
            <div className="space-y-4">
              {/* ID */}
              <div className="space-y-2">
                <Label htmlFor="id">ID</Label>
                <Input
                  id="id"
                  value={formData.id || ''}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  placeholder="e.g., photorealistic"
                  required
                  disabled={isEditing}
                />
                <p className="text-muted-foreground text-xs">
                  Unique identifier (cannot be changed after creation)
                </p>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Photorealistic"
                  required
                />
              </div>

              {/* Label Key */}
              <div className="space-y-2">
                <Label htmlFor="labelKey">Label Key (i18n)</Label>
                <Input
                  id="labelKey"
                  value={formData.labelKey || ''}
                  onChange={(e) => setFormData({ ...formData, labelKey: e.target.value })}
                  placeholder="e.g., photorealistic"
                  required
                />
                <p className="text-muted-foreground text-xs">Translation key for internationalization</p>
              </div>

              {/* Visual Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="visual">Visual Image</Label>
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="visual"
                    accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {formData.visualPreview ? 'Change Image' : 'Upload Image'}
                  </Button>
                  {fileError && <p className="text-sm text-red-500">{fileError}</p>}
                </div>
                <p className="text-muted-foreground text-xs">PNG, JPG, GIF, or WebP (max 5MB)</p>
              </div>

              {/* Modifiers */}
              <div className="space-y-2">
                <Label htmlFor="modifiers">Modifiers</Label>
                <Textarea
                  id="modifiers"
                  value={formData.modifiers || ''}
                  onChange={(e) => setFormData({ ...formData, modifiers: e.target.value })}
                  placeholder="e.g., ultra realistic, highly detailed, 8k resolution"
                  rows={3}
                />
                <p className="text-muted-foreground text-xs">
                  Style modifiers appended to prompts for this art style
                </p>
              </div>
            </div>

            {/* Right column - Preview */}
            <div className="space-y-4">
              <Label>Preview</Label>
              <div className="bg-muted/30 space-y-4 rounded-lg border p-4">
                {/* Visual Preview */}
                <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border bg-gray-100">
                  {formData.visualPreview ? (
                    <>
                      <img
                        src={formData.visualPreview}
                        alt={formData.name || 'Art style preview'}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute right-2 top-2 h-6 w-6"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Image className="h-12 w-12" />
                      <span className="text-sm">No preview image</span>
                    </div>
                  )}
                </div>

                {/* Details Preview */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID:</span>
                    <code className="bg-muted rounded px-2 py-0.5">{formData.id || '-'}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{formData.name || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID:</span>
                    <code className="bg-muted rounded px-2 py-0.5">{formData.id || '-'}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Label Key:</span>
                    <code className="bg-muted rounded px-2 py-0.5">{formData.labelKey || '-'}</code>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Modifiers:</span>
                    <p className="bg-muted break-words rounded px-2 py-1 text-xs">
                      {formData.modifiers || '-'}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground text-sm">
                This is how the art style will appear in the image generation settings
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isEditing ? 'Update Art Style' : 'Create Art Style'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ArtStyleFormDialog;
