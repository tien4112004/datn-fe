import type { LucideIcon } from 'lucide-react';

interface InfoRowProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

export function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="text-muted-foreground h-4 w-4" />
      <div className="flex flex-col sm:flex-row sm:gap-2">
        <span className="text-muted-foreground text-sm">{label}:</span>
        <span className="text-sm font-medium">{value}</span>
      </div>
    </div>
  );
}
