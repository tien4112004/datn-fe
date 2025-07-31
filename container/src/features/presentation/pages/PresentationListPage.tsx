import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@radix-ui/react-separator';
import PresentationTable from '../components/PresentationTable';

const PresentationListPage = () => {
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
        <h1 className="mb-4 text-center text-2xl font-semibold">Presentations</h1>
        <PresentationTable />
      </div>
    </>
  );
};

export default PresentationListPage;
