import { Image } from 'lucide-react';

export function SlideCard({
  title,
  lines,
  showImage,
}: {
  title: string;
  lines: number[];
  showImage?: boolean;
}) {
  return (
    <div className="bg-background/80 rounded-lg border p-2.5 shadow-sm backdrop-blur-sm">
      <div className="bg-primary/70 mb-1.5 h-1.5 w-2/5 rounded-full" />
      <div className={`mb-1.5 ${showImage ? 'grid grid-cols-2 gap-2' : 'block'}`}>
        <div className="space-y-1">
          {lines.map((w, i) => (
            <div key={i} className="bg-muted h-1.5 rounded-full" style={{ width: `${w}%` }} />
          ))}
        </div>
        {showImage && (
          <div className="bg-muted flex h-full min-h-8 items-center justify-center rounded-md">
            <Image className="text-muted-foreground/50 h-4 w-4" strokeWidth={1.5} />
          </div>
        )}
      </div>
      <p className="text-muted-foreground text-[9px] font-medium">{title}</p>
    </div>
  );
}
