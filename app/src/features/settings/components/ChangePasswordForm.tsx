import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PasswordInput } from '@ui/password-input';
import { Button } from '@ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@ui/form';
import { toast } from 'sonner';
import { useChangePassword } from '@/features/user/hooks/useApi';

interface ChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePasswordForm = () => {
  const { t } = useTranslation('settings');
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: changePassword, isPending } = useChangePassword();

  const form = useForm<ChangePasswordFormValues>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleClose = () => {
    setIsOpen(false);
    form.reset();
  };

  const onSubmit = (data: ChangePasswordFormValues) => {
    if (data.newPassword !== data.confirmPassword) {
      form.setError('confirmPassword', {
        message: t('changePassword.validation.passwordsMismatch'),
      });
      return;
    }

    changePassword(
      {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          toast.success(t('changePassword.success'));
          handleClose();
        },
        onError: () => {
          toast.error(t('changePassword.error'));
        },
      }
    );
  };

  if (!isOpen) {
    return (
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        {t('changePassword.submit')}
      </Button>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-md space-y-4">
        <FormField
          control={form.control}
          name="currentPassword"
          rules={{ required: t('changePassword.validation.currentPasswordRequired') }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('changePassword.currentPassword')}</FormLabel>
              <FormControl>
                <PasswordInput placeholder={t('changePassword.currentPasswordPlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newPassword"
          rules={{
            required: t('changePassword.validation.currentPasswordRequired'),
            minLength: {
              value: 8,
              message: t('changePassword.validation.newPasswordMinLength'),
            },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('changePassword.newPassword')}</FormLabel>
              <FormControl>
                <PasswordInput placeholder={t('changePassword.newPasswordPlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          rules={{ required: t('changePassword.validation.confirmPasswordRequired') }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('changePassword.confirmPassword')}</FormLabel>
              <FormControl>
                <PasswordInput placeholder={t('changePassword.confirmPasswordPlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? t('changePassword.saving') : t('changePassword.submit')}
          </Button>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
            {t('changePassword.cancel')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ChangePasswordForm;
