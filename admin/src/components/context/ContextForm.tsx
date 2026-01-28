import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { Context } from '@/types/context';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  grade: z.string().optional(),
  author: z.string().optional(),
});

interface ContextFormProps {
  initialData?: Context | null;
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  onCancel: () => void;
  isPending?: boolean;
}

export function ContextForm({ initialData, onSubmit, onCancel, isPending }: ContextFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || '',
      grade: initialData?.grade || '',
      author: initialData?.author || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Content / Title</Label>
        <Textarea
          id="title"
          placeholder="Enter context content..."
          className={cn('min-h-[200px]', errors.title && 'border-red-500')}
          {...register('title')}
        />
        {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
      </div>

      <div className="flex gap-4">
        <div className="flex-1 space-y-2">
          <Label htmlFor="grade">Grade</Label>
          <Input id="grade" placeholder="e.g. 10" {...register('grade')} />
        </div>
        <div className="flex-1 space-y-2">
          <Label htmlFor="author">Author</Label>
          <Input id="author" placeholder="Author name" {...register('author')} />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
}

export default ContextForm;
