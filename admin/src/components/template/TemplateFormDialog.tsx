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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { TemplateParameter } from '@/types/api';
import type { SlideTemplate } from '@aiprimary/core';
import { json } from '@codemirror/lang-json';
import CodeMirror from '@uiw/react-codemirror';
import { AlertCircle, FileJson, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TemplateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: SlideTemplate | null;
  onSubmit: (template: SlideTemplate) => void;
  isPending?: boolean;
}

// Available layouts from the presentation app
const AVAILABLE_LAYOUTS = [
  'title',
  'list',
  'labeledList',
  'twoColumn',
  'twoColumnWithImage',
  'mainImage',
  'tableOfContents',
  'timeline',
  'pyramid',
] as const;

// Example template configurations for different layouts
const EXAMPLE_TEMPLATES: Record<string, Record<string, unknown>> = {
  title: {
    containers: {
      title: {
        type: 'text',
        bounds: {
          left: 30,
          top: { expr: 'SLIDE_HEIGHT * 0.28' },
          width: { expr: 'SLIDE_WIDTH - 60' },
          height: 120,
        },
        layout: {
          horizontalAlignment: 'center',
          verticalAlignment: 'center',
        },
        text: {
          color: '{{theme.titleFontColor}}',
          fontFamily: '{{theme.titleFontName}}',
          fontWeight: 'bold',
          textAlign: 'center',
        },
      },
      content: {
        type: 'block',
        positioning: {
          relativeTo: 'title',
          axis: 'vertical',
          anchor: 'end',
          offset: 0,
          size: 120,
          margin: { left: 30, right: 30, top: 0, bottom: 40 },
        },
        layout: {
          horizontalAlignment: 'center',
          verticalAlignment: 'top',
        },
        childTemplate: {
          count: 'auto',
          structure: {
            type: 'text',
            label: 'subtitle',
            text: {
              color: '{{theme.fontColor}}',
              fontFamily: '{{theme.fontName}}',
              textAlign: 'center',
            },
          },
        },
      },
    },
  },
  list: {
    containers: {
      title: {
        type: 'text',
        bounds: {
          left: 20,
          top: 15,
          width: { expr: 'SLIDE_WIDTH - 40' },
          height: 120,
        },
        layout: {
          horizontalAlignment: 'center',
          verticalAlignment: 'top',
        },
        text: {
          color: '{{theme.titleFontColor}}',
          fontFamily: '{{theme.titleFontName}}',
          fontWeight: 'bold',
          textAlign: 'center',
        },
      },
      content: {
        type: 'block',
        positioning: {
          relativeTo: 'title',
          axis: 'vertical',
          anchor: 'end',
          offset: 20,
          size: 'fill',
          margin: { left: 0, right: 0, top: 0, bottom: 40 },
        },
        layout: {
          distribution: 'space-between',
          gap: 20,
          orientation: 'vertical',
        },
        childTemplate: {
          count: 'auto',
          wrap: {
            enabled: true,
            maxItemsPerLine: 4,
            lineCount: 'auto',
          },
          structure: {
            type: 'text',
            label: 'item',
            border: {
              width: '{{theme.card.borderWidth}}',
              color: '{{theme.outline.color}}',
              radius: '{{theme.card.borderRadius}}',
            },
          },
        },
      },
    },
  },
  twoColumn: {
    containers: {
      title: {
        type: 'text',
        bounds: {
          left: 30,
          top: 30,
          width: { expr: 'SLIDE_WIDTH - 60' },
          height: 100,
        },
        text: {
          color: '{{theme.titleFontColor}}',
          fontFamily: '{{theme.titleFontName}}',
          fontWeight: 'bold',
        },
      },
      leftColumn: {
        type: 'block',
        bounds: {
          left: 30,
          top: 150,
          width: { expr: '(SLIDE_WIDTH - 90) / 2' },
          height: { expr: 'SLIDE_HEIGHT - 200' },
        },
        childTemplate: {
          count: 'auto',
          structure: {
            type: 'text',
            label: 'item',
          },
        },
      },
      rightColumn: {
        type: 'block',
        bounds: {
          left: { expr: 'SLIDE_WIDTH / 2 + 15' },
          top: 150,
          width: { expr: '(SLIDE_WIDTH - 90) / 2' },
          height: { expr: 'SLIDE_HEIGHT - 200' },
        },
        childTemplate: {
          count: 'auto',
          structure: {
            type: 'text',
            label: 'item',
          },
        },
      },
    },
  },
};

function getDefaultTemplate(): Partial<SlideTemplate> {
  return {
    name: '',
    layout: 'list',
    config: EXAMPLE_TEMPLATES.list,
    graphics: [],
    parameters: [],
  };
}

export function TemplateFormDialog({
  open,
  onOpenChange,
  template,
  onSubmit,
  isPending = false,
}: TemplateFormDialogProps) {
  const [formData, setFormData] = useState<Partial<SlideTemplate>>(getDefaultTemplate());
  const [configJson, setConfigJson] = useState('');
  const [graphicsJson, setGraphicsJson] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [graphicsError, setGraphicsError] = useState<string | null>(null);

  useEffect(() => {
    if (template) {
      setFormData({
        ...template,
        parameters: template.parameters || [],
      });
      setConfigJson(JSON.stringify(template.config, null, 2));
      setGraphicsJson(JSON.stringify(template.graphics || [], null, 2));
    } else {
      const defaultTemplate = getDefaultTemplate();
      setFormData(defaultTemplate);
      setConfigJson(JSON.stringify(defaultTemplate.config, null, 2));
      setGraphicsJson('[]');
    }
    setJsonError(null);
    setGraphicsError(null);
  }, [template, open]);

  const handleLayoutChange = (layout: string) => {
    setFormData({ ...formData, layout });
    // Load example template for the selected layout
    const exampleConfig = EXAMPLE_TEMPLATES[layout] || EXAMPLE_TEMPLATES.list;
    setConfigJson(JSON.stringify(exampleConfig, null, 2));
    setJsonError(null);
  };

  const validateJson = (json: string, type: 'config' | 'graphics'): boolean => {
    try {
      JSON.parse(json);
      if (type === 'config') {
        setJsonError(null);
      } else {
        setGraphicsError(null);
      }
      return true;
    } catch (e) {
      const error = e instanceof Error ? e.message : 'Invalid JSON';
      if (type === 'config') {
        setJsonError(error);
      } else {
        setGraphicsError(error);
      }
      return false;
    }
  };

  const handleConfigChange = (value: string) => {
    setConfigJson(value);
    validateJson(value, 'config');
  };

  const handleGraphicsChange = (value: string) => {
    setGraphicsJson(value);
    validateJson(value, 'graphics');
  };

  const addParameter = () => {
    const newParam: TemplateParameter = {
      key: `PARAM_${(formData.parameters?.length || 0) + 1}`,
      label: 'New Parameter',
      defaultValue: 0,
    };
    setFormData({
      ...formData,
      parameters: [...(formData.parameters || []), newParam],
    });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateJson(configJson, 'config')) return;
    if (!validateJson(graphicsJson, 'graphics')) return;

    const submitData: SlideTemplate = {
      ...formData,
      name: formData.name || '',
      layout: formData.layout || 'list',
      config: JSON.parse(configJson),
      graphics: JSON.parse(graphicsJson),
      parameters: formData.parameters,
    };

    onSubmit(submitData);
  };

  const formatJson = (type: 'config' | 'graphics') => {
    try {
      if (type === 'config') {
        const parsed = JSON.parse(configJson);
        setConfigJson(JSON.stringify(parsed, null, 2));
        setJsonError(null);
      } else {
        const parsed = JSON.parse(graphicsJson);
        setGraphicsJson(JSON.stringify(parsed, null, 2));
        setGraphicsError(null);
      }
    } catch {
      // Already has error set
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] !max-w-6xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template ? 'Edit Template' : 'Create New Template'}</DialogTitle>
          <DialogDescription>
            {template
              ? 'Update the template configuration'
              : 'Define a new slide template using JSON configuration'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., List - Bordered Items Grid"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="layout">Layout Type</Label>
              <Select value={formData.layout || 'list'} onValueChange={handleLayoutChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select layout" />
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

          {/* Config JSON Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="config" className="flex items-center gap-2">
                <FileJson className="h-4 w-4" />
                Template Configuration (JSON)
              </Label>
              <Button type="button" variant="outline" size="sm" onClick={() => formatJson('config')}>
                Format JSON
              </Button>
            </div>
            <div className="overflow-hidden rounded-md border">
              <CodeMirror
                value={configJson}
                height="300px"
                extensions={[json()]}
                onChange={handleConfigChange}
                className="text-sm"
                theme="light"
                basicSetup={{
                  lineNumbers: true,
                  foldGutter: true,
                  highlightActiveLine: true,
                  highlightSelectionMatches: true,
                  bracketMatching: true,
                  autocompletion: true,
                }}
              />
            </div>
            {jsonError && (
              <div className="text-destructive flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4" />
                {jsonError}
              </div>
            )}
          </div>

          {/* Graphics JSON Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="graphics" className="flex items-center gap-2">
                <FileJson className="h-4 w-4" />
                Graphics (JSON) - Optional
              </Label>
              <Button type="button" variant="outline" size="sm" onClick={() => formatJson('graphics')}>
                Format JSON
              </Button>
            </div>
            <div className="overflow-hidden rounded-md border">
              <CodeMirror
                value={graphicsJson}
                height="120px"
                extensions={[json()]}
                onChange={handleGraphicsChange}
                className="text-sm"
                theme="light"
                basicSetup={{
                  lineNumbers: true,
                  foldGutter: true,
                  highlightActiveLine: true,
                  highlightSelectionMatches: true,
                  bracketMatching: true,
                  autocompletion: true,
                }}
              />
            </div>
            {graphicsError && (
              <div className="text-destructive flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4" />
                {graphicsError}
              </div>
            )}
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
                        value={param.defaultValue}
                        onChange={(e) => updateParameter(index, 'defaultValue', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeParameter(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-muted-foreground text-xs">
              Parameters can be used in expressions like {"{ expr: 'PARAM_NAME * 2' }"}
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !!jsonError || !!graphicsError}>
              {template ? 'Update Template' : 'Create Template'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default TemplateFormDialog;
