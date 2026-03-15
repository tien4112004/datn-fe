import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, parse, isValid } from 'date-fns';
import { useUserProfile, useUpdateUserProfile } from '../hooks/useApi';
import { Input } from '@ui/input';
import { DateInput } from '@ui/date-input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@ui/form';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LoadingButton from '@/shared/components/common/LoadingButton';
import { getLocaleDateFns } from '@/shared/i18n/helper';

export const UserProfileForm = () => {
  const { t } = useTranslation('settings');
  const { data: userProfile, isLoading: isLoadingProfile } = useUserProfile();

  const profileFormSchema = z.object({
    firstName: z.string().min(1, t('profile.form.validation.firstNameRequired')),
    lastName: z.string().min(1, t('profile.form.validation.lastNameRequired')),
    dateOfBirth: z.string().optional(), // Assuming YYYY-MM-DD format
  });

  type ProfileFormValues = z.infer<typeof profileFormSchema>;
  const { mutate: updateUser, isPending: isUpdatingProfile } = useUpdateUserProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
    },
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        dateOfBirth: userProfile.dateOfBirth,
      });
    }
  }, [userProfile, form]);

  const onSubmit = (data: ProfileFormValues) => {
    updateUser(data);
  };

  if (isLoadingProfile) {
    return <div>{t('profile.form.loading')}</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('profile.form.firstName')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('profile.form.firstNamePlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('profile.form.lastName')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('profile.form.lastNamePlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => {
            const dateValue = field.value
              ? (() => {
                  const parsed = parse(field.value, 'yyyy-MM-dd', new Date());
                  return isValid(parsed) ? parsed : undefined;
                })()
              : undefined;
            return (
              <FormItem>
                <FormLabel>{t('profile.form.dateOfBirth')}</FormLabel>
                <FormControl>
                  <DateInput
                    value={dateValue}
                    onChange={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                    locale={getLocaleDateFns()}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <div className="flex gap-3 pt-2">
          <LoadingButton type="submit" loading={isUpdatingProfile} loadingText={t('profile.form.saving')}>
            {t('profile.form.saveChanges')}
          </LoadingButton>
        </div>
      </form>
    </Form>
  );
};
