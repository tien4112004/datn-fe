interface PreviewCardProps {
  dataUrl: string | null;
  loading: boolean;
  error: string | null;
}

export function PreviewCard({ dataUrl, loading, error }: PreviewCardProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      {/* Preview Image */}
      <div className="border-border bg-muted relative flex w-full items-center justify-center rounded-lg border p-4">
        {loading ? (
          <div className="flex h-64 w-full items-center justify-center">
            <div className="text-center">
              <div className="border-muted-foreground border-t-foreground mb-2 inline-block h-8 w-8 animate-spin rounded-full border-4"></div>
              <p className="text-muted-foreground text-sm">Generating preview...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex h-64 w-full items-center justify-center text-center">
            <div>
              <p className="text-destructive text-sm font-medium">Preview Error</p>
              <p className="text-muted-foreground mt-1 text-xs">{error}</p>
            </div>
          </div>
        ) : dataUrl ? (
          <img src={dataUrl} alt="Export preview" className="max-h-80 max-w-full rounded object-contain" />
        ) : (
          <div className="flex h-64 w-full items-center justify-center text-center">
            <p className="text-muted-foreground text-sm">Adjust settings to generate preview</p>
          </div>
        )}
      </div>
    </div>
  );
}
