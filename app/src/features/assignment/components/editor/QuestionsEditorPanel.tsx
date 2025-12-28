import { QuestionsToolbar } from './QuestionsToolbar';
import { QuestionsList } from './QuestionsList';
import {
  ColoredCard,
  ColoredCardHeader,
  ColoredCardTitle,
  ColoredCardContent,
} from '@/shared/components/common/ColoredCard';
import { ClipboardList } from 'lucide-react';

export const QuestionsEditorPanel = () => {
  return (
    <ColoredCard colorScheme="purple">
      <ColoredCardHeader>
        <ColoredCardTitle>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-purple-500 p-2 text-white">
                <ClipboardList className="h-5 w-5" />
              </div>
              Questions
            </div>
            <QuestionsToolbar />
          </div>
        </ColoredCardTitle>
      </ColoredCardHeader>
      <ColoredCardContent>
        <QuestionsList />
      </ColoredCardContent>
    </ColoredCard>
  );
};
