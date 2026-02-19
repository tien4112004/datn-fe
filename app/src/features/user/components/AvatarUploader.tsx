import { useRef } from 'react';
import { useUserProfile, useUpdateUserAvatar, useRemoveUserAvatar } from '../hooks/useApi';
import { UserAvatar } from '@/shared/components/common/UserAvatar';
import { Card, CardContent, CardHeader, CardTitle } from '@ui/card';
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

  return (
    <Card className="border border-gray-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">
      <CardHeader className="border-b border-gray-100 pb-6">
        <CardTitle className="text-2xl font-semibold text-gray-900">{t('profile.title')}</CardTitle>
        <p className="mt-2 text-sm text-gray-500">{t('profile.subtitle')}</p>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6 p-6">
        <UserAvatar
          src={userProfile?.avatarUrl ?? undefined}
          name={`${userProfile?.firstName ?? ''} ${userProfile?.lastName ?? ''}`.trim()}
          size="xl"
          className="h-40 w-40 border-4 border-gray-200 shadow-sm"
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/png, image/jpeg, image/gif"
        />
        <div className="flex flex-row gap-3">
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
