import { UserProfileForm } from '../components/UserProfileForm';
import { AvatarUploader } from '../components/AvatarUploader';
import { useUserProfile } from '../hooks/useApi';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Terminal } from 'lucide-react';

const UserProfilePage = () => {
  const { isLoading, isError, error } = useUserProfile();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div>Loading user profile...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load user profile: {error?.message || 'Unknown error'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <AvatarUploader />
        </div>
        <div className="md:col-span-2">
          <UserProfileForm />
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
