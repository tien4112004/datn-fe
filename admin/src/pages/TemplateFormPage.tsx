import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThemeSelector, ParameterControls, TemplatePreview } from '@/components/template';
import { useCreateSlideTemplate, useSlideTemplates, useSlideThemes, useUpdateSlideTemplate } from '@/hooks';
import { moduleMethodMap } from '@/remote/module';
import type { TemplateParameter } from '@/types/api';
import type { Slide, SlideTemplate } from '@aiprimary/core';
import { generateSampleTemplateData, type LayoutType } from '@aiprimary/frontend-data';
import { json } from '@codemirror/lang-json';
import CodeMirror from '@uiw/react-codemirror';
import { FileJson, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

const AVAILABLE_LAYOUTS = [
  'title',
  'list',
  'labeled_list',
  'two_column',
  'two_column_with_image',
  'main_image',
  'table_of_contents',
  'timeline',
  'pyramid',
] as const;

function getDefaultTemplate(): Partial<SlideTemplate> {
  return {
    name: '',
    layout: 'list',
    config: { containers: {} },
    graphics: [],
    parameters: [],
  };
}

export function TemplateFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Partial<SlideTemplate>>(getDefaultTemplate());
  const [editMode, setEditMode] = useState<'form' | 'json'>('form');
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  // Which part the JSON editor is currently editing: whole template, config object, or graphics array
  const [jsonTarget, setJsonTarget] = useState<'template' | 'config' | 'graphics'>('template');

  const { data: templatesData, isLoading } = useSlideTemplates(id ? { page: 1, pageSize: 1000 } : undefined);
  const { data: themesData } = useSlideThemes({ page: 1, pageSize: 100 });
  const template = id ? templatesData?.data?.find((t) => t.id === id) || null : null;

  useEffect(() => {
    if (template) {
      setFormData(template);
      setJsonText(JSON.stringify(template, null, 2));
    } else if (!id) {
      const d = getDefaultTemplate();
      setFormData(d);
      setJsonText(JSON.stringify(d, null, 2));
    }
  }, [template, id]);

  const createMutation = useCreateSlideTemplate();
  const updateMutation = useUpdateSlideTemplate();

  // Handle navigation after successful mutation
  useEffect(() => {
    if (createMutation.isSuccess || updateMutation.isSuccess) {
      navigate('/slide-templates');
    }
  }, [createMutation.isSuccess, updateMutation.isSuccess, navigate]);

  const handleLayoutChange = (layout: string) => {
    setFormData({ ...formData, layout });
  };

  const validateJson = (txt: string) => {
    try {
      JSON.parse(txt);
      setJsonError(null);
      return true;
    } catch (e) {
      const error = e instanceof Error ? e.message : 'Invalid JSON';
      setJsonError(error);
      return false;
    }
  };

  const handleJsonChange = (value: string) => {
    setJsonText(value);
    validateJson(value);
  };

  const applyJson = () => {
    if (!validateJson(jsonText)) return;
    try {
      const parsed = JSON.parse(jsonText as string);

      // sanitize any server metadata if present
      const removeMeta = (obj: any) => {
        if (!obj || typeof obj !== 'object') return obj;
        // Remove legacy 'created'/'updated' fields only; API sanitizes timestamps
        delete obj.created;
        delete obj.updated;
        return obj;
      };

      if (jsonTarget === 'config') {
        const cfg = removeMeta(parsed);
        if (!cfg || typeof cfg !== 'object' || !('containers' in cfg)) {
          setJsonError('Config JSON must include a "containers" property');
          return;
        }
        setFormData({ ...formData, config: cfg as { containers: Record<string, any>; [key: string]: any } });
      } else if (jsonTarget === 'graphics') {
        // Allow either an array or an object with `graphics` property
        if (Array.isArray(parsed)) setFormData({ ...formData, graphics: parsed as any[] });
        else if (parsed && Array.isArray(parsed.graphics))
          setFormData({ ...formData, graphics: parsed.graphics });
        else setJsonError('Graphics JSON must be an array or an object with a `graphics` array');
      } else {
        const tpl = removeMeta(parsed) as Partial<SlideTemplate>;
        setFormData(tpl);
      }

      setEditMode('form');
      toast.success('JSON applied');
    } catch (e: any) {
      setJsonError(e?.message || 'Invalid JSON');
    }
  };

  const resetJson = () => {
    if (jsonTarget === 'config') setJsonText(JSON.stringify(formData.config || {}, null, 2));
    else if (jsonTarget === 'graphics') setJsonText(JSON.stringify(formData.graphics || [], null, 2));
    else setJsonText(JSON.stringify(formData, null, 2));
  };

  const addParameter = () => {
    const newParam: TemplateParameter = {
      key: `PARAM_${(formData.parameters?.length || 0) + 1}`,
      label: 'New Parameter',
      defaultValue: 0,
    };
    setFormData({ ...formData, parameters: [...(formData.parameters || []), newParam] });
  };

  const updateParameter = (index: number, field: keyof TemplateParameter, value: string | number) => {
    const params = [...(formData.parameters || [])];
    params[index] = { ...params[index], [field]: value };
    setFormData({ ...formData, parameters: params });
  };

  const removeParameter = (index: number) => {
    const params = (formData.parameters || []).filter((_, i) => i !== index);
    setFormData({ ...formData, parameters: params });
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    // sanitize
    const toSubmit: Partial<SlideTemplate> = { ...formData };
    // Legacy 'created'/'updated' will be stripped by the API service sanitizer
    delete (toSubmit as any).created;
    delete (toSubmit as any).updated;

    // ensure config/graphics are valid JSON if strings
    try {
      if (typeof toSubmit.config === 'string') toSubmit.config = JSON.parse(toSubmit.config as any);
      if (typeof toSubmit.graphics === 'string') toSubmit.graphics = JSON.parse(toSubmit.graphics as any);
    } catch (e) {
      toast.error('Invalid JSON in config/graphics');
      return;
    }

    const payload = toSubmit as SlideTemplate;
    if (id) updateMutation.mutate({ id, data: payload });
    else createMutation.mutate(payload);
  };

  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [parameterOverrides, setParameterOverrides] = useState<Record<string, number>>({});
  const [previewSlide, setPreviewSlide] = useState<Slide | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<Error | null>(null);
  const [previewKey, setPreviewKey] = useState(0);

  // Generate preview slide using convertToSlide from the presentation module when available.
  // Prefer using the actual mock templates (getSlideTemplates) for correct layout schemas.
  // Falls back to a simple text-based slide if conversion fails.
  useEffect(() => {
    let mounted = true;

    const makePreview = async () => {
      setPreviewLoading(true);
      setPreviewError(null);
      try {
        const methodModule = await moduleMethodMap.method();
        const { convertToSlide } = methodModule.default;

        const layoutType = (formData.layout || 'title') as LayoutType;
        let schema: any = generateSampleTemplateData(layoutType);

        schema.type = layoutType;

        const normalizeSchemaData = (s: any) => {
          if (!s || !s.data) return s;
          if (layoutType === 'timeline' && s.data.items && Array.isArray(s.data.items)) {
            s.data.items = (s.data.items as any[]).map((it: any) => {
              if (typeof it === 'string') return { label: 'Event', content: it };
              if (it.year && it.description) return { label: String(it.year), content: it.description };
              return it;
            });
          }
          if (layoutType === 'title' && (!s.data.title || typeof s.data.title !== 'string')) {
            s.data.title = String(s.data.title || formData.name || 'Preview Title');
          }
          return s;
        };

        schema = normalizeSchemaData(schema);

        const availableThemes = themesData?.data || [];
        const themeForPreview = availableThemes.find((t) => t.id === selectedThemeId) ||
          availableThemes[0] || {
            id: 'fallback',
            name: 'Fallback Theme',
            backgroundColor: '#ffffff',
            themeColors: ['#2563eb', '#64748b', '#0ea5e9'],
            fontColor: '#1e293b',
            fontName: 'Arial',
            titleFontName: 'Arial',
            titleFontColor: '#1e293b',
            outline: { style: 'solid', width: 0, color: '#000000' },
            shadow: { h: 0, v: 0, blur: 0, color: 'transparent' },
          };

        const templateForPreview = {
          id: formData.id || 'preview-template',
          name: formData.name || 'Preview Template',
          layout: formData.layout || 'list',
          config: formData.config,
          graphics: formData.graphics,
          parameters: formData.parameters,
        };

        const slide = await convertToSlide(
          schema as any,
          { width: 1000, height: 562.5 },
          themeForPreview as any,
          'preview-template-slide',
          undefined,
          parameterOverrides,
          templateForPreview
        );
        if (!mounted) return;
        setPreviewSlide(slide as Slide);
        setPreviewKey((k) => k + 1);
      } catch (err) {
        // fallback: simple textual slide
        if (!mounted) return;
        const sampleData = generateSampleTemplateData((formData.layout || 'title') as LayoutType);
        const fallbackSlide: Slide = {
          id: 'preview-template-slide',
          elements: [
            {
              id: 'preview-title',
              type: 'text',
              left: 50,
              top: 50,
              width: 900,
              height: 100,
              content: (sampleData as any)?.data?.title || formData.name || 'Preview',
              defaultFontName: 'Arial',
              defaultColor: '#000000',
              rotate: 0,
            },
          ],
          background: {
            type: 'solid',
            color: '#FFFFFF',
          } as any,
        };
        setPreviewSlide(fallbackSlide);
        setPreviewKey((k) => k + 1);
        setPreviewError(err as Error);
      } finally {
        if (mounted) setPreviewLoading(false);
      }
    };

    makePreview();
    return () => {
      mounted = false;
    };
  }, [
    formData.layout,
    formData.name,
    selectedThemeId,
    parameterOverrides,
    JSON.stringify(formData.config),
    JSON.stringify(formData.graphics),
    JSON.stringify(formData.parameters),
    JSON.stringify(themesData?.data?.find((t) => t.id === selectedThemeId)),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {id ? 'Edit Template' : 'Create New Template'}
          </h1>
          <p className="text-muted-foreground">Manage slide template configuration</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
        {/* Left - Form or JSON Editor */}
        <div className="bg-card border-border/50 overflow-auto rounded-lg border p-6">
          <div className="mb-4 flex items-center justify-between">
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
                onClick={() => {
                  setJsonTarget('template');
                  setJsonText(JSON.stringify(formData, null, 2));
                  setEditMode('json');
                }}
              >
                JSON
              </Button>
            </div>
            <div className="text-muted-foreground text-sm">
              {editMode === 'json' ? 'Edit raw template JSON' : 'Edit template using form'}
            </div>
          </div>

          {editMode === 'form' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., List - Bordered Items Grid"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Layout</Label>
                  <Select value={formData.layout || 'list'} onValueChange={handleLayoutChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_LAYOUTS.map((layout) => (
                        <SelectItem key={layout} value={layout}>
                          {layout}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Parameters */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Template Parameters (Optional)</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addParameter}>
                    <Plus className="mr-1 h-4 w-4" />
                    Add Parameter
                  </Button>
                </div>

                {(formData.parameters?.length || 0) > 0 && (
                  <div className="space-y-2 rounded-lg border p-4">
                    {formData.parameters?.map((param, index) => (
                      <div key={index} className="grid grid-cols-6 items-end gap-2">
                        <div className="col-span-2">
                          <Label className="text-xs">Key</Label>
                          <Input
                            value={param.key}
                            onChange={(e) => updateParameter(index, 'key', e.target.value)}
                            placeholder="VARIABLE_NAME"
                            className="font-mono text-sm"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs">Label</Label>
                          <Input
                            value={param.label}
                            onChange={(e) => updateParameter(index, 'label', e.target.value)}
                            placeholder="Display Label"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Default</Label>
                          <Input
                            type="number"
                            value={param.defaultValue as any}
                            onChange={(e) => updateParameter(index, 'defaultValue', Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeParameter(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Config editor small */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <FileJson className="h-4 w-4" /> Template Configuration (JSON)
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setJsonTarget('config');
                      setJsonText(JSON.stringify(formData.config || {}, null, 2));
                      setEditMode('json');
                    }}
                  >
                    Edit in JSON
                  </Button>
                </div>
                <div className="overflow-hidden rounded-md border">
                  <CodeMirror
                    value={JSON.stringify(formData.config || {}, null, 2)}
                    height="220px"
                    extensions={[json()]}
                    readOnly={true}
                    basicSetup={{ lineNumbers: true }}
                  />
                </div>
              </div>

              {/* Graphics small */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <FileJson className="h-4 w-4" /> Graphics (JSON) - Optional
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setJsonTarget('graphics');
                      setJsonText(JSON.stringify(formData.graphics || [], null, 2));
                      setEditMode('json');
                    }}
                  >
                    Edit in JSON
                  </Button>
                </div>
                <div className="overflow-hidden rounded-md border">
                  <CodeMirror
                    value={JSON.stringify(formData.graphics || [], null, 2)}
                    height="120px"
                    extensions={[json()]}
                    readOnly={true}
                    basicSetup={{ lineNumbers: true }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => navigate('/slide-templates')}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending || isLoading}
                >
                  {id ? 'Update Template' : 'Create Template'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Label className="mb-2">Template JSON</Label>
              <CodeMirror
                value={jsonText}
                height="520px"
                extensions={[json()]}
                onChange={(value: any) => handleJsonChange(value)}
                className="text-sm"
                basicSetup={{ lineNumbers: true }}
              />
              {jsonError && <div className="text-destructive text-sm">{jsonError}</div>}

              <div className="mt-2 flex items-center justify-end gap-3">
                <Button type="button" variant="outline" onClick={resetJson}>
                  Reset
                </Button>
                <Button type="button" onClick={applyJson} disabled={!!jsonError}>
                  Apply
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right - Preview */}
        <div className="space-y-4">
          <Label>Preview</Label>
          <div className="bg-muted/30 space-y-4 rounded-lg border p-4">
            <ThemeSelector
              themes={themesData?.data || []}
              selectedThemeId={selectedThemeId}
              onThemeChange={setSelectedThemeId}
            />

            <div>
              <div className="text-muted-foreground text-sm">Layout Type</div>
              <div className="text-base font-medium">{formData.layout || 'title'}</div>
            </div>

            <div>
              <div className="text-muted-foreground text-sm">Config Status</div>
              <div className="font-mono text-xs">
                {formData.config ? (
                  <>
                    Containers: {Object.keys((formData.config as any)?.containers || {}).length}
                    {Object.keys((formData.config as any)?.containers || {}).length > 0 && (
                      <> ({Object.keys((formData.config as any).containers).join(', ')})</>
                    )}
                  </>
                ) : (
                  <span className="text-red-600">No config</span>
                )}
              </div>
            </div>

            <ParameterControls
              parameters={formData.parameters || []}
              overrides={parameterOverrides}
              onOverrideChange={setParameterOverrides}
            />

            <TemplatePreview
              slide={previewSlide}
              loading={previewLoading}
              error={previewError}
              previewKey={previewKey}
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate('/slide-templates')}>
              Back
            </Button>
            <Button type="button" onClick={() => handleSubmit()}>
              Save
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default TemplateFormPage;
