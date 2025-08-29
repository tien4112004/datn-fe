import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Separator } from '@/shared/components/ui/separator';
import { Button } from '@/shared/components/ui/button';
import { Switch } from '@/shared/components/ui/switch';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/shared/components/ui/form';
import { toast } from 'sonner';
import { useApiSwitching } from '@/context/api-switching';
import { API_MODE } from '@/shared/constants';
import useBackendUrlStore from '@/features/settings/stores/useBackendUrlStore';

type FormData = {
  backendUrl: string;
};

const DevToolsSettings = () => {
  const { apiMode, setApiMode } = useApiSwitching();
  const { backendUrl, setBackendUrl } = useBackendUrlStore();

  const form = useForm<FormData>({
    defaultValues: {
      backendUrl: backendUrl,
    },
  });

  const onSubmit = (data: FormData) => {
    setBackendUrl(data.backendUrl);
    toast.success('Backend URL saved successfully');
    form.reset({ backendUrl: data.backendUrl });
  };

  const isDirty = form.formState.isDirty;

  const [models, setModels] = useState([
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: 'OpenAI',
      mediaTypes: ['Text', 'Image'],
      enabled: true,
    },
    {
      id: 'claude-3-opus',
      name: 'Claude 3 Opus',
      provider: 'Anthropic',
      mediaTypes: ['Text'],
      enabled: true,
    },
    {
      id: 'gemini-pro',
      name: 'Gemini Pro',
      provider: 'Google',
      mediaTypes: ['Text', 'Image', 'Video'],
      enabled: false,
    },
    {
      id: 'dall-e-3',
      name: 'DALL-E 3',
      provider: 'OpenAI',
      mediaTypes: ['Image'],
      enabled: true,
    },
  ]);

  const toggleModelEnabled = (modelId: string) => {
    setModels(models.map((model) => (model.id === modelId ? { ...model, enabled: !model.enabled } : model)));
  };

  const handleDeleteEverything = () => {
    toast.error("BOOM! Everything has been deleted! And it's your fault.");
  };

  return (
    <div className="space-y-6 py-4">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <h3 className="text-lg font-medium">Development</h3>
          <p className="text-muted-foreground text-sm">Development and testing configurations.</p>
        </div>
        <div className="lg:col-span-2">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Switch
                checked={apiMode == API_MODE.mock}
                onCheckedChange={(checked: boolean) => {
                  setApiMode(checked ? API_MODE.mock : API_MODE.real);
                }}
              />
              <div className="space-y-0.5">
                <Label>Use mock data</Label>
                <p className="text-muted-foreground text-sm">Enable mock data for development and testing</p>
              </div>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="backendUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Backend URL</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input placeholder="Enter backend URL" className="w-full max-w-md" {...field} />
                        </FormControl>
                        <Button type="submit" className="h-9" disabled={!isDirty} size="sm">
                          Save
                        </Button>
                      </div>
                      <FormDescription>The URL of your backend API server</FormDescription>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">AI Models</h3>
          <p className="text-muted-foreground text-sm">
            Manage available AI models and their configurations.
          </p>
        </div>
        <div className="rounded-lg border">
          <div className="bg-muted/50 grid grid-cols-5 gap-4 border-b p-4 text-sm font-medium">
            <div>Model</div>
            <div>Provider</div>
            <div>Media Types</div>
            <div>Model ID</div>
            <div>Status</div>
          </div>
          {models.map((model) => (
            <div key={model.id} className="grid grid-cols-5 items-center gap-4 border-b p-4 last:border-b-0">
              <div className="font-medium">{model.name}</div>
              <div className="text-muted-foreground text-sm">{model.provider}</div>
              <div className="flex flex-wrap gap-1">
                {model.mediaTypes.map((type) => (
                  <span
                    key={type}
                    className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
                  >
                    {type}
                  </span>
                ))}
              </div>
              <div className="text-muted-foreground font-mono text-sm">{model.id}</div>
              <div>
                <Switch checked={model.enabled} onCheckedChange={() => toggleModelEnabled(model.id)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Danger Zone</h3>
          <p className="text-muted-foreground text-sm">Irreversible and destructive actions.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="destructive" onClick={handleDeleteEverything}>
            Delete Everything
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DevToolsSettings;
