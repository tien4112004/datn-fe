import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { FileUp, X } from 'lucide-react';
import type { Book, BookType } from '@/types/api';

interface BookFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: Book | null;
  onSubmit: (data: FormData) => void;
  isPending?: boolean;
}

const GRADES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Literature',
  'English',
  'History',
  'Geography',
  'Civics',
  'Informatics',
  'Technology',
  'Music',
  'Art',
  'Physical Education',
];

export function BookFormDialog({ open, onOpenChange, book, onSubmit, isPending }: BookFormDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<BookType>('TEXTBOOK');
  const [grade, setGrade] = useState('');
  const [subject, setSubject] = useState('');
  const [publisher, setPublisher] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const isEditing = !!book?.id;

  useEffect(() => {
    if (book) {
      setTitle(book.title || '');
      setDescription(book.description || '');
      setType(book.type || 'TEXTBOOK');
      setGrade(book.grade || '');
      setSubject(book.subject || '');
      setPublisher(book.publisher || '');
      setIsPublished(book.isPublished ?? true);
    } else {
      setTitle('');
      setDescription('');
      setType('TEXTBOOK');
      setGrade('');
      setSubject('');
      setPublisher('');
      setIsPublished(true);
    }
    setPdfFile(null);
    setThumbnailFile(null);
  }, [book, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('type', type);
    formData.append('grade', grade);
    formData.append('subject', subject);
    formData.append('publisher', publisher);
    formData.append('isPublished', String(isPublished));

    if (pdfFile) {
      formData.append('pdf', pdfFile);
    }
    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }

    onSubmit(formData);
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setThumbnailFile(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Book' : 'Add New Book'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the book information and optionally replace the PDF file.'
              : 'Fill in the details and upload a PDF file for the new book.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter book title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select value={type} onValueChange={(value: BookType) => setType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEXTBOOK">Textbook</SelectItem>
                  <SelectItem value="TEACHERBOOK">Teacher Book</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade">Grade</Label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {GRADES.map((g) => (
                    <SelectItem key={g} value={g}>
                      Grade {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="publisher">Publisher</Label>
              <Input
                id="publisher"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                placeholder="Enter publisher name"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter book description"
                rows={3}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>PDF File {!isEditing && '*'}</Label>
              <div className="flex items-center gap-4">
                <label
                  htmlFor="pdf-upload"
                  className="hover:bg-muted flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-4 py-3 transition-colors"
                >
                  <FileUp className="text-muted-foreground h-5 w-5" />
                  <span className="text-muted-foreground text-sm">
                    {pdfFile ? pdfFile.name : 'Choose PDF file'}
                  </span>
                  <input
                    id="pdf-upload"
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handlePdfChange}
                  />
                </label>
                {pdfFile && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => setPdfFile(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {isEditing && book?.pdfUrl && !pdfFile && (
                <p className="text-muted-foreground text-xs">Current PDF: {book.pdfUrl.split('/').pop()}</p>
              )}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Thumbnail Image</Label>
              <div className="flex items-center gap-4">
                <label
                  htmlFor="thumbnail-upload"
                  className="hover:bg-muted flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-4 py-3 transition-colors"
                >
                  <FileUp className="text-muted-foreground h-5 w-5" />
                  <span className="text-muted-foreground text-sm">
                    {thumbnailFile ? thumbnailFile.name : 'Choose thumbnail image'}
                  </span>
                  <input
                    id="thumbnail-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleThumbnailChange}
                  />
                </label>
                {thumbnailFile && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => setThumbnailFile(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {isEditing && book?.thumbnailUrl && !thumbnailFile && (
                <p className="text-muted-foreground text-xs">
                  Current thumbnail: {book.thumbnailUrl.split('/').pop()}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2 sm:col-span-2">
              <Switch id="isPublished" checked={isPublished} onCheckedChange={setIsPublished} />
              <Label htmlFor="isPublished">Published</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || (!isEditing && !pdfFile)}>
              {isPending ? 'Saving...' : isEditing ? 'Update Book' : 'Create Book'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
