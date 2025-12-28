import { Grid3x3 } from 'lucide-react';
import {
  ColoredCard,
  ColoredCardHeader,
  ColoredCardTitle,
  ColoredCardContent,
} from '@/shared/components/common/ColoredCard';
import { TopicManager } from './TopicManager';
import { MatrixGrid } from './MatrixGrid';

export const AssessmentMatrixPanel = () => {
  return (
    <ColoredCard colorScheme="green">
      <ColoredCardHeader>
        <ColoredCardTitle>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-green-500 p-2 text-white">
              <Grid3x3 className="h-5 w-5" />
            </div>
            Assessment Matrix
          </div>
        </ColoredCardTitle>
      </ColoredCardHeader>
      <ColoredCardContent>
        <div className="space-y-4">
          <TopicManager />
          <MatrixGrid />
        </div>
      </ColoredCardContent>
    </ColoredCard>
  );
};
