import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useApiSwitching } from '@/context/api-switching';
import { API_MODE } from '@aiprimary/api';
import BackendUrlForm from './BackendUrlForm';

const DevToolsSettings = () => {
  const { apiMode, setApiMode } = useApiSwitching();

  return (
    <div className="space-y-6 py-4">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <h3 className="text-lg font-medium">DevTools</h3>
          <p className="text-muted-foreground text-sm">Developer tools and configuration settings</p>
        </div>
        <div className="lg:col-span-2">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Switch
                checked={apiMode === API_MODE.mock}
                onCheckedChange={(checked: boolean) => {
                  setApiMode(checked ? API_MODE.mock : API_MODE.real);
                }}
              />
              <div className="space-y-0.5">
                <Label>Use Mock Data</Label>
                <p className="text-muted-foreground text-sm">Switch between mock and real API responses</p>
              </div>
            </div>
            <BackendUrlForm />
          </div>
        </div>
      </div>

      <Separator />
    </div>
  );
};

export default DevToolsSettings;
