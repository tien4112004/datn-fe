import { useTranslation } from 'react-i18next';
import { Settings2, Eye, RefreshCw, Hash, Trophy, Calendar, Bot } from 'lucide-react';
import { useAssignmentByPost } from '@/features/assignment';
import type { Post } from '../types';

interface HomeworkSettingsCardProps {
  post: Post;
}

const BooleanChip = ({ value, label }: { value: boolean; label: string }) => (
  <span
    className={
      value
        ? 'bg-muted rounded-full px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400'
        : 'bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium'
    }
  >
    {label}
  </span>
);

const SettingItem = ({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-center gap-2">
    <Icon className="text-muted-foreground h-4 w-4 shrink-0" />
    <span className="text-muted-foreground text-sm">{label}</span>
    <span className="text-sm font-medium">{children}</span>
  </div>
);

const formatDateTime = (dateStr: string) =>
  new Date(dateStr).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export const HomeworkSettingsCard = ({ post }: HomeworkSettingsCardProps) => {
  const { t } = useTranslation('classes');
  const { data: assignment } = useAssignmentByPost(post.assignmentId ? post.id : undefined);

  if (!assignment) return null;

  const {
    allowRetake,
    showCorrectAnswers,
    maxSubmissions,
    passingScore,
    availableFrom,
    availableUntil,
    autoGraded,
  } = assignment;

  const hasSettings =
    allowRetake !== undefined ||
    showCorrectAnswers !== undefined ||
    maxSubmissions !== undefined ||
    passingScore !== undefined ||
    availableFrom !== undefined ||
    availableUntil !== undefined ||
    autoGraded !== undefined;

  if (!hasSettings) return null;

  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center gap-2">
        <Settings2 className="text-muted-foreground h-5 w-5" />
        <h3 className="text-lg font-semibold">{t('feed.homeworkSettings.title')}</h3>
      </div>

      <div className="space-y-2">
        {autoGraded !== undefined && (
          <SettingItem icon={Bot} label={t('feed.creator.assignmentSettings.grading.autoGraded')}>
            <BooleanChip
              value={autoGraded}
              label={autoGraded ? t('feed.homeworkSettings.yes') : t('feed.homeworkSettings.no')}
            />
          </SettingItem>
        )}

        {showCorrectAnswers !== undefined && (
          <SettingItem
            icon={Eye}
            label={t('feed.creator.assignmentSettings.displaySettings.showCorrectAnswers')}
          >
            <BooleanChip
              value={showCorrectAnswers}
              label={showCorrectAnswers ? t('feed.homeworkSettings.yes') : t('feed.homeworkSettings.no')}
            />
          </SettingItem>
        )}

        {allowRetake !== undefined && (
          <SettingItem
            icon={RefreshCw}
            label={t('feed.creator.assignmentSettings.submissionSettings.allowRetakes')}
          >
            <BooleanChip
              value={allowRetake}
              label={allowRetake ? t('feed.homeworkSettings.yes') : t('feed.homeworkSettings.no')}
            />
          </SettingItem>
        )}

        {maxSubmissions !== undefined && (
          <SettingItem
            icon={Hash}
            label={t('feed.creator.assignmentSettings.submissionSettings.maxSubmissions')}
          >
            {maxSubmissions}
          </SettingItem>
        )}

        {passingScore !== undefined && (
          <SettingItem icon={Trophy} label={t('feed.creator.assignmentSettings.grading.passingScore')}>
            {passingScore}%
          </SettingItem>
        )}

        {availableFrom && (
          <SettingItem icon={Calendar} label={t('feed.creator.assignmentSettings.timing.availableFrom')}>
            {formatDateTime(availableFrom)}
          </SettingItem>
        )}

        {availableUntil && (
          <SettingItem icon={Calendar} label={t('feed.creator.assignmentSettings.timing.availableUntil')}>
            {formatDateTime(availableUntil)}
          </SettingItem>
        )}
      </div>
    </div>
  );
};
