import { SidebarProvider } from '@/shared/components/ui/sidebar';
import MindmapPage from './MindmapPage';

const StudentMindmapPage = () => {
  return (
    <SidebarProvider defaultOpen={false}>
      <MindmapPage />
    </SidebarProvider>
  );
};

export default StudentMindmapPage;
