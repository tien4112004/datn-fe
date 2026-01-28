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
  content: z.string().min(1, 'Content is required'),
  grade: z.coerce.number().optional(),
  subject: z.string().optional(),
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
      content: initialData?.content || '',
      grade: initialData?.grade || undefined,
      subject: initialData?.subject || '',
      author: initialData?.author || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Enter context title..."
          className={errors.title && 'border-red-500'}
          {...register('title')}
        />
        {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          placeholder="Enter context content..."
          className={cn('min-h-[200px]', errors.content && 'border-red-500')}
          {...register('content')}
        />
        {errors.content && <p className="text-sm text-red-500">{errors.content.message}</p>}
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
