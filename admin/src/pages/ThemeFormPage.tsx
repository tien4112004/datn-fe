import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import ThemeForm from '@/components/theme/ThemeForm';
import { toast } from 'sonner';
import type { SlideTheme } from '@/types/api';

export function ThemeFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<SlideTheme | null>({
    queryKey: ['slideTheme', id],
    queryFn: async () => {
      if (!id) return null;
      // adminApi doesn't have a getSingle method; fetch list and find id (mock-friendly)
      const resp = await adminApi.getSlideThemes({ page: 1, pageSize: 1000 });
      return (resp.data || []).find((t) => t.id === id) || null;
    },
    enabled: !!id,
  });

  const createMutation = useMutation({
    mutationFn: (data: SlideTheme) => adminApi.createSlideTheme(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slideThemes'] });
      toast.success('Theme created successfully');
      navigate('/slide-themes');
    },
    onError: () => toast.error('Failed to create theme'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SlideTheme }) => adminApi.updateSlideTheme(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slideThemes'] });
      toast.success('Theme updated successfully');
      navigate('/slide-themes');
    },
    onError: () => toast.error('Failed to update theme'),
  });

  const handleSubmit = (themeData: SlideTheme) => {
    if (id) updateMutation.mutate({ id, data: themeData });
    else createMutation.mutate(themeData);
  };

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
