import { Phone, MapPin, Calendar, Mail, User, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';
import { Badge } from '@/shared/components/ui/badge';
import { UserAvatar } from '@/shared/components/common/UserAvatar';
import type { Student } from '../types';
import { InfoRow } from './InfoRow';
import { formatDate } from '../utils/formatters';

interface StudentInfoSectionProps {
  student: Student;
}

/**
 * StudentInfoSection Component
 *
 * Design: Clean, professional information display
 * - Clear visual hierarchy with larger avatar
 * - Organized contact information grid
 * - Status badge for student status
 * - Accessible information presentation
 */
export function StudentInfoSection({ student }: StudentInfoSectionProps) {
  const { t, i18n } = useTranslation('classes');
  const fullName = student.fullName || `${student.firstName || ''} ${student.lastName || ''}`.trim();
  const enrollmentDate = formatDate(student.enrollmentDate, i18n.language);

  // Determine status variant
  const statusVariant =
    student.status === 'active' ? 'default' : student.status === 'inactive' ? 'secondary' : 'outline';

  // Get translated status
  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      active: t('studentDetail.info.status.active'),
      inactive: t('studentDetail.info.status.inactive'),
      transferred: t('studentDetail.info.status.transferred'),
      graduated: t('studentDetail.info.status.graduated'),
    };
    return statusMap[status] || status;
  };

  return (
    <Card className="overflow-hidden transition-shadow duration-200 hover:shadow-md">
      <CardHeader className="bg-muted/30">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t('studentDetail.info.title')}
          </CardTitle>
          {student.status && (
            <Badge variant={statusVariant} className="capitalize">
              {getStatusLabel(student.status)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-3">
        {/* Avatar and Name Section */}
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <UserAvatar
            src={student.avatarUrl || undefined}
            name={fullName}
            size="xl"
            className="ring-muted h-24 w-24 ring-2 ring-offset-2 transition-transform duration-200 hover:scale-105"
          />
          <div className="flex-1 space-y-1 text-center sm:text-left">
            <h2 className="text-3xl font-bold tracking-tight">{fullName}</h2>
            <p className="text-muted-foreground text-base">@{student.username}</p>
            {student.dateOfBirth && (
              <p className="text-muted-foreground text-sm">
                {t('studentDetail.info.born')}: {formatDate(student.dateOfBirth, i18n.language)}
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* Contact Information Grid */}
        <div>
          <h3 className="text-muted-foreground mb-3 text-sm font-semibold uppercase tracking-wide">
            {t('studentDetail.info.contactInformation')}
          </h3>
          <div className="grid gap-2.5 sm:grid-cols-2">
            <InfoRow
              icon={MapPin}
              label={t('studentDetail.info.fields.address')}
              value={student.address || t('studentDetail.info.notProvided')}
            />
            <InfoRow
              icon={Calendar}
              label={t('studentDetail.info.fields.enrollmentDate')}
              value={enrollmentDate}
            />
          </div>
        </div>

        <Separator />

        {/* Parent Information Grid */}
        <div>
          <h3 className="text-muted-foreground mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide">
            <Users className="h-4 w-4" />
            {t('studentDetail.info.parentInformation')}
          </h3>
          <div className="grid gap-2.5 sm:grid-cols-2">
            <InfoRow
              icon={User}
              label={t('studentDetail.info.fields.parentName')}
              value={student.parentName || t('studentDetail.info.notProvided')}
            />
            <InfoRow
              icon={Phone}
              label={t('studentDetail.info.fields.parentPhone')}
              value={student.parentPhone || t('studentDetail.info.notProvided')}
            />
            <InfoRow
              icon={Mail}
              label={t('studentDetail.info.fields.parentEmail')}
              value={student.parentContactEmail || t('studentDetail.info.notProvided')}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
