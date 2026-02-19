import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@ui/dialog';
import { Button } from '@ui/button';
import { Input } from '@ui/input';
import { Label } from '@ui/label';
import { Checkbox } from '@ui/checkbox';
import { Badge } from '@ui/badge';
import { Trash2 } from 'lucide-react';
import { useQuestionBankChapters } from '@/hooks';
import type { AssignmentTopic } from '@aiprimary/core';

interface TopicEditModalProps {
  topic: AssignmentTopic | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (topicId: string, updates: { name: string; chapters?: string[] }) => void;
  onDelete: (topicId: string) => void;
  subject?: string;
  grade?: string;
}

export const TopicEditModal = ({
  topic,
  open,
  onOpenChange,
  onSave,
  onDelete,
  subject,
  grade,
}: TopicEditModalProps) => {
  const [name, setName] = useState(topic?.name || '');
  const [chapters, setChapters] = useState<string[]>(topic?.chapters || []);

  const { data: chaptersData, isLoading: chaptersLoading } = useQuestionBankChapters(
    subject || undefined,
    grade || undefined
  );
  const availableChapters = chaptersData?.data || [];

  // Sync local state when topic changes
  useEffect(() => {
    if (topic) {
      setName(topic.name);
      setChapters(topic.chapters || []);
    }
  }, [topic]);

  const handleSave = () => {
    if (topic) {
      onSave(topic.id, {
        name,
        chapters: chapters.length > 0 ? chapters : undefined,
      });
      onOpenChange(false);
    }
  };

  const handleDelete = () => {
    if (topic) {
      onDelete(topic.id);
      onOpenChange(false);
    }
  };

  const handleChapterToggle = (chapterName: string, checked: boolean) => {
    setChapters((prev) => (checked ? [...prev, chapterName] : prev.filter((c) => c !== chapterName)));
  };

  if (!topic) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Topic</DialogTitle>
          <DialogDescription>Update topic name and chapter associations.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="topic-name">Topic Name</Label>
            <Input
              id="topic-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter topic name..."
            />
          </div>

          {/* Chapters Section */}
          <div className="space-y-2 border-t pt-3">
            <Label className="text-sm font-semibold">Chapters (Optional)</Label>
            <p className="text-muted-foreground text-xs">
              Select chapters from the curriculum to associate with this topic.
            </p>

            {/* Selected chapters as badges */}
            {chapters.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {chapters.map((chapter, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {chapter}
                  </Badge>
                ))}
              </div>
            )}

            {/* Chapter checkbox list */}
            {!subject || !grade ? (
              <p className="text-muted-foreground text-xs italic">
                Set grade and subject to see available chapters.
              </p>
            ) : chaptersLoading ? (
              <p className="text-muted-foreground text-xs italic">Loading chapters...</p>
            ) : availableChapters.length > 0 ? (
              <div className="max-h-48 space-y-1 overflow-y-auto rounded border p-2">
                {availableChapters.map((ch) => (
                  <div key={ch.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`modal-chapter-${ch.id}`}
                      checked={chapters.includes(ch.name)}
                      onCheckedChange={(checked) => handleChapterToggle(ch.name, checked as boolean)}
                    />
                    <label
                      htmlFor={`modal-chapter-${ch.id}`}
                      className="text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {ch.name}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-xs italic">
                No chapters available for this grade and subject.
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button type="button" variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Topic
          </Button>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={!name.trim()}>
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
