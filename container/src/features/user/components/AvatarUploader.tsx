import { useRef } from 'react';
import { useUserProfile, useUpdateUserAvatar, useRemoveUserAvatar } from '../hooks/useApi';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Upload, Trash2 } from 'lucide-react';
import LoadingButton from '@/shared/components/common/LoadingButton';
import { useTranslation } from 'react-i18next';

export const AvatarUploader = () => {
  const { t } = useTranslation('settings');
  const { data: userProfile } = useUserProfile();
  const { mutate: updateAvatar, isPending: isUpdatingAvatar } = useUpdateUserAvatar();
  const { mutate: removeAvatar, isPending: isRemovingAvatar } = useRemoveUserAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      updateAvatar(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveClick = () => {
    if (userProfile?.avatarUrl) {
      removeAvatar();
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
  };

  return (
    <Card className="border border-gray-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">
      <CardHeader className="border-b border-gray-100 pb-6">
        <CardTitle className="text-2xl font-semibold text-gray-900">{t('profile.title')}</CardTitle>
        <p className="mt-2 text-sm text-gray-500">{t('profile.subtitle')}</p>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6 p-6">
        <Avatar className="h-40 w-40 border-4 border-gray-200 shadow-sm">
          <AvatarImage src={userProfile?.avatarUrl ?? undefined} alt="User avatar" />
          <AvatarFallback className="bg-gray-100 text-2xl font-semibold text-gray-600">
            {getInitials(userProfile?.firstName, userProfile?.lastName)}
          </AvatarFallback>
        </Avatar>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/png, image/jpeg, image/gif"
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <LoadingButton
            onClick={handleUploadClick}
            loading={isUpdatingAvatar}
            loadingText={t('profile.form.uploading')}
          >
            <Upload className="mr-2 h-4 w-4" />
            {t('profile.form.uploadNewPicture')}
          </LoadingButton>
          <LoadingButton
            variant="destructive"
            onClick={handleRemoveClick}
            loading={isRemovingAvatar}
            loadingText={t('profile.form.removing')}
            disabled={!userProfile?.avatarUrl}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t('profile.form.remove')}
          </LoadingButton>
        </div>
        <p className="text-center text-xs text-gray-500">{t('profile.form.acceptedFormats')}</p>
      </CardContent>
    </Card>
  );
};
