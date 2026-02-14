import { Phone, MapPin, Calendar, Mail, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/components/ui/avatar';
import { Separator } from '@/shared/components/ui/separator';
import { Badge } from '@/shared/components/ui/badge';
import type { Student } from '../types';
import { InfoRow } from './InfoRow';
import { getInitials, formatDate } from '../utils/formatters';

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
  const { t } = useTranslation('classes');
  const initials = getInitials(student.firstName, student.lastName);
  const fullName = student.fullName || `${student.firstName || ''} ${student.lastName || ''}`.trim();
  const enrollmentDate = formatDate(student.enrollmentDate);

  // Determine status variant
  const statusVariant =
    student.status === 'active'
      ? 'default'
      : student.status === 'inactive'
        ? 'secondary'
        : 'outline';

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
      <CardContent className="space-y-6 pt-6">
        {/* Avatar and Name Section */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Avatar className="h-24 w-24 ring-2 ring-muted ring-offset-2 transition-transform duration-200 hover:scale-105">
            <AvatarImage
              src={student.avatarUrl || undefined}
              alt={`${fullName}'s profile picture`}
            />
            <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-blue-500 to-purple-500 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center sm:text-left space-y-1">
            <h2 className="text-3xl font-bold tracking-tight">{fullName}</h2>
            <p className="text-base text-muted-foreground">@{student.username}</p>
            {student.dateOfBirth && (
              <p className="text-sm text-muted-foreground">
                {t('studentDetail.info.born')}: {formatDate(student.dateOfBirth)}
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* Contact Information Grid */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">
            {t('studentDetail.info.contactInformation')}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            <InfoRow
              icon={Phone}
              label={t('studentDetail.info.fields.phone')}
              value={student.phoneNumber || t('studentDetail.info.notProvided')}
            />
            <InfoRow
              icon={Mail}
              label={t('studentDetail.info.fields.parentEmail')}
              value={student.parentContactEmail || t('studentDetail.info.notProvided')}
            />
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
      </CardContent>
    </Card>
  );
}
