import { SidebarProvider } from '@/shared/components/ui/sidebar';
import MindmapPage from './MindmapPage';

const StudentMindmapPage = () => {
  return (
    <SidebarProvider defaultOpen={false}>
      <MindmapPage isStudent={true} />
    </SidebarProvider>
  );
};

export default StudentMindmapPage;
