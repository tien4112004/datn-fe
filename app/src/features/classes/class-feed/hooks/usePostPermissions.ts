import { useMemo } from 'react';
import type { Post } from '../types';
import { useAuth } from '@/context/auth';

export const usePostPermissions = (post?: Post) => {
  const { user } = useAuth();

  const isTeacher = useMemo(() => {
    return true;
    return user?.role === 'teacher';
  }, [user?.role]);

  const canComment = useMemo(() => {
    return true; // All users can comment
  }, []);

  return {
    canEdit: isTeacher,
    canDelete: isTeacher,
    canPin: isTeacher,
    canComment,
    isAuthor: post?.authorId === user?.id,
    isTeacher,
  };
};
