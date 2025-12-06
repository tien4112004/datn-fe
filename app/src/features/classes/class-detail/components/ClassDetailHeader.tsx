import { useTranslation } from 'react-i18next';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@radix-ui/react-separator';
import { Badge } from '@/components/ui/badge';
import { getGradeLabel } from '../../shared/utils/grades';
import type { Class } from '../../shared/types';

interface ClassDetailHeaderProps {
  currentClass: Class;
}

export const ClassDetailHeader = ({ currentClass }: ClassDetailHeaderProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'detail' });
  const { t: tPage } = useTranslation('common', { keyPrefix: 'pages' });

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/classes">{tPage('classes')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{currentClass.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="space-y-6 px-8 py-6">
        {/* Class Header */}
        <div className="rounded-lg border bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 space-y-3">
              {/* Title and Status */}
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl font-bold tracking-tight">{currentClass.name}</h1>
                <Badge variant={currentClass.isActive ? 'default' : 'secondary'} className="px-3 py-1">
                  {currentClass.isActive ? t('status.active') : t('status.inactive')}
                </Badge>
              </div>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-1 w-1 rounded-full bg-slate-300"></span>
                  <span className="text-sm font-medium text-slate-700">
                    {getGradeLabel(currentClass.grade)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-1 w-1 rounded-full bg-slate-300"></span>
                  <span className="text-sm text-slate-600">
                    {t('academicYear')}: <span className="font-medium">{currentClass.academicYear}</span>
                  </span>
                </div>
                {currentClass.classroom && (
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block h-1 w-1 rounded-full bg-slate-300"></span>
                    <span className="text-sm text-slate-600">
                      {t('classroom')}: <span className="font-medium">{currentClass.classroom}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              {currentClass.description && (
                <p className="max-w-2xl pt-2 text-sm leading-relaxed text-slate-600">
                  {currentClass.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
