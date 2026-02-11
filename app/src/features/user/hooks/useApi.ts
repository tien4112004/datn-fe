import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useUserProfileApiService } from '../api';
import { authKeys } from '@/features/auth/hooks/useAuth';
import type { UserProfileUpdateRequest } from '../types';

const USER_PROFILE_QUERY_KEY = ['userProfile'];

export const useUserProfile = () => {
  const userProfileApiService = useUserProfileApiService();
  return useQuery({
    queryKey: [userProfileApiService.getType(), ...USER_PROFILE_QUERY_KEY],
    queryFn: () => userProfileApiService.getCurrentUserProfile(),
  });
};

export const useUpdateUserProfile = () => {
  const userProfileApiService = useUserProfileApiService();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UserProfileUpdateRequest) => userProfileApiService.updateCurrentUserProfile(data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData([userProfileApiService.getType(), ...USER_PROFILE_QUERY_KEY], updatedProfile);
    },
  });
};

export const useUpdateUserAvatar = () => {
  const userProfileApiService = useUserProfileApiService();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (avatar: File) => userProfileApiService.updateCurrentUserAvatar(avatar),
    onSuccess: () => {
      // Invalidate user profile to refetch with new avatar URL
      queryClient.invalidateQueries({
        queryKey: [userProfileApiService.getType(), ...USER_PROFILE_QUERY_KEY],
      });
      // Also invalidate auth profile to update sidebar
      queryClient.invalidateQueries({
        queryKey: authKeys.profile,
      });
    },
  });
};

export const useRemoveUserAvatar = () => {
  const userProfileApiService = useUserProfileApiService();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => userProfileApiService.removeCurrentUserAvatar(),
    onSuccess: () => {
      // Invalidate user profile to refetch with default avatar
      queryClient.invalidateQueries({
        queryKey: [userProfileApiService.getType(), ...USER_PROFILE_QUERY_KEY],
      });
      // Also invalidate auth profile to update sidebar
      queryClient.invalidateQueries({
        queryKey: authKeys.profile,
      });
    },
  });
};
