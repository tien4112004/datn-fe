import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@ui/skeleton';
import { PageHeader } from '@/features/students/components/PageHeader';
import { usePost, useDeletePost, usePinPost } from '../hooks/useApi';
import { PostCard } from '../components/PostCard';
import { CommentThread } from '../components/CommentThread';
import { HomeworkSettingsCard } from '../components/HomeworkSettingsCard';
import { SubmissionStatistics } from '../components/SubmissionStatistics';
import { StudentAssignmentActions } from '../components/StudentAssignmentActions';
import { usePostPermissions } from '../hooks/usePostPermissions';
import { useState } from 'react';

export const PostDetailPage = () => {
  const { postId, id: classId } = useParams<{ postId: string; id: string }>();
  const { t } = useTranslation('classes');
  const navigate = useNavigate();
  const { post, loading, error, refetch } = usePost(postId!);
  const deletePost = useDeletePost();
  const pinPost = usePinPost();
  const { isTeacher } = usePostPermissions(post);
  const [showComments, setShowComments] = useState(true);

  const handleBack = () => {
    if (classId) {
      navigate(`/classes/${classId}?tab=feed`);
    } else {
      navigate(-1);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePost.mutateAsync(postId!);
      handleBack();
    } catch (_err) {
      // Error is handled by the hook
    }
  };

  const handlePin = async (pinned: boolean) => {
    try {
      await pinPost.mutateAsync({ postId: postId!, pinned });
      refetch();
    } catch {
      // Error is handled by the hook
    }
  };

  const handleEdit = () => {
    // TODO: Implement edit functionality
    console.log('Edit post:', postId);
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <PageHeader title={t('errors.general')} onBack={handleBack} />
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">{t('feed.errors.loadFailed')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <PageHeader title={t('feed.list.empty.all.title')} onBack={handleBack} />
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">{t('feed.list.empty.all.description')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Page Header */}
      <PageHeader
        title={post.type === 'Exercise' ? t('feed.header.filters.homework') : t('feed.header.filters.posts')}
        onBack={handleBack}
      />

      {/* Post Content */}
      <PostCard
        post={post}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPin={handlePin}
        onComment={() => setShowComments(true)}
      />

      {/* Homework Settings (Exercise posts only) */}
      {post.type === 'Exercise' && <HomeworkSettingsCard post={post} />}

      {/* Student Assignment Actions (Students only, Exercise posts only) */}
      {!isTeacher && post.type === 'Exercise' && post.assignmentId && (
        <StudentAssignmentActions postId={postId!} assignmentId={post.assignmentId} />
      )}

      {/* Submission Statistics (Teachers only, Exercise posts only) */}
      {isTeacher && post.type === 'Exercise' && post.assignmentId && (
        <SubmissionStatistics postId={postId!} assignmentId={post.assignmentId} />
      )}

      {/* Comments Section */}
      {showComments && post.allowComments && (
        <div className="mt-6">
          <h3 className="mb-4 text-lg font-semibold">{t('feed.comments.title')}</h3>
          <CommentThread postId={postId!} classId={classId || post.classId} />
        </div>
      )}
    </div>
  );
};
