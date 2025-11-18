import { useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { PasswordInput } from '@/shared/components/ui/password-input';
import { DateInput } from '@/shared/components/ui/date-input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { useRegister } from '../hooks/useAuth';

export function RegisterForm() {
  const { t, i18n } = useTranslation(I18N_NAMESPACES.AUTH);
  const registerMutation = useRegister();

  // Validation schema that updates when language changes
  const registerSchema = useMemo(
    () =>
      z
        .object({
          email: z.string().email(t('validation.emailInvalid')),
          password: z
            .string()
            // .regex(/[A-Z]/, t('validation.passwordUppercase'))
            // .regex(/[a-z]/, t('validation.passwordLowercase'))
            // .regex(/[0-9]/, t('validation.passwordNumber'))
            .min(6, t('validation.passwordMinLength', { min: 6 })),
          confirmPassword: z.string(),
          firstName: z
            .string()
            .min(1, t('validation.firstNameRequired'))
            .max(50, t('validation.firstNameMaxLength', { max: 50 })),
          lastName: z
            .string()
            .min(1, t('validation.lastNameRequired'))
            .max(50, t('validation.lastNameMaxLength', { max: 50 })),
          dateOfBirth: z
            .date({
              required_error: t('validation.dateOfBirthRequired'),
              invalid_type_error: t('validation.dateOfBirthInvalid'),
            })
            // .refine((date) => {
            //   const today = new Date();
            //   const age = today.getFullYear() - date.getFullYear();
            //   const monthDiff = today.getMonth() - date.getMonth();
            //   const adjustedAge =
            //     monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate()) ? age - 1 : age;
            //   return adjustedAge >= 13 && adjustedAge <= 120;
            // }, t('validation.ageRequirement'))
            .optional(),
          phoneNumber: z.string().optional(),
          // .refine((val) => !val || /^\+?[1-9]\d{1,14}$/.test(val), t('validation.phoneNumberInvalid')),
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

  // Update validation schema when language changes
  useEffect(() => {
    form.clearErrors();
  }, [i18n.language, form]);

  const onSubmit = async (data: RegisterFormOutput) => {
    if (!data.dateOfBirth) return;

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
                <FormLabel>{t('register.firstName')}</FormLabel>
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
                <FormLabel>{t('register.lastName')}</FormLabel>
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
              <FormLabel>{t('register.email')}</FormLabel>
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
              <FormLabel>{t('register.dateOfBirth')}</FormLabel>
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
              <FormLabel>{t('register.password')}</FormLabel>
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
              <FormLabel>{t('register.confirmPassword')}</FormLabel>
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

        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={registerMutation.isPending}
          onClick={() => toast.info(t('register.googleComingSoon'))}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {t('register.signUpWithGoogle')}
        </Button>
      </form>
    </Form>
  );
}
