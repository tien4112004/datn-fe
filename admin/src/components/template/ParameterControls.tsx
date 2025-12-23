import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { TemplateParameter } from '@/types/api';

interface ParameterControlsProps {
  parameters: TemplateParameter[];
  overrides: Record<string, number>;
  onOverrideChange: (overrides: Record<string, number>) => void;
}

export function ParameterControls({ parameters, overrides, onOverrideChange }: ParameterControlsProps) {
  if (!parameters || parameters.length === 0) {
    return null;
  }

  const handleChange = (key: string, value: number) => {
    onOverrideChange({ ...overrides, [key]: value });
  };

  const handleReset = () => {
    onOverrideChange({});
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-sm">Preview Parameters</div>
        <Button type="button" variant="ghost" size="sm" onClick={handleReset} className="h-6 text-xs">
          Reset
        </Button>
      </div>
      <div className="space-y-3 rounded-lg border p-3">
        {parameters.map((param) => {
          const currentValue = overrides[param.key] ?? param.defaultValue;
          return (
            <div key={param.key} className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs">{param.label || param.key}</Label>
                <span className="text-muted-foreground font-mono text-xs">{currentValue}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={param.min ?? 0}
                  max={param.max ?? 100}
                  step={param.step ?? 1}
                  value={currentValue}
                  onChange={(e) => handleChange(param.key, Number(e.target.value))}
                  className="flex-1"
                />
                <Input
                  type="number"
                  min={param.min ?? 0}
                  max={param.max ?? 100}
                  step={param.step ?? 1}
                  value={currentValue}
                  onChange={(e) => handleChange(param.key, Number(e.target.value))}
                  className="h-7 w-16 text-xs"
                />
              </div>
              {param.description && <p className="text-muted-foreground text-xs">{param.description}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
