import { useFormContext } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { useAssignmentEditorStore } from '../../stores/useAssignmentEditorStore';
import type { AssignmentFormData } from '../../types';

export const MetadataEditDialog = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<AssignmentFormData>();
  const isMetadataDialogOpen = useAssignmentEditorStore((state) => state.isMetadataDialogOpen);
  const setMetadataDialogOpen = useAssignmentEditorStore((state) => state.setMetadataDialogOpen);

  const handleClose = () => {
    setMetadataDialogOpen(false);
  };

  return (
    <Dialog open={isMetadataDialogOpen} onOpenChange={setMetadataDialogOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Assignment Details</DialogTitle>
          <DialogDescription>
            Update the assignment metadata. Changes are saved automatically when you close this dialog.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input id="title" {...register('title')} placeholder="Enter assignment title" />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">
              Subject <span className="text-red-500">*</span>
            </Label>
            <Input id="subject" {...register('subject')} placeholder="e.g., Math, English, Science" />
            {errors.subject && <p className="text-xs text-red-500">{errors.subject.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade">Grade</Label>
            <Input id="grade" {...register('grade')} placeholder="e.g., 10, 11, 12" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Optional assignment description"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
