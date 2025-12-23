import ThemeForm from '@/components/theme/ThemeForm';
import { useCreateSlideTheme, useSlideThemes, useUpdateSlideTheme } from '@/hooks';
import type { SlideTheme } from '@aiprimary/core';
import { useNavigate, useParams } from 'react-router-dom';

export function ThemeFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // For edit mode, fetch all themes and find the one we need
  const { data: themesData, isLoading } = useSlideThemes(id ? { page: 1, pageSize: 1000 } : undefined);
  const theme = id ? themesData?.data?.find((t: SlideTheme) => t.id === id) || null : null;

  const createMutation = useCreateSlideTheme();
  const updateMutation = useUpdateSlideTheme();

  const handleSubmit = (themeData: SlideTheme) => {
    if (id) {
      updateMutation.mutate({ id, data: themeData }, { onSuccess: () => navigate('/slide-themes') });
    } else {
      createMutation.mutate(themeData, { onSuccess: () => navigate('/slide-themes') });
    }
  };

  const data = theme;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{id ? 'Edit Theme' : 'Create New Theme'}</h1>
          <p className="text-muted-foreground">Configure a slide theme</p>
        </div>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <ThemeForm
          initialTheme={data || null}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/slide-themes')}
          isPending={createMutation.isPending || updateMutation.isPending || isLoading}
        />
      </div>
    </div>
  );
}

export default ThemeFormPage;
