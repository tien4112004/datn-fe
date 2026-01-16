import { useTranslation } from 'react-i18next';
import { Label } from '@/shared/components/ui/label';
import { Separator } from '@/shared/components/ui/separator';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';
import BackendUrlForm from './BackendUrlForm';
import AIModelsTable from './AIModelsTable';

const DevToolsSettings = () => {
  const { t } = useTranslation('settings');

  const handleDeleteEverything = () => {
    toast.error(t('devtools.dangerZone.deleteEverythingMessage'));
  };

  return (
    <div className="space-y-6 py-4">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <h3 className="text-lg font-medium">{t('devtools.title')}</h3>
          <p className="text-muted-foreground text-sm">{t('devtools.subtitle')}</p>
        </div>
        <div className="lg:col-span-2">
          <div className="space-y-4">
            <BackendUrlForm />
          </div>
        </div>
      </div>

      <Separator />

      <AIModelsTable />

      <Separator />

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">{t('devtools.dangerZone.title')}</h3>
          <p className="text-muted-foreground text-sm">{t('devtools.dangerZone.subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="destructive" onClick={handleDeleteEverything}>
            {t('devtools.dangerZone.deleteEverything')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DevToolsSettings;
