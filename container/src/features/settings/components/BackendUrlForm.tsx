import { useForm } from 'react-hook-form';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/shared/components/ui/form';
import { toast } from 'sonner';
import useBackendUrlStore from '@/features/settings/stores/useBackendUrlStore';

type FormData = {
  backendUrl: string;
};

const BackendUrlForm = () => {
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

  return (
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
  );
};

export default BackendUrlForm;
