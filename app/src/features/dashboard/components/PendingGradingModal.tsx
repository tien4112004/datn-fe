import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@ui/dialog';
import { useGradingQueue } from '../hooks/useGradingQueue';
import { Avatar, AvatarFallback, AvatarImage } from '@ui/avatar';
import { Badge } from '@ui/badge';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { ScrollArea } from '@ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface PendingGradingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShimmerItem = () => (
  <div className="flex items-start gap-4 rounded-lg border p-4">
    <div className="bg-muted h-10 w-10 animate-pulse rounded-full" />
    <div className="flex-1 space-y-2">
      <div className="bg-muted h-4 w-32 animate-pulse rounded" />
      <div className="bg-muted h-3 w-24 animate-pulse rounded" />
      <div className="bg-muted h-3 w-48 animate-pulse rounded" />
    </div>
    <div className="bg-muted h-6 w-16 animate-pulse rounded-full" />
  </div>
);

export const PendingGradingModal = ({ isOpen, onClose }: PendingGradingModalProps) => {
  const { t } = useTranslation('dashboard');
  const { queue, isLoading } = useGradingQueue();
  const navigate = useNavigate();

  const getUrgencyConfig = (daysSince: number) => {
    if (daysSince >= 3) {
      return {
        icon: AlertCircle,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-950/30',
        label: t('pendingGrading.urgency.urgent'),
        badgeVariant: 'destructive' as const,
      };
    } else if (daysSince >= 2) {
      return {
        icon: Clock,
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-950/30',
        label: t('pendingGrading.urgency.attention'),
        badgeVariant: 'default' as const,
      };
    }
    return {
      icon: CheckCircle2,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      label: t('pendingGrading.urgency.normal'),
      badgeVariant: 'secondary' as const,
    };
  };

  const handleGradeSubmission = (item: any) => {
    // Navigate to grading interface
    navigate(`/grading/${item.submissionId}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] !max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('pendingGrading.title')}</DialogTitle>
          <DialogDescription>{t('pendingGrading.description')}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-3">
            {isLoading ? (
              <>
                <ShimmerItem />
                <ShimmerItem />
                <ShimmerItem />
              </>
            ) : queue.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="mb-4 h-12 w-12 text-green-600" />
                <h3 className="text-lg font-semibold">{t('pendingGrading.empty.title')}</h3>
                <p className="text-muted-foreground text-sm">{t('pendingGrading.empty.description')}</p>
              </div>
            ) : (
              queue.map((item) => {
                const urgency = getUrgencyConfig(item.daysSinceSubmission);
                const UrgencyIcon = urgency.icon;

                return (
                  <div
                    key={item.submissionId}
                    className="hover:border-primary group cursor-pointer rounded-lg border p-4 transition-all hover:shadow-md"
                    onClick={() => handleGradeSubmission(item)}
                  >
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage src={item.student.avatar} alt={item.student.firstName} />
                        <AvatarFallback>
                          {item.student.firstName[0]}
                          {item.student.lastName[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">
                            {item.student.firstName} {item.student.lastName}
                          </h4>
                          <Badge variant={urgency.badgeVariant} className="gap-1">
                            <UrgencyIcon className="h-3 w-3" />
                            {t('pendingGrading.daysAgo', { count: item.daysSinceSubmission })}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">{item.className}</p>
                        <p className="font-medium">{item.assignmentTitle}</p>
                        {item.autoGradedScore != null && item.maxScore && (
                          <p className="text-muted-foreground text-sm">
                            {t('pendingGrading.autoGraded', {
                              score: item.autoGradedScore.toFixed(1),
                              max: item.maxScore,
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
