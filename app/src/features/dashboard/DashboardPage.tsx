import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ClassListSimpleTable } from '../classes/class-list/components/ClassListSimpleTable';
import { DashboardCalendar } from '../classes/class-list/components/DashboardCalendar';
import { RecentDocuments } from '../classes/class-list/components/RecentDocuments';

export const DashboardPage = () => {
  return (
    <div className="flex h-screen flex-col">
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Main Content */}
        <div className="flex-1 space-y-8 overflow-y-auto p-8">
          {/* My Classes Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-semibold">My Classes</h1>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Class
              </Button>
            </div>
            <ClassListSimpleTable />
          </div>

          {/* Recent Documents Section */}
          <RecentDocuments />
        </div>

        {/* Right Sidebar */}
        <div className="bg-muted/10 w-[380px] space-y-6 overflow-y-auto border-l p-6">
          <DashboardCalendar />
        </div>
      </div>
    </div>
  );
};
