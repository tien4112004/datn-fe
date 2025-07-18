import CardsDemo from '@/shared/components/cards';
import MultipleChoiceDemo from './components/MultipleChoiceLayouts';

const CardDemoPage = () => {
  return <CardsDemo />;
};

const DndDemoPage = () => {
  return <MultipleChoiceDemo />;
};

export default { CardDemoPage, DndDemoPage };
