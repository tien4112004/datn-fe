import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Input } from '@ui/input';
import { Button } from '@ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@ui/form';
import { toast } from 'sonner';
import { getBackendUrl, setBackendUrl } from '@/shared/utils/backend-url';

type FormData = {
  backendUrl: string;
};

const BackendUrlForm = () => {
  const { t } = useTranslation('settings');

  const form = useForm<FormData>({
    defaultValues: {
      backendUrl: getBackendUrl(),
    },
  });

  const onSubmit = (data: FormData) => {
    setBackendUrl(data.backendUrl);
    toast.success(t('devtools.backendUrlSaved'));
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
              <FormLabel>{t('devtools.backendUrl')}</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input
                    placeholder={t('devtools.backendUrlPlaceholder')}
                    className="w-full max-w-md"
                    {...field}
                  />
                </FormControl>
                <Button type="submit" className="h-9" disabled={!isDirty} size="sm">
                  {t('devtools.save')}
                </Button>
              </div>
              <FormDescription>{t('devtools.backendUrlDescription')}</FormDescription>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default BackendUrlForm;
