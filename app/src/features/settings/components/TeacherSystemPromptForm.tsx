import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Textarea } from '@ui/textarea';
import { Button } from '@ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@ui/form';
import { toast } from 'sonner';
import {
  useTeacherSystemPrompt,
  useUpsertTeacherSystemPrompt,
  useDeleteTeacherSystemPrompt,
} from '../hooks/useTeacherSystemPrompt';

interface FormValues {
  prompt: string;
}

const MAX_CHARS = 2000;

const TeacherSystemPromptForm = () => {
  const { t } = useTranslation('settings');
  const { data: existing, isLoading } = useTeacherSystemPrompt();
  const { mutate: upsert, isPending: isSaving } = useUpsertTeacherSystemPrompt();
  const { mutate: deletePrompt, isPending: isDeleting } = useDeleteTeacherSystemPrompt();

  const form = useForm<FormValues>({
    defaultValues: { prompt: '' },
  });

  const promptValue = form.watch('prompt');

  useEffect(() => {
    if (existing?.prompt) {
      form.reset({ prompt: existing.prompt });
    }
  }, [existing, form]);

  const onSubmit = (data: FormValues) => {
    upsert(
      { prompt: data.prompt.trim() },
      {
        onSuccess: () => toast.success(t('teacherSystemPrompt.success')),
        onError: () => toast.error(t('teacherSystemPrompt.error')),
      }
    );
  };

  const handleDelete = () => {
    deletePrompt(undefined, {
      onSuccess: () => {
        form.reset({ prompt: '' });
        toast.success(t('teacherSystemPrompt.deleteSuccess'));
      },
      onError: () => toast.error(t('teacherSystemPrompt.error')),
    });
  };

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">{t('teacherSystemPrompt.loading')}</p>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="prompt"
          rules={{
            required: t('teacherSystemPrompt.validation.required'),
            maxLength: {
              value: MAX_CHARS,
              message: t('teacherSystemPrompt.validation.maxLength', { max: MAX_CHARS }),
            },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('teacherSystemPrompt.label')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('teacherSystemPrompt.placeholder')}
                  className="min-h-40 resize-y"
                  {...field}
                />
              </FormControl>
              <div className="text-muted-foreground flex justify-end text-xs">
                {promptValue.length} / {MAX_CHARS}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2">
          <Button type="submit" disabled={isSaving || isDeleting}>
            {isSaving ? t('teacherSystemPrompt.saving') : t('teacherSystemPrompt.save')}
          </Button>
          {existing?.prompt && (
            <Button type="button" variant="outline" disabled={isSaving || isDeleting} onClick={handleDelete}>
              {isDeleting ? t('teacherSystemPrompt.deleting') : t('teacherSystemPrompt.delete')}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

export default TeacherSystemPromptForm;
