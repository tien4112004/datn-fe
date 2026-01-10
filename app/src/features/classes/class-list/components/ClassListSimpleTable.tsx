import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useClasses } from '../../shared/hooks';
import { useClassStore } from '../../shared/stores';

export const ClassListSimpleTable = () => {
  const filters = useClassStore((state) => state.filters);
  const { data: classes, isLoading } = useClasses(filters);

  // Show only first 4 classes for dashboard
  const displayClasses = classes.slice(0, 4);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow className="border-b">
            <TableHead className="text-muted-foreground text-sm font-medium">Class Name</TableHead>
            <TableHead className="text-muted-foreground text-sm font-medium">Status</TableHead>
            <TableHead className="text-muted-foreground text-sm font-medium">Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayClasses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-muted-foreground py-8 text-center">
                No classes found
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
                    {classItem.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground py-4">
                  {new Date(classItem.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
