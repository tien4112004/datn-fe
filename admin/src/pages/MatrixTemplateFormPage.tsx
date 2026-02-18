import { Button } from '@ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card';
import { Input } from '@ui/input';
import { Label } from '@ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select';
import { useMatrixTemplateById, useCreateMatrixTemplate, useUpdateMatrixTemplate } from '@/hooks';
import {
  getAllSubjects,
  getAllGrades,
  getAllDifficulties,
  getAllQuestionTypes,
  generateId,
  createCellId,
  difficultyFromApi,
  questionTypeFromApi,
  parseCellValue,
} from '@aiprimary/core';
import type { MatrixCell, AssignmentTopic, Difficulty, QuestionType } from '@aiprimary/core';
import { MatrixGridEditor } from '@aiprimary/question/matrix';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const GRADES = getAllGrades();
const SUBJECTS = getAllSubjects();

/**
 * Convert a MatrixTemplate's dimensions + matrix 3D array into flat topics + cells for the editor.
 */
function templateToEditorData(template: {
  dimensions?: { topics: { id: string; name: string }[]; difficulties: string[]; questionTypes: string[] };
  matrix?: string[][][];
}): { topics: AssignmentTopic[]; cells: MatrixCell[] } {
  if (!template.dimensions || !template.matrix) return { topics: [], cells: [] };

  const { dimensions, matrix } = template;
  const topics: AssignmentTopic[] = dimensions.topics.map((t) => ({ id: t.id, name: t.name }));
  const cells: MatrixCell[] = [];

  dimensions.topics.forEach((topic, topicIdx) => {
    dimensions.difficulties.forEach((diffRaw, diffIdx) => {
      dimensions.questionTypes.forEach((qtRaw, qtIdx) => {
        const cellValue = matrix[topicIdx]?.[diffIdx]?.[qtIdx] || '0:0';
        const { count, points } = parseCellValue(cellValue);
        const difficulty = difficultyFromApi(diffRaw) as Difficulty;
        const questionType = questionTypeFromApi(qtRaw) as QuestionType;

        if (count > 0) {
          cells.push({
            id: createCellId(topic.id, difficulty, questionType),
            topicId: topic.id,
            topicName: topic.name,
            difficulty,
            questionType,
            requiredCount: count,
            currentCount: 0,
            points,
          });
        }
      });
    });
  });

  return { topics, cells };
}

/**
 * Convert flat topics + cells back to the template's dimensions + matrix format.
 */
function editorDataToTemplate(topics: AssignmentTopic[], cells: MatrixCell[]) {
  // Collect unique difficulties & question types from cells
  const difficultiesSet = new Set<Difficulty>();
  const questionTypesSet = new Set<QuestionType>();
  cells.forEach((c) => {
    difficultiesSet.add(c.difficulty);
    questionTypesSet.add(c.questionType);
  });

  // If no cells yet, use all difficulties and question types as defaults
  const difficulties =
    difficultiesSet.size > 0 ? Array.from(difficultiesSet) : getAllDifficulties().map((d) => d.value);
  const questionTypes =
    questionTypesSet.size > 0 ? Array.from(questionTypesSet) : getAllQuestionTypes().map((q) => q.value);

  const dimensions = {
    topics: topics.map((t) => ({ id: t.id, name: t.name })),
    difficulties: difficulties as string[],
    questionTypes: questionTypes as string[],
  };

  const matrix: string[][][] = topics.map((topic) =>
    difficulties.map((difficulty) =>
      questionTypes.map((questionType) => {
        const cell = cells.find(
          (c) => c.topicId === topic.id && c.difficulty === difficulty && c.questionType === questionType
        );
        if (!cell || cell.requiredCount === 0) return '0:0';
        return `${cell.requiredCount}:${cell.requiredCount.toFixed(1)}`;
      })
    )
  );

  let totalQuestions = 0;
  let totalPoints = 0;
  cells.forEach((c) => {
    totalQuestions += c.requiredCount;
    totalPoints += c.requiredCount;
  });

  return { dimensions, matrix, totalQuestions, totalPoints };
}

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
  const [topics, setTopics] = useState<AssignmentTopic[]>([]);
  const [cells, setCells] = useState<MatrixCell[]>([]);

  // Populate form when editing
  useEffect(() => {
    if (templateData?.data) {
      const t = templateData.data;
      setTitle(t.title || '');
      setGrade(t.grade || '');
      setSubject(t.subject || '');
      const { topics: loadedTopics, cells: loadedCells } = templateToEditorData(t);
      setTopics(loadedTopics);
      setCells(loadedCells);
    }
  }, [templateData]);

  // Matrix cell callbacks
  const handleCellUpdate = useCallback((cellId: string, updates: Partial<MatrixCell>) => {
    setCells((prev) => prev.map((c) => (c.id === cellId ? { ...c, ...updates } : c)));
  }, []);

  const handleCellCreate = useCallback((cell: Omit<MatrixCell, 'id' | 'currentCount'>) => {
    const cellId = createCellId(cell.topicId, cell.difficulty, cell.questionType);
    setCells((prev) => [...prev, { ...cell, id: cellId, currentCount: 0 }]);
  }, []);

  const handleCellRemove = useCallback((cellId: string) => {
    setCells((prev) => prev.filter((c) => c.id !== cellId));
  }, []);

  // Topic management
  const handleAddTopic = useCallback(() => {
    const newTopic: AssignmentTopic = { id: generateId(), name: '' };
    setTopics((prev) => [...prev, newTopic]);
  }, []);

  const handleRemoveTopic = useCallback((topicId: string) => {
    setTopics((prev) => prev.filter((t) => t.id !== topicId));
    setCells((prev) => prev.filter((c) => c.topicId !== topicId));
  }, []);

  const handleTopicNameChange = useCallback((topicId: string, name: string) => {
    setTopics((prev) => prev.map((t) => (t.id === topicId ? { ...t, name } : t)));
    setCells((prev) => prev.map((c) => (c.topicId === topicId ? { ...c, topicName: name } : c)));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { dimensions, matrix, totalQuestions, totalPoints } = editorDataToTemplate(topics, cells);

    const data = {
      title,
      grade: grade || null,
      subject: subject || null,
      dimensions,
      matrix,
      totalQuestions,
      totalPoints,
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
        <div className="space-y-6">
          {/* Template Details */}
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
            </CardContent>
          </Card>

          {/* Topics Management */}
          <Card>
            <CardHeader>
              <CardTitle>Topics</CardTitle>
              <CardDescription>
                Add topics to define the rows of the assessment matrix. Each topic represents a content area.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {topics.map((topic) => (
                <div key={topic.id} className="flex items-center gap-2">
                  <Input
                    value={topic.name}
                    onChange={(e) => handleTopicNameChange(topic.id, e.target.value)}
                    placeholder="Topic name..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveTopic(topic.id)}
                    className="shrink-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={handleAddTopic}>
                <Plus className="mr-2 h-4 w-4" />
                Add Topic
              </Button>
            </CardContent>
          </Card>

          {/* Matrix Grid */}
          {topics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Assessment Matrix</CardTitle>
                <CardDescription>
                  Set required question counts for each topic, difficulty level, and question type
                  combination.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MatrixGridEditor
                  topics={topics}
                  cells={cells}
                  onCellUpdate={handleCellUpdate}
                  onCellCreate={handleCellCreate}
                  onCellRemove={handleCellRemove}
                  showCurrentCount={false}
                />
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
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
        </div>
      </form>
    </div>
  );
}

export default MatrixTemplateFormPage;
