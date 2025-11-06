import { UserProfileForm } from './UserProfileForm';
import { AvatarUploader } from './AvatarUploader';
import { useUserProfile } from '../hooks/useApi';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Terminal } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const UserProfile = () => {
  const { t } = useTranslation('settings');
  const { isLoading, isError, error } = useUserProfile();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center py-8">
        <div>{t('profile.form.loading')}</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-4">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>{t('profile.form.error.title')}</AlertTitle>
          <AlertDescription>
            {t('profile.form.error.loadFailed', { message: error?.message || 'Unknown error' })}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <AvatarUploader />
        </div>
        <div className="lg:col-span-2">
          <UserProfileForm />
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
