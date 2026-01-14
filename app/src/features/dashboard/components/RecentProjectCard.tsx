import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Image, Presentation, Brain, FileText } from 'lucide-react';
import type { RecentProject } from '../types';

interface RecentProjectCardProps {
  project: RecentProject;
}

const projectTypeConfig = {
  image: { icon: Image, variant: 'default' as const, label: 'Image' },
  presentation: { icon: Presentation, variant: 'secondary' as const, label: 'Presentation' },
  mindmap: { icon: Brain, variant: 'outline' as const, label: 'Mindmap' },
  document: { icon: FileText, variant: 'outline' as const, label: 'Document' },
};

const RecentProjectCard = ({ project }: RecentProjectCardProps) => {
  const navigate = useNavigate();
  const config = projectTypeConfig[project.type];
  const Icon = config.icon;

  return (
    <Card
      className="group cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => navigate(project.route)}
    >
      <CardContent className="flex items-center gap-4 p-4">
        {/* Thumbnail or placeholder */}
        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded bg-gray-100">
          {project.thumbnail ? (
            <img src={project.thumbnail} alt={project.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <Icon className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Project info */}
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-medium group-hover:text-blue-600">{project.title}</h3>
            <Badge variant={config.variant} className="shrink-0">
              {config.label}
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs">{project.timestamp}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentProjectCard;
