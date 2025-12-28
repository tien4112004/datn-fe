import { useState, useEffect } from 'react';
import type { MatchingQuestion, MatchingAnswer } from '../../types';
import { MarkdownPreview, DifficultyBadge } from '../shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { cn } from '@/shared/lib/utils';
import { QUESTION_TYPE } from '../../types';
import { GripVertical, RotateCcw } from 'lucide-react';

interface DraggableItemProps {
  id: string;
  content: string;
  imageUrl?: string;
  index: number;
  isMatched?: boolean;
}

const DraggableItem = ({ id, content, imageUrl, index, isMatched }: DraggableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled: isMatched,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'flex cursor-move items-start gap-3 rounded-md border bg-blue-50 p-3 transition-opacity dark:bg-blue-900/20',
        isDragging && 'opacity-50',
        isMatched && 'cursor-not-allowed opacity-40'
      )}
    >
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
        {index + 1}
      </div>
      <div className="flex-1">
        <MarkdownPreview content={content} />
        {imageUrl && (
          <img src={imageUrl} alt={`Item ${index + 1}`} className="mt-2 max-h-24 rounded-md border" />
        )}
      </div>
      {!isMatched && <GripVertical className="text-muted-foreground h-4 w-4" />}
    </div>
  );
};

interface DroppableZoneProps {
  id: string;
  content: string;
  imageUrl?: string;
  index: number;
  matchedItem?: { id: string; content: string; imageUrl?: string; itemIndex: number };
  onRemove?: () => void;
}

const DroppableZone = ({ id, content, imageUrl, index, matchedItem, onRemove }: DroppableZoneProps) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'min-h-[80px] rounded-md border p-3 transition-colors',
        isOver && 'border-green-400 bg-green-100 dark:bg-green-900/30',
        matchedItem ? 'bg-green-50 dark:bg-green-900/20' : 'bg-background'
      )}
    >
      <div className="mb-2 flex items-start gap-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-sm font-medium text-white">
          {String.fromCharCode(65 + index)}
        </div>
        <div className="flex-1">
          <MarkdownPreview content={content} />
          {imageUrl && (
            <img src={imageUrl} alt={`Target ${index + 1}`} className="mt-2 max-h-24 rounded-md border" />
          )}
        </div>
      </div>

      {matchedItem ? (
        <div className="mt-2 border-t border-dashed pt-2">
          <div className="flex items-center justify-between rounded bg-blue-100 p-2 dark:bg-blue-900/30">
            <div className="flex flex-1 items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
                {matchedItem.itemIndex + 1}
              </div>
              <div className="flex-1 text-sm">
                <MarkdownPreview content={matchedItem.content} />
              </div>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-2 border-t border-dashed pt-2">
          <p className="text-muted-foreground text-center text-xs">Drop item here</p>
        </div>
      )}
    </div>
  );
};

interface MatchingDoingProps {
  question: MatchingQuestion;
  answer?: MatchingAnswer;
  onAnswerChange: (answer: MatchingAnswer) => void;
}

export const MatchingDoing = ({ question, answer, onAnswerChange }: MatchingDoingProps) => {
  const [matches, setMatches] = useState<Map<string, string>>(new Map());
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => {
    if (answer?.matches) {
      const newMatches = new Map(answer.matches.map((m) => [m.rightId, m.leftId]));
      setMatches(newMatches);
    }
  }, [answer]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over) {
      const newMatches = new Map(matches);
      newMatches.set(over.id as string, active.id as string);
      setMatches(newMatches);

      onAnswerChange({
        questionId: question.id,
        type: QUESTION_TYPE.MATCHING,
        matches: Array.from(newMatches.entries()).map(([rightId, leftId]) => ({
          leftId,
          rightId,
        })),
      });
    }
  };

  const handleRemoveMatch = (rightId: string) => {
    const newMatches = new Map(matches);
    newMatches.delete(rightId);
    setMatches(newMatches);

    onAnswerChange({
      questionId: question.id,
      type: QUESTION_TYPE.MATCHING,
      matches: Array.from(newMatches.entries()).map(([rightId, leftId]) => ({
        leftId,
        rightId,
      })),
    });
  };

  const matchedLeftIds = new Set(Array.from(matches.values()));
  const activePair = activeId ? question.data.pairs.find((p) => p.id === activeId) : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Matching Question</CardTitle>
          <DifficultyBadge difficulty={question.difficulty} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Question Title */}
        <div className="space-y-2">
          <MarkdownPreview content={question.title} />
          {question.titleImageUrl && (
            <img src={question.titleImageUrl} alt="Question" className="mt-2 max-h-64 rounded-md border" />
          )}
        </div>

        <p className="text-muted-foreground text-sm">Drag items from Column A to match with Column B</p>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Left Column - Draggable Items */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Column A (Drag from here)</h4>
              {question.data.pairs.map((pair, index) => (
                <DraggableItem
                  key={pair.id}
                  id={pair.id}
                  content={pair.left}
                  imageUrl={pair.leftImageUrl}
                  index={index}
                  isMatched={matchedLeftIds.has(pair.id)}
                />
              ))}
            </div>

            {/* Right Column - Drop Zones */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Column B (Drop here)</h4>
              {question.data.pairs.map((pair, index) => {
                const matchedLeftId = matches.get(pair.id);
                const matchedPair = matchedLeftId
                  ? question.data.pairs.find((p) => p.id === matchedLeftId)
                  : undefined;
                const matchedItem = matchedPair
                  ? {
                      id: matchedPair.id,
                      content: matchedPair.left,
                      imageUrl: matchedPair.leftImageUrl,
                      itemIndex: question.data.pairs.findIndex((p) => p.id === matchedPair.id),
                    }
                  : undefined;

                return (
                  <DroppableZone
                    key={pair.id}
                    id={pair.id}
                    content={pair.right}
                    imageUrl={pair.rightImageUrl}
                    index={index}
                    matchedItem={matchedItem}
                    onRemove={() => handleRemoveMatch(pair.id)}
                  />
                );
              })}
            </div>
          </div>

          <DragOverlay>
            {activeId && activePair && (
              <div className="flex items-start gap-3 rounded-md border bg-blue-50 p-3 opacity-90 shadow-lg dark:bg-blue-900/20">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
                  {question.data.pairs.findIndex((p) => p.id === activeId) + 1}
                </div>
                <div className="flex-1">
                  <MarkdownPreview content={activePair.left} />
                </div>
              </div>
            )}
          </DragOverlay>
        </DndContext>

        {/* Points */}
        {question.points && <p className="text-muted-foreground text-sm">Points: {question.points}</p>}
      </CardContent>
    </Card>
  );
};
