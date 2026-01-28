import ContextForm from '@/components/context/ContextForm';
import { useCreateContext, useContextById, useUpdateContext } from '@/hooks';
import type { Context } from '@/types/context';
import { useNavigate, useParams } from 'react-router-dom';

export function ContextFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Conditionally fetch if id exists
  const { data: contextData, isLoading } = useContextById(id || '');

  const createMutation = useCreateContext();
  const updateMutation = useUpdateContext();

  const handleSubmit = (data: Partial<Context>) => {
    if (id) {
      updateMutation.mutate({ id, data }, { onSuccess: () => navigate('/contexts') });
    } else {
      createMutation.mutate(data as any, { onSuccess: () => navigate('/contexts') });
    }
  };

  if (id && isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{id ? 'Edit Context' : 'Create New Context'}</h1>
          <p className="text-muted-foreground">Manage reading context content</p>
        </div>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <ContextForm
          initialData={contextData?.data}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/contexts')}
          isPending={createMutation.isPending || updateMutation.isPending}
        />
      </div>
    </div>
  );
}

export default ContextFormPage;
