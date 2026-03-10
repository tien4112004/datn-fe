export function SlideCard({ title, lines }: { title: string; lines: number[] }) {
  return (
    <div className="bg-background/80 rounded-lg border p-2.5 shadow-sm backdrop-blur-sm">
      <div className="bg-primary/70 mb-1.5 h-1.5 w-2/5 rounded-full" />
      <div className="mb-1.5 space-y-1">
        {lines.map((w, i) => (
          <div key={i} className="bg-muted h-1.5 rounded-full" style={{ width: `${w}%` }} />
        ))}
      </div>
      <p className="text-muted-foreground text-[9px] font-medium">{title}</p>
    </div>
  );
}
