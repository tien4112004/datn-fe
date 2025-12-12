import DevToolsSettings from '../components/DevToolsSettings';

const SettingsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your application settings and preferences</p>
      </div>

      <DevToolsSettings />
    </div>
  );
};

export default SettingsPage;
