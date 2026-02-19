import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@ui/dialog';
import { ColoredTabsTrigger, Tabs, TabsContent, TabsList } from '@ui/tabs';
import { useTranslation } from 'react-i18next';
import ExportImageTab from './ExportImageTab';
import ExportPDFTab from './ExportPDFTab';

interface ExportMindmapDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

function ExportMindmapDialog({ isOpen, onOpenChange }: ExportMindmapDialogProps) {
  const { t } = useTranslation('mindmap');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] !max-w-4xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>{t('export.title')}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="png" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <ColoredTabsTrigger value="png">{t('export.formats.png')}</ColoredTabsTrigger>
            <ColoredTabsTrigger value="jpg">{t('export.formats.jpg')}</ColoredTabsTrigger>
            <ColoredTabsTrigger value="pdf">{t('export.formats.pdf')}</ColoredTabsTrigger>
          </TabsList>

          <div className="mt-4 h-[400px] overflow-y-auto">
            <TabsContent value="png" className="mt-0">
              <ExportImageTab format="png" />
            </TabsContent>

            <TabsContent value="jpg" className="mt-0">
              <ExportImageTab format="jpg" />
            </TabsContent>

            <TabsContent value="pdf" className="mt-0">
              <ExportPDFTab />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default ExportMindmapDialog;
