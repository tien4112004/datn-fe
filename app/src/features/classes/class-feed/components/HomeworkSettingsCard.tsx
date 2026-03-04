import { useTranslation } from 'react-i18next';
import { Settings2, Eye, Zap, RefreshCw, Hash, Trophy, Calendar } from 'lucide-react';
import { useAssignmentByPost } from '@/features/assignment';
import type { Post } from '../types';

interface HomeworkSettingsCardProps {
  post: Post;
}

const BooleanChip = ({ value, label }: { value: boolean; label: string }) => (
  <span
    className={
      value
        ? 'rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
        : 'rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400'
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
  <div className="flex items-start gap-1.5">
    <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400 dark:text-gray-500" />
    <div className="min-w-0">
      <p className="text-[11px] leading-tight text-gray-400 dark:text-gray-500">{label}</p>
      <div className="mt-0.5">{children}</div>
    </div>
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
    showScoreImmediately,
    maxSubmissions,
    passingScore,
    availableFrom,
    availableUntil,
  } = assignment;

  const hasSettings =
    allowRetake !== undefined ||
    showCorrectAnswers !== undefined ||
    showScoreImmediately !== undefined ||
    maxSubmissions !== undefined ||
    passingScore !== undefined ||
    availableFrom !== undefined ||
    availableUntil !== undefined;

  if (!hasSettings) return null;

  return (
    <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50/60 px-4 py-3 dark:border-gray-800 dark:bg-gray-900/30">
      <div className="mb-3 flex items-center gap-1.5">
        <Settings2 className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
        <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
          {t('feed.homeworkSettings.title')}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-3 lg:grid-cols-4">
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

        {showScoreImmediately !== undefined && (
          <SettingItem
            icon={Zap}
            label={t('feed.creator.assignmentSettings.displaySettings.showScoreImmediately')}
          >
            <BooleanChip
              value={showScoreImmediately}
              label={showScoreImmediately ? t('feed.homeworkSettings.yes') : t('feed.homeworkSettings.no')}
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
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{maxSubmissions}</span>
          </SettingItem>
        )}

        {passingScore !== undefined && (
          <SettingItem icon={Trophy} label={t('feed.creator.assignmentSettings.grading.passingScore')}>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{passingScore}%</span>
          </SettingItem>
        )}

        {availableFrom && (
          <SettingItem icon={Calendar} label={t('feed.creator.assignmentSettings.timing.availableFrom')}>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {formatDateTime(availableFrom)}
            </span>
          </SettingItem>
        )}

        {availableUntil && (
          <SettingItem icon={Calendar} label={t('feed.creator.assignmentSettings.timing.availableUntil')}>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {formatDateTime(availableUntil)}
            </span>
          </SettingItem>
        )}
      </div>
    </div>
  );
};
