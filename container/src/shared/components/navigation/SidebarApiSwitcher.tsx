import { SidebarMenuItem } from '@/shared/components/ui/sidebar';
import { Switch } from '@ui/switch';
import { Label } from '@ui/label';
import { useApiSwitching } from '@/shared/context/api-switching';

const SidebarApiSwitcher = () => {
  const { apiMode, setApiMode } = useApiSwitching();

  const handleSwitchChange = (checked: boolean) => {
    setApiMode(checked ? 'mock' : 'real');
  };

  return (
    <SidebarMenuItem className="flex items-center gap-2">
      <Switch
        id="mock-data"
        defaultChecked={apiMode === 'mock'}
        onCheckedChange={handleSwitchChange}
        className="cursor-pointer"
      />
      <Label htmlFor="mock-data">Use Mock Data</Label>
    </SidebarMenuItem>
  );
};

export default SidebarApiSwitcher;
