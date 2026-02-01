import { SidebarProvider } from '@/shared/components/ui/sidebar';
import DetailPage from './PresentationDetailPage';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const StudentPresentationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const classId = searchParams.get('classId');

  const handleBackToClass = () => {
    navigate(`/student/classes/${classId}`);
  };

  return (
    <SidebarProvider open={false}>
      {classId && (
        <div className="absolute left-4 top-4 z-50">
          <button
            onClick={handleBackToClass}
            className="hover:text-primary flex items-center gap-2 rounded-lg bg-white/90 px-3 py-2 text-sm font-medium shadow-sm backdrop-blur-sm transition-colors hover:bg-white/100"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Class
          </button>
        </div>
      )}
      <DetailPage />
    </SidebarProvider>
  );
};

export default StudentPresentationPage;
