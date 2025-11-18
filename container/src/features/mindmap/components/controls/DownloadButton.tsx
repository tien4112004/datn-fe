import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ExportMindmapDialog from '../export';

function DownloadButton({ className }: { className?: string }) {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  return (
    <>
      <Button variant={'outline'} onClick={() => setIsExportDialogOpen(true)} className={className}>
        Export
      </Button>
      <ExportMindmapDialog isOpen={isExportDialogOpen} onOpenChange={setIsExportDialogOpen} />
    </>
  );
}

export default DownloadButton;
