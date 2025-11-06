import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUserProfile, useUpdateUserProfile } from '../hooks/useApi';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LoadingButton from '@/shared/components/common/LoadingButton';

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
    <Card className="border border-gray-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">
      <CardHeader className="border-b border-gray-100 pb-6">
        <CardTitle className="text-2xl font-semibold text-gray-900">{t('profile.form.title')}</CardTitle>
        <p className="mt-2 text-sm text-gray-500">{t('profile.form.subtitle')}</p>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      {t('profile.form.firstName')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('profile.form.firstNamePlaceholder')}
                        {...field}
                        className="border-border transition-colors duration-200 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-0"
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      {t('profile.form.lastName')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('profile.form.lastNamePlaceholder')}
                        {...field}
                        className="border-border"
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    {t('profile.form.dateOfBirth')}
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} className="border-border" />
                  </FormControl>
                  <FormMessage className="text-xs text-red-600" />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3 border-t border-gray-100 pt-6">
              <LoadingButton
                type="submit"
                loading={isUpdatingProfile}
                loadingText={t('profile.form.saving')}
                className="px-6 py-2 font-medium"
              >
                {t('profile.form.saveChanges')}
              </LoadingButton>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
