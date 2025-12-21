import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThemeSelector, ParameterControls, TemplatePreview } from '@/components/template';
import { useCreateSlideTemplate, useSlideTemplates, useSlideThemes, useUpdateSlideTemplate } from '@/hooks';
import { moduleMethodMap } from '@/remote/module';
import type { Slide, SlideTemplate } from '@aiprimary/core';
import { generateSampleTemplateData, type LayoutType } from '@aiprimary/frontend-data';
import { json } from '@codemirror/lang-json';
import CodeMirror from '@uiw/react-codemirror';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { getDefaultTemplateForLayout, getAvailableLayouts } from '@/utils/defaultTemplates';

const AVAILABLE_LAYOUTS = getAvailableLayouts();

export function TemplateFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Partial<SlideTemplate>>({});
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [selectedLayoutType, setSelectedLayoutType] = useState<string>('');
  const [hasUnappliedChanges, setHasUnappliedChanges] = useState(false);

  const { data: templatesData, isLoading } = useSlideTemplates(id ? { page: 1, pageSize: 1000 } : undefined);
  const { data: themesData } = useSlideThemes({ page: 1, pageSize: 100 });
  const template = id ? templatesData?.data?.find((t) => t.id === id) || null : null;

  // Load template data on mount or when template changes
  useEffect(() => {
    if (template) {
      // Edit mode: Load existing template
      setFormData(template);
      setJsonText(JSON.stringify(template, null, 2));
      setSelectedLayoutType(template.layout);
      setHasUnappliedChanges(false);
    } else if (!id && !selectedLayoutType) {
      // New template: Wait for layout selection
      setFormData({});
      setJsonText('');
      setHasUnappliedChanges(false);
    }
  }, [template, id, selectedLayoutType]);

  const createMutation = useCreateSlideTemplate();
  const updateMutation = useUpdateSlideTemplate();

  // Handle navigation after successful mutation
  useEffect(() => {
    if (createMutation.isSuccess || updateMutation.isSuccess) {
      navigate('/slide-templates');
    }
  }, [createMutation.isSuccess, updateMutation.isSuccess, navigate]);

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

  const handleLayoutSelection = () => {
    if (!selectedLayoutType) {
      toast.error('Please select a layout type');
      return;
    }

    // Load default template for selected layout
    const defaultTemplate = getDefaultTemplateForLayout(selectedLayoutType);
    setFormData(defaultTemplate);
    setJsonText(JSON.stringify(defaultTemplate, null, 2));
    setHasUnappliedChanges(false);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!validateJson(jsonText)) {
      toast.error('Invalid JSON. Please fix errors before saving.');
      return;
    }

    try {
      const parsed = JSON.parse(jsonText);

      // Sanitize - remove server metadata
      delete parsed.created;
      delete parsed.updated;
      delete parsed.createdAt;
      delete parsed.updatedAt;

      // Validate required fields
      if (!parsed.name || typeof parsed.name !== 'string') {
        toast.error('Template must have a name');
        return;
      }

      if (!parsed.layout || typeof parsed.layout !== 'string') {
        toast.error('Template must have a layout type');
        return;
      }

      if (!parsed.config || typeof parsed.config !== 'object' || !parsed.config.containers) {
        toast.error('Template must have a config object with containers');
        return;
      }

      const payload = parsed as SlideTemplate;

      if (id) {
        updateMutation.mutate({ id, data: payload });
      } else {
        createMutation.mutate(payload);
      }
    } catch (e: any) {
      toast.error(`Failed to save: ${e?.message || 'Invalid template structure'}`);
    }
  };

  const resetJson = () => {
    setJsonText(JSON.stringify(formData, null, 2));
    setJsonError(null);
    setHasUnappliedChanges(false);
  };

  const handleApply = async () => {
    if (!validateJson(jsonText)) {
      toast.error('Invalid JSON. Please fix errors before applying.');
      return;
    }

    try {
      const parsed = JSON.parse(jsonText);
      setFormData(parsed);
      setHasUnappliedChanges(false);

      // Regenerate preview with the parsed data immediately
      await makePreview(parsed);

      toast.success('Template applied to preview');
    } catch (e: any) {
      toast.error(`Failed to apply: ${e?.message || 'Invalid JSON'}`);
    }
  };

  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [parameterOverrides, setParameterOverrides] = useState<Record<string, number>>({});
  const [previewSlide, setPreviewSlide] = useState<Slide | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<Error | null>(null);
  const [previewKey, setPreviewKey] = useState(0);

  // Track when JSON changes to indicate unapplied changes
  useEffect(() => {
    setHasUnappliedChanges(true);
  }, [jsonText]);

  // Generate preview slide
  const makePreview = async (templateData?: Partial<SlideTemplate>) => {
    // Use provided templateData or fall back to formData
    const dataToUse = templateData || formData;

    // Don't generate preview if no layout selected yet
    if (!dataToUse.layout) return;

    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const methodModule = await moduleMethodMap.method();
      const { convertToSlide } = methodModule.default;

      const layoutType = (dataToUse.layout || 'title') as LayoutType;
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
          s.data.title = String(s.data.title || dataToUse.name || 'Preview Title');
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
        id: dataToUse.id || 'preview-template',
        name: dataToUse.name || 'Preview Template',
        layout: dataToUse.layout || 'list',
        config: dataToUse.config,
        graphics: dataToUse.graphics,
        parameters: dataToUse.parameters,
      };

      const slide = await convertToSlide(
        schema as any,
        { width: 1000, height: 562.5 },
        themeForPreview as any,
        templateForPreview as any,
        'preview-template-slide',
        parameterOverrides
      );
      setPreviewSlide(slide as Slide);
      setPreviewKey((k) => k + 1);
    } catch (err) {
      // fallback: simple textual slide
      const sampleData = generateSampleTemplateData((dataToUse.layout || 'title') as LayoutType);
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
            content: (sampleData as any)?.data?.title || dataToUse.name || 'Preview',
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
      setPreviewLoading(false);
    }
  };

  // Regenerate preview when theme or parameters change
  useEffect(() => {
    if (formData.layout) {
      makePreview();
    }
  }, [
    selectedThemeId,
    parameterOverrides,
    JSON.stringify(themesData?.data?.find((t) => t.id === selectedThemeId)),
  ]);

  // Show layout selector for new templates before layout is selected
  if (!id && !formData.layout) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="bg-card w-full max-w-md space-y-6 rounded-lg border p-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create New Template</h1>
            <p className="text-muted-foreground mt-2">Select a layout type to begin</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Layout Type</Label>
              <Select value={selectedLayoutType} onValueChange={setSelectedLayoutType}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a layout type..." />
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

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/slide-templates')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleLayoutSelection}
                disabled={!selectedLayoutType}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {id ? 'Edit Template' : 'Create New Template'}
          </h1>
          <p className="text-muted-foreground">Edit template configuration using JSON</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
        {/* Left - JSON Editor */}
        <div className="bg-card border-border/50 space-y-4 overflow-auto rounded-lg border p-6">
          <Label className="text-base font-semibold">Template JSON</Label>
          <CodeMirror
            value={jsonText}
            height="520px"
            extensions={[json()]}
            onChange={(value: any) => handleJsonChange(value)}
            className="text-sm"
            basicSetup={{ lineNumbers: true }}
          />
          {jsonError && <div className="text-destructive text-sm">{jsonError}</div>}

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={() => navigate('/slide-templates')}>
                Cancel
              </Button>
              <Button type="button" variant="outline" onClick={resetJson}>
                Reset
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="default"
                onClick={handleApply}
                disabled={!!jsonError || !hasUnappliedChanges}
              >
                Apply to Preview
              </Button>
              <Button
                type="submit"
                disabled={!!jsonError || createMutation.isPending || updateMutation.isPending || isLoading}
              >
                {id ? 'Update Template' : 'Create Template'}
              </Button>
            </div>
          </div>
        </div>

        {/* Right - Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Preview</Label>
            {hasUnappliedChanges && (
              <span className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-600">
                Changes not applied
              </span>
            )}
          </div>
          <div className="bg-muted/30 space-y-4 rounded-lg border p-4">
            <ThemeSelector
              themes={themesData?.data || []}
              selectedThemeId={selectedThemeId}
              onThemeChange={setSelectedThemeId}
            />

            <div>
              <div className="text-muted-foreground text-sm">Layout Type</div>
              <div className="text-base font-medium">{formData.layout || 'Not set'}</div>
            </div>

            <div>
              <div className="text-muted-foreground text-sm">Template Name</div>
              <div className="text-base font-medium">{formData.name || 'Not set'}</div>
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
        </div>
      </form>
    </div>
  );
}

export default TemplateFormPage;
