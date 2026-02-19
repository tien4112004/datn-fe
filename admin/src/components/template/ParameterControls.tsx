import { Button } from '@ui/button';
import { Input } from '@ui/input';
import { Label } from '@ui/label';
import { Checkbox } from '@ui/checkbox';
import type { TemplateParameter } from '@/types/api';

interface ParameterControlsProps {
  parameters: TemplateParameter[];
  overrides: Record<string, number | boolean>;
  onOverrideChange: (overrides: Record<string, number | boolean>) => void;
}

export function ParameterControls({ parameters, overrides, onOverrideChange }: ParameterControlsProps) {
  if (!parameters || parameters.length === 0) {
    return null;
  }

  const handleNumberChange = (key: string, value: number) => {
    onOverrideChange({ ...overrides, [key]: value });
  };

  const handleBooleanChange = (key: string, value: boolean) => {
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

          // Boolean parameter
          if (param.type === 'boolean') {
            return (
              <div key={param.key} className="flex items-center justify-between space-y-0">
                <div className="space-y-0.5">
                  <Label className="text-xs">{param.label || param.key}</Label>
                  {param.description && <p className="text-muted-foreground text-xs">{param.description}</p>}
                </div>
                <Checkbox
                  checked={Boolean(currentValue)}
                  onCheckedChange={(checked) => handleBooleanChange(param.key, Boolean(checked))}
                />
              </div>
            );
          }

          // Number parameter
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
                  value={Number(currentValue)}
                  onChange={(e) => handleNumberChange(param.key, Number(e.target.value))}
                  className="flex-1"
                />
                <Input
                  type="number"
                  min={param.min ?? 0}
                  max={param.max ?? 100}
                  step={param.step ?? 1}
                  value={Number(currentValue)}
                  onChange={(e) => handleNumberChange(param.key, Number(e.target.value))}
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
