import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog';
import { useAtRiskStudents } from '../hooks/useAtRiskStudents';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { School, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { useState } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import type { ClassAtRiskStudents } from '../api/types';
import { useTranslation } from 'react-i18next';

interface ClassesOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const getRiskConfig = (riskLevel: string) => {
  switch (riskLevel) {
    case 'CRITICAL':
      return {
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-950/30',
        badgeVariant: 'destructive' as const,
        icon: '🔴',
      };
    case 'HIGH':
      return {
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-950/30',
        badgeVariant: 'default' as const,
        icon: '🟠',
      };
    case 'MEDIUM':
      return {
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
        badgeVariant: 'secondary' as const,
        icon: '🟡',
      };
    default:
      return {
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-950/30',
        badgeVariant: 'outline' as const,
        icon: '🟢',
      };
  }
};

const ClassCard = ({ classData }: { classData: ClassAtRiskStudents }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useTranslation('dashboard');

  return (
    <Card>
      <CardContent>
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-950/30">
              <School className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold">{classData.className}</h3>
              <p className="text-muted-foreground text-sm">
                {t('classesOverview.students', { count: classData.totalStudents })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {classData.atRiskCount > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                {t('classesOverview.atRisk', { count: classData.atRiskCount })}
              </Badge>
            )}
            {isExpanded ? (
              <ChevronUp className="text-muted-foreground h-4 w-4" />
            ) : (
              <ChevronDown className="text-muted-foreground h-4 w-4" />
            )}
          </div>
        </div>

        {isExpanded && classData.atRiskStudents.length > 0 && (
          <div className="mt-4 space-y-2 border-t pt-4">
            <h4 className="text-muted-foreground text-sm font-medium">
              {t('classesOverview.atRiskStudents')}
            </h4>
            {classData.atRiskStudents.map((student) => {
              const riskConfig = getRiskConfig(student.riskLevel);
              return (
                <div
                  key={student.student.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={student.student.avatar} alt={student.student.firstName} />
                      <AvatarFallback className="text-xs">
                        {student.student.firstName[0]}
                        {student.student.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {student.student.firstName} {student.student.lastName}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {t('classesOverview.missedLate', {
                          missed: student.missedSubmissions,
                          late: student.lateSubmissions,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${riskConfig.color}`}>
                      {student.averageScore.toFixed(1)}%
                    </span>
                    <span>{riskConfig.icon}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ShimmerCard = () => (
  <Card>
    <CardContent>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-muted h-10 w-10 animate-pulse rounded-lg" />
          <div className="space-y-2">
            <div className="bg-muted h-4 w-32 animate-pulse rounded" />
            <div className="bg-muted h-3 w-24 animate-pulse rounded" />
          </div>
        </div>
        <div className="bg-muted h-6 w-20 animate-pulse rounded-full" />
      </div>
    </CardContent>
  </Card>
);

export const ClassesOverviewModal = ({ isOpen, onClose }: ClassesOverviewModalProps) => {
  const { classes, totalAtRiskCount, isLoading } = useAtRiskStudents();
  const { t } = useTranslation('dashboard');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] !max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('classesOverview.title')}</DialogTitle>
          <DialogDescription>
            {totalAtRiskCount > 0
              ? t('classesOverview.description.atRisk', { count: totalAtRiskCount })
              : t('classesOverview.description.allGood')}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-3">
            {isLoading ? (
              <>
                <ShimmerCard />
                <ShimmerCard />
                <ShimmerCard />
              </>
            ) : classes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <School className="text-muted-foreground mb-4 h-12 w-12" />
                <h3 className="text-lg font-semibold">{t('classesOverview.empty.title')}</h3>
                <p className="text-muted-foreground text-sm">{t('classesOverview.empty.description')}</p>
              </div>
            ) : (
              classes.map((classData) => <ClassCard key={classData.classId} classData={classData} />)
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
