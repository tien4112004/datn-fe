import type { LucideIcon } from 'lucide-react';

interface InfoRowProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

export function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div className="flex flex-col sm:flex-row sm:gap-2">
        <span className="text-sm text-muted-foreground">{label}:</span>
        <span className="text-sm font-medium">{value}</span>
      </div>
    </div>
  );
}
