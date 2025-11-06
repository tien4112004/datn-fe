import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import userProfileService from '../api';
import type { UserProfileUpdateRequest } from '../types';

const USER_PROFILE_QUERY_KEY = ['userProfile'];

export const useUserProfile = () => {
  return useQuery({
    queryKey: USER_PROFILE_QUERY_KEY,
    queryFn: () => userProfileService.getCurrentUserProfile(),
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UserProfileUpdateRequest) => userProfileService.updateCurrentUserProfile(data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(USER_PROFILE_QUERY_KEY, updatedProfile);
    },
  });
};

export const useUpdateUserAvatar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (avatar: File) => userProfileService.updateCurrentUserAvatar(avatar),
    onSuccess: () => {
      // Invalidate user profile to refetch with new avatar URL
      queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEY });
    },
  });
};

export const useRemoveUserAvatar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => userProfileService.removeCurrentUserAvatar(),
    onSuccess: () => {
      // Invalidate user profile to refetch with default avatar
      queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEY });
    },
  });
};
