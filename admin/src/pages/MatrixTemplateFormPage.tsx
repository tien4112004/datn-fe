import { Button } from '@ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card';
import { Input } from '@ui/input';
import { Label } from '@ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select';
import { useMatrixTemplateById, useCreateMatrixTemplate, useUpdateMatrixTemplate } from '@/hooks';
import { getAllSubjects, getAllGrades } from '@aiprimary/core';
import { ArrowLeft, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const GRADES = getAllGrades();
const SUBJECTS = getAllSubjects();

export function MatrixTemplateFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const { data: templateData, isLoading: isLoadingTemplate } = useMatrixTemplateById(id || '');
  const createMutation = useCreateMatrixTemplate();
  const updateMutation = useUpdateMatrixTemplate();

  const [title, setTitle] = useState('');
  const [grade, setGrade] = useState('');
  const [subject, setSubject] = useState('');

  // Populate form when editing
  useEffect(() => {
    if (templateData?.data) {
      setTitle(templateData.data.title || '');
      setGrade(templateData.data.grade || '');
      setSubject(templateData.data.subject || '');
    }
  }, [templateData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      title,
      grade: grade || null,
      subject: subject || null,
      dimensions: {
        topics: [],
        difficulties: [],
        questionTypes: [],
      },
      matrix: [],
      totalQuestions: 0,
      totalPoints: 0,
    };

    if (isEditing && id) {
      updateMutation.mutate(
        { id, data },
        {
          onSuccess: () => navigate('/matrix-templates'),
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => navigate('/matrix-templates'),
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isEditing && isLoadingTemplate) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/matrix-templates')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? 'Edit Matrix Template' : 'New Matrix Template'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Update the matrix template details' : 'Create a new assessment matrix template'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Template Details</CardTitle>
            <CardDescription>Basic information about the matrix template</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter template title"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADES.map((g) => (
                      <SelectItem key={g.code} value={g.code}>
                        {g.name}
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
                      <SelectItem key={s.code} value={s.code}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/matrix-templates')}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || !title}>
                <Save className="mr-2 h-4 w-4" />
                {isPending ? 'Saving...' : isEditing ? 'Update' : 'Create'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

export default MatrixTemplateFormPage;
