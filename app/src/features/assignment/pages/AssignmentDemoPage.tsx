import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { QuestionRenderer } from '../components/QuestionRenderer';
import {
  VIEW_MODE,
  QUESTION_TYPE,
  VIEW_MODE_LABELS,
  QUESTION_TYPE_LABELS,
  DIFFICULTY,
  type ViewMode,
  type QuestionType,
  type Question,
  type Answer,
} from '../types';
import { createEmptyQuestion } from '../utils';
import { mockAssignments } from '../api/data/assignments.data';

const AssignmentDemoPage = () => {
  const [viewMode, setViewMode] = useState<ViewMode>(VIEW_MODE.EDITING);
  const [questionType, setQuestionType] = useState<QuestionType>(QUESTION_TYPE.MULTIPLE_CHOICE);
  const [question, setQuestion] = useState<Question>(() => mockAssignments[0].questions[0]);
  const [answer, setAnswer] = useState<Answer | undefined>();

  const handleQuestionTypeChange = (newType: QuestionType) => {
    setQuestionType(newType);
    // Load sample question from mock data or create empty
    const sampleQuestion = mockAssignments[0].questions.find((q) => q.type === newType);
    setQuestion(sampleQuestion || createEmptyQuestion(newType, DIFFICULTY.EASY));
    setAnswer(undefined);
  };

  const handleSubmit = () => {
    // Generate a mock answer for demo purposes
    if (question.type === QUESTION_TYPE.MULTIPLE_CHOICE && 'options' in question) {
      const correctOption = question.options.find((o) => o.isCorrect);
      if (correctOption) {
        setAnswer({
          questionId: question.id,
          type: QUESTION_TYPE.MULTIPLE_CHOICE,
          selectedOptionId: correctOption.id,
        });
        setViewMode(VIEW_MODE.AFTER_ASSESSMENT);
      }
    } else if (question.type === QUESTION_TYPE.OPEN_ENDED) {
      setAnswer({
        questionId: question.id,
        type: QUESTION_TYPE.OPEN_ENDED,
        text: 'This is a sample student answer for the open-ended question.',
      });
      setViewMode(VIEW_MODE.AFTER_ASSESSMENT);
    } else if (question.type === QUESTION_TYPE.FILL_IN_BLANK && 'segments' in question) {
      const blanks = question.segments
        .filter((s) => s.type === 'blank')
        .map((s) => ({
          segmentId: s.id,
          value: s.content, // Use correct answer for demo
        }));
      setAnswer({
        questionId: question.id,
        type: QUESTION_TYPE.FILL_IN_BLANK,
        blanks,
      });
      setViewMode(VIEW_MODE.AFTER_ASSESSMENT);
    } else if (question.type === QUESTION_TYPE.MATCHING && 'pairs' in question) {
      const matches = question.pairs.map((pair) => ({
        leftId: pair.id,
        rightId: pair.id,
      }));
      setAnswer({
        questionId: question.id,
        type: QUESTION_TYPE.MATCHING,
        matches,
      });
      setViewMode(VIEW_MODE.AFTER_ASSESSMENT);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-6 py-8">
      <div>
        <h1 className="text-3xl font-bold">Assignment Question Demo</h1>
        <p className="text-muted-foreground mt-2">Test different question types and view modes</p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* View Mode Selector */}
            <div className="space-y-2">
              <Label>View Mode</Label>
              <Select value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(VIEW_MODE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Question Type Selector */}
            <div className="space-y-2">
              <Label>Question Type</Label>
              <Select value={questionType} onValueChange={(v) => handleQuestionTypeChange(v as QuestionType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Submit Button (visible in Doing mode) */}
          {viewMode === VIEW_MODE.DOING && (
            <Button onClick={handleSubmit} className="w-full">
              Submit Answer (Demo)
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Question Renderer */}
      <QuestionRenderer
        question={question}
        viewMode={viewMode}
        answer={answer}
        onChange={setQuestion}
        onAnswerChange={setAnswer}
      />

      {/* Debug Panel (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <Card>
          <CardHeader>
            <CardTitle>Debug: Question JSON</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted max-h-96 overflow-auto rounded-md p-4 text-xs">
              {JSON.stringify({ question, answer }, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AssignmentDemoPage;
