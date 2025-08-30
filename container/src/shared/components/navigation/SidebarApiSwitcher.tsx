import { SidebarMenuItem } from '@/shared/components/ui/sidebar';
import { Switch } from '@ui/switch';
import { Label } from '@ui/label';
import { useApiSwitching } from '@/shared/context/api-switching';
import { API_MODE } from '@/shared/constants';

/**
 * @deprecated Use the settings to switch API modes instead for cleaner UI.
 */
const SidebarApiSwitcher = () => {
  const { apiMode, setApiMode } = useApiSwitching();

  const handleSwitchChange = (checked: boolean) => {
    setApiMode(checked ? API_MODE.mock : API_MODE.real);
  };

  return (
    <SidebarMenuItem className="flex items-center gap-2">
      <Switch
        id="mock-data"
        checked={apiMode === API_MODE.mock}
        onCheckedChange={handleSwitchChange}
        className="cursor-pointer"
      />
      <Label htmlFor="mock-data">Use Mock Data</Label>
    </SidebarMenuItem>
  );
};

export default SidebarApiSwitcher;
