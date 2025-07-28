import CardsDemo from '@/shared/components/cards';
import { useApi } from './hooks/useApi';

const CardDemoPage = () => {
  const fetchData = useApi().fetchData;

  return (
    <>
      <button onClick={fetchData}>Fetch Demo Items</button>
      <CardsDemo />
    </>
  );
};

export default { CardDemoPage };
