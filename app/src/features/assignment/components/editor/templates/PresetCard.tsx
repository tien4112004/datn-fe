import { Button } from '@ui/button';
import { Badge } from '@ui/badge';
import { Trash2, Pencil } from 'lucide-react';
import { getPresetIconComponent } from '@/features/assignment/utils/presetManager';
import type { MatrixPreset } from '@/features/assignment/utils/presetManager';

interface PresetCardProps {
  preset: MatrixPreset;
  onSelect: (preset: MatrixPreset) => void;
  onEdit?: (preset: MatrixPreset) => void;
  onDelete?: (id: string) => void;
}

export function PresetCard({ preset, onSelect, onEdit, onDelete }: PresetCardProps) {
  const IconComponent = getPresetIconComponent(preset.icon);

  return (
    <div className="group relative rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-gray-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700">
      {/* Header with icon and title */}
      <div className="mb-2 flex items-start gap-3">
        {IconComponent && <IconComponent className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />}
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{preset.name}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">{preset.description}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded bg-gray-50 p-2 dark:bg-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400">Questions</div>
          <div className="font-semibold text-gray-900 dark:text-gray-100">{preset.totalQuestions}</div>
        </div>
        <div className="rounded bg-gray-50 p-2 dark:bg-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400">Points</div>
          <div className="font-semibold text-gray-900 dark:text-gray-100">{preset.totalPoints}</div>
        </div>
      </div>

      {/* Badges */}
      <div className="mb-3 space-y-1">
        {preset.difficulties.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {preset.difficulties.map((d) => (
              <Badge key={d} variant="secondary" className="text-xs">
                {d}
              </Badge>
            ))}
          </div>
        )}
        {preset.questionTypes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {preset.questionTypes.map((qt) => (
              <Badge key={qt} variant="outline" className="text-xs">
                {qt}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button size="sm" className="flex-1" onClick={() => onSelect(preset)}>
          Use
        </Button>
        {preset.isCustom && (
          <>
            {onEdit && (
              <Button size="sm" variant="ghost" onClick={() => onEdit(preset)} className="px-2">
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(preset.id)}
                className="px-2 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
