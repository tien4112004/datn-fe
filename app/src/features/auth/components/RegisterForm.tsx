import { useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Button } from '@ui/button';
import { Input } from '@ui/input';
import { PasswordInput } from '@ui/password-input';
import { DateInput } from '@ui/date-input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@ui/form';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { useRegister } from '../hooks/useAuth';
import { GoogleSignInButton } from './GoogleSignInButton';

export function RegisterForm() {
  const { t, i18n } = useTranslation(I18N_NAMESPACES.AUTH);
  const registerMutation = useRegister();

  // Validation schema that updates when language changes
  const registerSchema = useMemo(
    () =>
      z
        .object({
          email: z.string().email(t('validation.emailInvalid')),
          password: z.string().min(6, t('validation.passwordMinLength', { min: 6 })),
          confirmPassword: z.string(),
          firstName: z
            .string()
            .min(1, t('validation.firstNameRequired'))
            .max(50, t('validation.firstNameMaxLength', { max: 50 }))
            .regex(/^[a-zA-Z\s]+$/, t('validation.nameAlphabetOnly')),
          lastName: z
            .string()
            .min(1, t('validation.lastNameRequired'))
            .max(50, t('validation.lastNameMaxLength', { max: 50 }))
            .regex(/^[a-zA-Z\s]+$/, t('validation.nameAlphabetOnly')),
          dateOfBirth: z.date({
            required_error: t('validation.dateOfBirthRequired'),
            invalid_type_error: t('validation.dateOfBirthInvalid'),
          }),
          phoneNumber: z
            .string()
            .optional()
            .refine(
              (val) => !val || /^(\+[1-9]\d{7,14}|0\d{7,14})$/.test(val),
              t('validation.phoneNumberInvalid')
            ),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: t('validation.passwordsNoMatch'),
          path: ['confirmPassword'],
        }),
    [t]
  );

  type RegisterFormInput = z.input<typeof registerSchema>;
  type RegisterFormOutput = z.output<typeof registerSchema>;

  const form = useForm<RegisterFormInput, unknown, RegisterFormOutput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      dateOfBirth: undefined,
      phoneNumber: '',
    },
  });

  useEffect(() => {
    form.clearErrors();
  }, [i18n.language, form]);

  const onSubmit = async (data: RegisterFormOutput) => {
    registerMutation.mutate(
      {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: format(data.dateOfBirth, 'yyyy-MM-dd'),
        phoneNumber: data.phoneNumber || undefined,
      },
      {
        onSuccess: () => {
          toast.success(t('register.accountCreated'));
        },
      }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('register.firstName')} <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder={t('register.firstNamePlaceholder')}
                    autoComplete="given-name"
                    disabled={registerMutation.isPending}
                    {...field}
                  />
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
                <FormLabel>
                  {t('register.lastName')} <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder={t('register.lastNamePlaceholder')}
                    autoComplete="family-name"
                    disabled={registerMutation.isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('register.email')} <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={t('register.emailPlaceholder')}
                  autoComplete="email"
                  disabled={registerMutation.isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>
                {t('register.dateOfBirth')} <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <DateInput
                  value={field.value}
                  onChange={field.onChange}
                  disabled={registerMutation.isPending}
                  fromYear={1900}
                  toYear={new Date().getFullYear()}
                  minDate={new Date('1900-01-01')}
                  maxDate={new Date()}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('register.phoneNumber')}</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder={t('register.phoneNumberPlaceholder')}
                  autoComplete="tel"
                  disabled={registerMutation.isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('register.password')} <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder={t('register.passwordPlaceholder')}
                  autoComplete="new-password"
                  disabled={registerMutation.isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('register.confirmPassword')} <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder={t('register.confirmPasswordPlaceholder')}
                  autoComplete="new-password"
                  disabled={registerMutation.isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
          {registerMutation.isPending ? t('register.creatingAccount') : t('register.createAccountButton')}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background text-muted-foreground px-2">{t('register.orContinueWith')}</span>
          </div>
        </div>

        <GoogleSignInButton disabled={registerMutation.isPending} />
      </form>
    </Form>
  );
}
