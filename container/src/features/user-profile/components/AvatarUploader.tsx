import { useRef } from 'react';
import { useUserProfile, useUpdateUserAvatar, useRemoveUserAvatar } from '../hooks/useApi';
import { Button } from '@/shared/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

export const AvatarUploader = () => {
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
    <Card>
      <CardHeader>
        <CardTitle>Profile Picture</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <Avatar className="h-32 w-32">
          <AvatarImage src={userProfile?.avatarUrl ?? undefined} alt="User avatar" />
          <AvatarFallback>{getInitials(userProfile?.firstName, userProfile?.lastName)}</AvatarFallback>
        </Avatar>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/png, image/jpeg, image/gif"
        />
        <div className="flex space-x-2">
          <Button onClick={handleUploadClick} disabled={isUpdatingAvatar}>
            {isUpdatingAvatar ? 'Uploading...' : 'Upload New Picture'}
          </Button>
          <Button
            variant="destructive"
            onClick={handleRemoveClick}
            disabled={!userProfile?.avatarUrl || isRemovingAvatar}
          >
            {isRemovingAvatar ? 'Removing...' : 'Remove'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
