import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Presentation, Video, Image, FileText, Brain } from 'lucide-react';
import { Card, CardContent, CardTitle } from '@/shared/components/ui/card';

export interface ResourceTypeSwitcherProps {
  className?: string;
}

const ResourceTypeSwitcher = ({ className }: ResourceTypeSwitcherProps) => {
  const { t } = useTranslation('projects');
  const navigate = useNavigate();
  const location = useLocation();

  const resources = [
    { type: 'presentation', label: t('resources.presentation'), icon: Presentation },
    { type: 'video', label: t('resources.video'), icon: Video },
    { type: 'image', label: t('resources.image'), icon: Image },
    { type: 'document', label: t('resources.document'), icon: FileText },
    { type: 'mindmap', label: t('resources.mindmap'), icon: Brain },
  ];

  const getActiveResourceType = () => {
    const pathname = location.pathname;
    return resources.find((resource) => pathname.startsWith(`/${resource.type}`))?.type;
  };

  const activeResourceType = getActiveResourceType();

  return (
    <div className={`flex w-full flex-wrap justify-center gap-3 ${className || ''}`}>
      {resources.map((resource) => {
        const IconComponent = resource.icon;
        const isActive = activeResourceType === resource.type;

        return (
          <Card
            key={resource.type}
            className={`group cursor-pointer rounded-md border-2 py-0 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${
              isActive ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => navigate(`/${resource.type}/create`)}
          >
            <CardContent className="flex min-w-[120px] flex-col items-center justify-center gap-1 px-4 py-2">
              <IconComponent
                className={`h-4 w-4 transition-colors ${
                  isActive ? 'text-blue-700' : 'text-blue-600 group-hover:text-blue-700'
                }`}
              />
              <CardTitle
                className={`text-center text-sm font-medium transition-colors ${
                  isActive ? 'text-blue-900' : 'text-gray-700 group-hover:text-gray-900'
                }`}
              >
                {resource.label}
              </CardTitle>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ResourceTypeSwitcher;
