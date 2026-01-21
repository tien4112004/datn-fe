import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useClasses } from '@/features/classes/shared/hooks';
import { useClassStore } from '@/features/classes/shared/stores';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { getLocaleDateFns } from '@/shared/i18n/helper';

export const ClassListSimpleTable = () => {
  const { t } = useTranslation('dashboard');
  const filters = useClassStore((state) => state.filters);
  const { data: classes, isLoading } = useClasses(filters);

  // Show only first 4 classes for dashboard
  const displayClasses = classes.slice(0, 4);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">{t('myClasses.loading')}</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow className="border-b">
            <TableHead className="text-muted-foreground text-sm font-medium">
              {t('myClasses.table.columns.className')}
            </TableHead>
            <TableHead className="text-muted-foreground text-sm font-medium">
              {t('myClasses.table.columns.status')}
            </TableHead>
            <TableHead className="text-muted-foreground text-sm font-medium">
              {t('myClasses.table.columns.createdAt')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayClasses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-muted-foreground py-8 text-center">
                {t('myClasses.table.empty')}
              </TableCell>
            </TableRow>
          ) : (
            displayClasses.map((classItem) => (
              <TableRow key={classItem.id} className="hover:bg-muted/50 border-b">
                <TableCell className="py-4">
                  <Link to={`/classes/${classItem.id}`} className="font-medium hover:underline">
                    {classItem.name}
                  </Link>
                </TableCell>
                <TableCell className="py-4">
                  <Badge variant={classItem.isActive ? 'default' : 'secondary'}>
                    {classItem.isActive
                      ? t('myClasses.table.status.active')
                      : t('myClasses.table.status.inactive')}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground py-4">
                  {format(new Date(classItem.createdAt), 'PPP', { locale: getLocaleDateFns() })}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
