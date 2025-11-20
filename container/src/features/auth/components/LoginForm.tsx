import { useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { PasswordInput } from '@/shared/components/ui/password-input';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { useLogin } from '../hooks/useAuth';
import { GoogleSignInButton } from './GoogleSignInButton';

export function LoginForm() {
  const { t, i18n } = useTranslation(I18N_NAMESPACES.AUTH);
  const loginMutation = useLogin();

  const loginSchema = useMemo(
    () =>
      z.object({
        email: z.string().email(t('validation.emailInvalid')),
        password: z.string(),
        rememberMe: z.boolean().default(false),
      }),
    [t]
  );

  type LoginFormInput = z.input<typeof loginSchema>;
  type LoginFormOutput = z.output<typeof loginSchema>;

  const form = useForm<LoginFormInput, unknown, LoginFormOutput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // Update validation schema when language changes
  useEffect(() => {
    form.clearErrors();
  }, [i18n.language, form]);

  const onSubmit = async (data: LoginFormOutput) => {
    loginMutation.mutate(
      { email: data.email, password: data.password },
      {
        onSuccess: (user) => {
          toast.success(t('login.welcomeBack', { name: user.firstName || user.email }));
        },
      }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('login.email')}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={t('login.emailPlaceholder')}
                  autoComplete="email"
                  disabled={loginMutation.isPending}
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
              <FormLabel>{t('login.password')}</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder={t('login.passwordPlaceholder')}
                  autoComplete="current-password"
                  disabled={loginMutation.isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between">
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={loginMutation.isPending}
                  />
                </FormControl>
                <FormLabel className="cursor-pointer text-sm font-normal">{t('login.rememberMe')}</FormLabel>
              </FormItem>
            )}
          />
          <Link to="/forgot-password" className="text-primary text-sm hover:underline" tabIndex={-1}>
            {t('login.forgotPassword')}
          </Link>
        </div>

        <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? t('login.signingIn') : t('login.signInButton')}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background text-muted-foreground px-2">{t('login.orContinueWith')}</span>
          </div>
        </div>

        <GoogleSignInButton disabled={loginMutation.isPending} />
      </form>
    </Form>
  );
}
