import { useFormContext } from 'react-hook-form';
import { FileText } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  ColoredCard,
  ColoredCardHeader,
  ColoredCardTitle,
  ColoredCardContent,
} from '@/shared/components/common/ColoredCard';
import type { AssignmentFormData } from '../../types';

export const AssignmentBasicInfo = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<AssignmentFormData>();

  return (
    <ColoredCard colorScheme="blue">
      <ColoredCardHeader>
        <ColoredCardTitle>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-blue-500 p-2 text-white">
              <FileText className="h-5 w-5" />
            </div>
            Assignment Info
          </div>
        </ColoredCardTitle>
      </ColoredCardHeader>
      <ColoredCardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold">
              Title *
            </Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Enter assignment title..."
              className="border-2 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject" className="text-sm font-semibold">
              Subject *
            </Label>
            <Input
              id="subject"
              {...register('subject')}
              placeholder="e.g., Math, Science, English"
              className="border-2 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            {errors.subject && <p className="text-sm text-red-500">{errors.subject.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold">
              Description
            </Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe the assignment..."
              rows={4}
              className="border-2 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>
      </ColoredCardContent>
    </ColoredCard>
  );
};
