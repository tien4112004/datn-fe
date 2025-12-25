import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NumberInput } from '@/components/ui/number-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Gradient, PPTElementOutline, PPTElementShadow, SlideTheme } from '@aiprimary/core';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import ThemeFormSide from './ThemeFormSide';

export const DEFAULT_SHADOW: PPTElementShadow = {
  h: 0,
  v: 0,
  blur: 0,
  color: 'rgba(0,0,0,0)',
};

export const DEFAULT_OUTLINE: PPTElementOutline = {
  style: 'solid',
  width: 0,
  color: '#000000',
};

const DEFAULT_THEME_COLORS = ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B', '#10B981'];
const MAX_THEME_COLORS = 5;

export function getDefaultTheme(): Partial<SlideTheme> {
  return {
    name: '',
    modifiers: null,
    backgroundColor: '#ffffff',
    themeColors: [...DEFAULT_THEME_COLORS],
    fontColor: '#1f2937',
    fontName: 'Inter',
    titleFontName: 'Inter',
    titleFontColor: '#111827',
    labelFontName: 'Inter',
    labelFontColor: '#6b7280',
    outline: { ...DEFAULT_OUTLINE },
    accentImageShape: 'default',
    card: {
      enabled: false,
      borderRadius: 8,
      borderWidth: 1,
      fill: 'none',
      shadow: { ...DEFAULT_SHADOW },
      backgroundColor: '#ffffff',
      textColor: '#000000',
    },
  };
}

interface ThemeFormProps {
  initialTheme?: SlideTheme | null;
  onSubmit: (theme: SlideTheme) => void;
  onCancel?: () => void;
  isPending?: boolean;
}

export function ThemeForm({ initialTheme, onSubmit, onCancel, isPending = false }: ThemeFormProps) {
  const [formData, setFormData] = useState<Partial<SlideTheme>>(getDefaultTheme());
  const [editMode, setEditMode] = useState<'form' | 'json'>('form');

  useEffect(() => {
    if (initialTheme) {
      // Remove server-side timestamp/meta fields if present
      const sanitized: Partial<SlideTheme> = { ...initialTheme };
      delete (sanitized as any).created;
      delete (sanitized as any).updated;
      delete (sanitized as any).createdAt;
      delete (sanitized as any).updatedAt;

      setFormData({
        ...sanitized,
        themeColors: sanitized.themeColors?.length
          ? [...sanitized.themeColors!.slice(0, MAX_THEME_COLORS)]
          : [...DEFAULT_THEME_COLORS],
        outline: sanitized.outline || { ...DEFAULT_OUTLINE },
        shadow: sanitized.shadow || { ...DEFAULT_SHADOW },
        accentImageShape: sanitized.accentImageShape || 'default',
        card: sanitized.card || getDefaultTheme().card,
      });
    } else {
      setFormData(getDefaultTheme());
    }
  }, [initialTheme]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ensure we don't submit server-side meta fields
    const toSubmit: Partial<SlideTheme> = { ...formData };
    delete (toSubmit as any).created;
    delete (toSubmit as any).updated;
    delete (toSubmit as any).createdAt;
    delete (toSubmit as any).updatedAt;
    onSubmit(toSubmit as SlideTheme);
  };

  const updateThemeColor = (index: number, color: string) => {
    const newColors = [...(formData.themeColors || [])];
    newColors[index] = color;
    setFormData({ ...formData, themeColors: newColors });
  };

  const addThemeColor = () => {
    const current = formData.themeColors || [];
    if (current.length >= MAX_THEME_COLORS) return;
    setFormData({ ...formData, themeColors: [...current, '#6366F1'] });
  };

  const removeThemeColor = (index: number) => {
    const newColors = (formData.themeColors || []).filter((_, i) => i !== index);
    setFormData({ ...formData, themeColors: newColors });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Create Theme</h2>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={editMode === 'form' ? undefined : 'outline'}
            onClick={() => setEditMode('form')}
          >
            Form
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editMode === 'json' ? undefined : 'outline'}
            onClick={() => setEditMode('json')}
          >
            JSON
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2">
        {/* Left column - Form or JSON Editor */}
        <div className="space-y-4">
          {editMode === 'form' ? (
            <div className="bg-card border-border/50 h-[60vh] overflow-auto rounded-lg border p-6 shadow-sm">
              <div className="space-y-7">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold">
                    Theme Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter theme name"
                    required
                  />
                </div>

                {/* Background Color */}
                <div className="bg-muted/30 space-y-3 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Background</Label>
                    <Select
                      value={typeof formData.backgroundColor === 'string' ? 'solid' : 'gradient'}
                      onValueChange={(value) => {
                        if (value === 'solid') {
                          const currentBg = formData.backgroundColor;
                          const color =
                            typeof currentBg === 'string'
                              ? currentBg
                              : currentBg?.colors?.[0]?.color || '#ffffff';
                          setFormData({ ...formData, backgroundColor: color });
                        } else {
                          const currentColor =
                            typeof formData.backgroundColor === 'string'
                              ? formData.backgroundColor
                              : '#ffffff';
                          setFormData({
                            ...formData,
                            backgroundColor: {
                              type: 'linear',
                              colors: [
                                { pos: 0, color: currentColor },
                                { pos: 100, color: '#000000' },
                              ],
                              rotate: 0,
                            } as Gradient,
                          });
                        }
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solid">Solid</SelectItem>
                        <SelectItem value="gradient">Gradient</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {typeof formData.backgroundColor === 'string' ? (
                    <div className="flex gap-2">
                      <Input
                        id="backgroundColor"
                        type="color"
                        value={formData.backgroundColor}
                        onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                        className="h-9 w-16 p-1"
                      />
                      <Input
                        value={formData.backgroundColor}
                        onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                        placeholder="#ffffff"
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-xs font-medium">Type</Label>
                          <Select
                            value={(formData.backgroundColor as Gradient).type}
                            onValueChange={(value: 'linear' | 'radial') =>
                              setFormData({
                                ...formData,
                                backgroundColor: {
                                  ...(formData.backgroundColor as Gradient),
                                  type: value,
                                },
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="linear">Linear</SelectItem>
                              <SelectItem value="radial">Radial</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {(formData.backgroundColor as Gradient).type === 'linear' && (
                          <div className="space-y-2">
                            <Label className="text-xs font-medium">Angle</Label>
                            <NumberInput
                              value={(formData.backgroundColor as Gradient).rotate}
                              onValueChange={(v: number | undefined) =>
                                setFormData({
                                  ...formData,
                                  backgroundColor: {
                                    ...(formData.backgroundColor as Gradient),
                                    rotate: v ?? 0,
                                  },
                                })
                              }
                              min={0}
                              max={360}
                              decimalScale={0}
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium">Gradient Colors</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const gradient = formData.backgroundColor as Gradient;
                              const colors = [...gradient.colors];
                              const lastPos = colors[colors.length - 1]?.pos || 0;
                              colors.push({ pos: Math.min(100, lastPos + 25), color: '#6366F1' });
                              setFormData({
                                ...formData,
                                backgroundColor: { ...gradient, colors },
                              });
                            }}
                          >
                            <Plus className="mr-1 h-3 w-3" />
                            Add
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {((formData.backgroundColor as Gradient).colors || []).map((colorStop, index) => (
                            <div key={index} className="bg-muted flex items-center gap-2 rounded-md p-2">
                              <Input
                                type="color"
                                value={colorStop.color}
                                onChange={(e) => {
                                  const gradient = formData.backgroundColor as Gradient;
                                  const colors = [...gradient.colors];
                                  colors[index] = { ...colors[index], color: e.target.value };
                                  setFormData({
                                    ...formData,
                                    backgroundColor: { ...gradient, colors },
                                  });
                                }}
                                className="h-8 w-12 p-1"
                              />
                              <Input
                                value={colorStop.color}
                                onChange={(e) => {
                                  const gradient = formData.backgroundColor as Gradient;
                                  const colors = [...gradient.colors];
                                  colors[index] = { ...colors[index], color: e.target.value };
                                  setFormData({
                                    ...formData,
                                    backgroundColor: { ...gradient, colors },
                                  });
                                }}
                                placeholder="#000000"
                                className="flex-1"
                              />
                              <NumberInput
                                value={colorStop.pos}
                                onValueChange={(v: number | undefined) => {
                                  const gradient = formData.backgroundColor as Gradient;
                                  const colors = [...gradient.colors];
                                  colors[index] = { ...colors[index], pos: v ?? 0 };
                                  setFormData({
                                    ...formData,
                                    backgroundColor: { ...gradient, colors },
                                  });
                                }}
                                min={0}
                                max={100}
                                className="w-20"
                                decimalScale={0}
                              />
                              <span className="text-muted-foreground text-xs">%</span>
                              {((formData.backgroundColor as Gradient).colors?.length || 0) > 2 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => {
                                    const gradient = formData.backgroundColor as Gradient;
                                    const colors = gradient.colors.filter((_, i) => i !== index);
                                    setFormData({
                                      ...formData,
                                      backgroundColor: { ...gradient, colors },
                                    });
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Font Settings */}
                <div className="bg-muted/30 space-y-3 rounded-lg p-4">
                  <Label className="text-sm font-semibold">Font Settings</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fontName" className="text-xs font-medium">
                        Font Family
                      </Label>
                      <Input
                        id="fontName"
                        value={formData.fontName || ''}
                        onChange={(e) => setFormData({ ...formData, fontName: e.target.value })}
                        placeholder="Inter"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fontColor" className="text-xs font-medium">
                        Font Color
                      </Label>
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
                </div>

                {/* Title Font Settings */}
                <div className="bg-muted/30 space-y-3 rounded-lg p-4">
                  <Label className="text-sm font-semibold">Title Font Settings</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="titleFontName" className="text-xs font-medium">
                        Title Font
                      </Label>
                      <Input
                        id="titleFontName"
                        value={formData.titleFontName || ''}
                        onChange={(e) => setFormData({ ...formData, titleFontName: e.target.value })}
                        placeholder="Inter"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="titleFontColor" className="text-xs font-medium">
                        Title Color
                      </Label>
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
                </div>

                {/* Theme Colors */}
                <div className="bg-muted/30 space-y-3 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Theme Colors</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addThemeColor}
                      disabled={(formData.themeColors?.length || 0) >= MAX_THEME_COLORS}
                    >
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

              {/* Modifiers */}
              <div className="space-y-2">
                <Label htmlFor="modifiers" className="text-sm font-semibold">
                  Modifiers
                </Label>
                <Textarea
                  id="modifiers"
                  value={formData.modifiers || ''}
                  onChange={(e) => setFormData({ ...formData, modifiers: e.target.value })}
                  placeholder="e.g., clean, modern, professional design"
                  rows={3}
                />
                <p className="text-muted-foreground text-xs">
                  Style modifiers appended to image generation prompts for this theme
                </p>
              </div>

              {/* Outline & Shadow */}
              <div className="bg-muted/30 space-y-3 rounded-lg p-4">
                <Label className="text-sm font-semibold">Styling</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Outline</Label>
                    <div className="flex items-center gap-2">
                      <NumberInput
                        min={0}
                        value={formData.outline?.width ?? 0}
                        onValueChange={(v: number | undefined) =>
                          setFormData({
                            ...formData,
                            outline: { ...(formData.outline || {}), width: v ?? 0 },
                          })
                        }
                        className="w-24"
                        decimalScale={0}
                      />
                      <Input
                        type="color"
                        value={formData.outline?.color ?? '#000000'}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            outline: { ...(formData.outline || {}), color: e.target.value },
                          })
                        }
                        className="h-9 w-12 p-1"
                      />

                      <Select
                        value={formData.outline?.style ?? 'solid'}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            outline: { ...(formData.outline || {}), style: value as any },
                          })
                        }
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solid">Solid</SelectItem>
                          <SelectItem value="dashed">Dashed</SelectItem>
                          <SelectItem value="dotted">Dotted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Shadow</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <NumberInput
                        value={formData.shadow?.h ?? 0}
                        onValueChange={(v: number | undefined) =>
                          setFormData({
                            ...formData,
                            shadow: { ...(formData.shadow || DEFAULT_SHADOW), h: v ?? 0 },
                          })
                        }
                        className="w-full"
                        decimalScale={0}
                      />
                      <NumberInput
                        value={formData.shadow?.v ?? 0}
                        onValueChange={(v: number | undefined) =>
                          setFormData({
                            ...formData,
                            shadow: { ...(formData.shadow || DEFAULT_SHADOW), v: v ?? 0 },
                          })
                        }
                        className="w-full"
                        decimalScale={0}
                      />
                      <NumberInput
                        value={formData.shadow?.blur ?? 0}
                        onValueChange={(v: number | undefined) =>
                          setFormData({
                            ...formData,
                            shadow: { ...(formData.shadow || DEFAULT_SHADOW), blur: v ?? 0 },
                          })
                        }
                        className="w-full"
                        decimalScale={0}
                      />
                      <Input
                        type="color"
                        value={
                          /^#/.test(String(formData.shadow?.color ?? ''))
                            ? String(formData.shadow?.color)
                            : '#000000'
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            shadow: { ...(formData.shadow || DEFAULT_SHADOW), color: e.target.value },
                          })
                        }
                        className="col-span-3 h-9 w-24 p-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Settings */}
              <div className="bg-muted/30 space-y-3 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Card Settings</Label>
                  <Checkbox
                    checked={!!formData.card?.enabled}
                    onCheckedChange={(v: boolean | 'indeterminate') =>
                      setFormData({
                        ...formData,
                        card: { ...(formData.card || getDefaultTheme().card), enabled: !!v } as NonNullable<
                          SlideTheme['card']
                        >,
                      })
                    }
                  />
                </div>

                {formData.card?.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Border Radius</Label>
                      <NumberInput
                        min={0}
                        value={(formData.card?.borderRadius ?? 8) as any}
                        onValueChange={(v: number | undefined) =>
                          setFormData({
                            ...formData,
                            card: {
                              ...(formData.card || getDefaultTheme().card),
                              borderRadius: v ?? 8,
                            } as NonNullable<SlideTheme['card']>,
                          })
                        }
                        decimalScale={0}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Border Width</Label>
                      <NumberInput
                        min={0}
                        value={(formData.card?.borderWidth ?? 1) as any}
                        onValueChange={(v: number | undefined) =>
                          setFormData({
                            ...formData,
                            card: {
                              ...(formData.card || getDefaultTheme().card),
                              borderWidth: v ?? 1,
                            } as NonNullable<SlideTheme['card']>,
                          })
                        }
                        decimalScale={0}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Fill</Label>
                      <Select
                        value={(formData.card?.fill as any) ?? 'none'}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            card: {
                              ...(formData.card || getDefaultTheme().card),
                              fill: value as any,
                            } as NonNullable<SlideTheme['card']>,
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="full">Full</SelectItem>
                          <SelectItem value="semi">Semi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Background</Label>
                      <Input
                        type="color"
                        value={(formData.card?.backgroundColor as string) ?? '#ffffff'}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            card: {
                              ...(formData.card || getDefaultTheme().card),
                              backgroundColor: e.target.value,
                            } as NonNullable<SlideTheme['card']>,
                          })
                        }
                        className="h-9 w-14 p-1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Text Color</Label>
                      <Input
                        type="color"
                        value={(formData.card?.textColor as string) ?? '#000000'}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            card: {
                              ...(formData.card || getDefaultTheme().card),
                              textColor: e.target.value,
                            } as NonNullable<SlideTheme['card']>,
                          })
                        }
                        className="h-9 w-14 p-1"
                      />
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label>Card Shadow</Label>
                      <div className="grid grid-cols-4 gap-2">
                        <NumberInput
                          value={(formData.card?.shadow?.h ?? 0) as any}
                          onValueChange={(v: number | undefined) =>
                            setFormData({
                              ...formData,
                              card: {
                                ...(formData.card || getDefaultTheme().card),
                                shadow: {
                                  ...(formData.card?.shadow || DEFAULT_SHADOW),
                                  h: v ?? 0,
                                } as PPTElementShadow,
                              } as NonNullable<SlideTheme['card']>,
                            })
                          }
                          decimalScale={0}
                        />
                        <NumberInput
                          value={(formData.card?.shadow?.v ?? 0) as any}
                          onValueChange={(v: number | undefined) =>
                            setFormData({
                              ...formData,
                              card: {
                                ...(formData.card || getDefaultTheme().card),
                                shadow: {
                                  ...(formData.card?.shadow || DEFAULT_SHADOW),
                                  v: v ?? 0,
                                } as PPTElementShadow,
                              } as NonNullable<SlideTheme['card']>,
                            })
                          }
                          decimalScale={0}
                        />
                        <NumberInput
                          value={(formData.card?.shadow?.blur ?? 0) as any}
                          onValueChange={(v: number | undefined) =>
                            setFormData({
                              ...formData,
                              card: {
                                ...(formData.card || getDefaultTheme().card),
                                shadow: {
                                  ...(formData.card?.shadow || DEFAULT_SHADOW),
                                  blur: v ?? 0,
                                } as PPTElementShadow,
                              } as NonNullable<SlideTheme['card']>,
                            })
                          }
                          decimalScale={0}
                        />
                        <Input
                          type="color"
                          value={
                            /^#/.test(String(formData.card?.shadow?.color ?? ''))
                              ? String(formData.card?.shadow?.color)
                              : '#000000'
                          }
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              card: {
                                ...(formData.card || getDefaultTheme().card),
                                shadow: {
                                  ...(formData.card?.shadow || DEFAULT_SHADOW),
                                  color: e.target.value,
                                } as PPTElementShadow,
                              } as NonNullable<SlideTheme['card']>,
                            })
                          }
                          className="h-9 w-24 p-1"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-card border-border/50 h-[60vh] overflow-auto rounded-lg border p-6 shadow-sm">
              <ThemeFormSide
                formData={formData}
                setFormData={(d) => setFormData(d)}
                onCancel={onCancel}
                isPending={isPending}
                initialTheme={initialTheme}
                editMode="json"
              />
            </div>
          )}
        </div>

        {/* Right column - Side panel */}
        <div className="space-y-4">
          <ThemeFormSide
            formData={formData}
            setFormData={(d) => setFormData(d)}
            onCancel={onCancel}
            isPending={isPending}
            initialTheme={initialTheme}
            editMode="form"
          />
        </div>
      </div>
    </form>
  );
}

export default ThemeForm;
