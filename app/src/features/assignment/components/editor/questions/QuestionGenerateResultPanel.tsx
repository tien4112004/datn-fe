import { Badge } from '@ui/badge';
import { Button } from '@ui/button';
import { Card, CardContent } from '@ui/card';
import { ArrowLeft, CheckCircle2, FileText, Plus, Sparkles, X } from 'lucide-react';
import type { QuestionBankItem } from '@/features/question-bank/types';
import type { MultipleChoiceData } from '@aiprimary/core';

interface QuestionGenerateResultPanelProps {
  questions: QuestionBankItem[];
  totalGenerated: number;
  generationParams: {
    prompt: string;
    grade: string;
    subject: string;
    chapter?: string;
  };
  onBack: () => void;
  onNewGeneration: () => void;
  onClose?: () => void;
  onApply?: (questions: QuestionBankItem[]) => void;
}

export function QuestionGenerateResultPanel({
  questions,
  totalGenerated,
  generationParams,
  onBack,
  onNewGeneration,
  onClose,
  onApply,
}: QuestionGenerateResultPanelProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'KNOWLEDGE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'COMPREHENSION':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'APPLICATION':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'ANALYSIS':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'SYNTHESIS':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'EVALUATION':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      MULTIPLE_CHOICE: 'Multiple Choice',
      OPEN_ENDED: 'Open Ended',
      FILL_IN_BLANK: 'Fill in Blank',
      MATCHING: 'Matching',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Generation Complete</h2>
            <p className="text-muted-foreground text-sm">
              Successfully generated {totalGenerated} question{totalGenerated !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Generation Summary */}
      <div className="bg-muted/50 rounded-lg border p-4">
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <FileText className="text-muted-foreground mt-0.5 h-4 w-4 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Prompt</p>
              <p className="text-muted-foreground text-xs">{generationParams.prompt}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Grade: {generationParams.grade}</Badge>
            <Badge variant="secondary">Subject: {generationParams.subject}</Badge>
            {generationParams.chapter && (
              <Badge variant="secondary">Chapter: {generationParams.chapter}</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3 px-2">
        {questions.map((question, index) => (
          <Card key={question.id || index} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground bg-primary/10 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold">
                    {index + 1}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {getTypeLabel(question.type)}
                  </Badge>
                  <Badge className={`text-xs ${getDifficultyColor(question.difficulty)}`}>
                    {question.difficulty}
                  </Badge>
                </div>
              </div>

              <div className="mb-3 mt-2">
                <p className="text-sm font-medium leading-relaxed">{question.title}</p>
              </div>

              {/* Multiple Choice Options */}
              {question.type === 'MULTIPLE_CHOICE' && (question.data as MultipleChoiceData).options && (
                <div className="space-y-1.5">
                  {(question.data as MultipleChoiceData).options.map((option, optIndex) => (
                    <div
                      key={option.id || optIndex}
                      className={`flex items-start gap-2 rounded-md border p-2 text-sm ${
                        option.isCorrect
                          ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                          : ''
                      }`}
                    >
                      <span className="text-muted-foreground font-medium">
                        {String.fromCharCode(65 + optIndex)}.
                      </span>
                      <span className={option.isCorrect ? 'font-medium' : ''}>{option.text}</span>
                      {option.isCorrect && (
                        <CheckCircle2 className="ml-auto h-4 w-4 flex-shrink-0 text-green-600" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Explanation */}
              {question.explanation && (
                <div className="bg-muted/50 mt-3 rounded-md p-2">
                  <p className="text-muted-foreground text-xs font-medium">Explanation:</p>
                  <p className="text-muted-foreground mt-1 text-xs">{question.explanation}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="border-t px-2 pt-4">
        <div className="flex justify-between gap-2">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Form
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onNewGeneration} className="gap-2">
              <Sparkles className="h-4 w-4" />
              New Generation
            </Button>
            {onApply && (
              <Button
                onClick={() => {
                  onApply(questions);
                  onClose?.();
                }}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add to Assignment
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
