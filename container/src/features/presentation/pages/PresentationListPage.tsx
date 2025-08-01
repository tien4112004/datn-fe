import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@radix-ui/react-separator';
import PresentationTable from '../components/PresentationTable';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const PresentationListPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbPage>Presentations</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div className="px-8 py-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="mb-4 text-center text-2xl font-semibold">Presentations</h1>
          <div className="space-x-2">
            <Button variant={'secondary'} className="mb-4" onClick={() => navigate('/presentation/create')}>
              Create New Presentation
            </Button>
            <Button variant={'secondary'} className="mb-4" onClick={() => navigate('/presentation/editor')}>
              View Editor
            </Button>
          </div>
        </div>
        <PresentationTable />
      </div>
    </>
  );
};

export default PresentationListPage;
