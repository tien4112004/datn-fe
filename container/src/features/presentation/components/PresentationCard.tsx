import { Card, CardContent } from '@/shared/components/ui/card';
import { useLoaderData } from 'react-router-dom';

const PresentationCard = () => {
  const { presentationId } = useLoaderData();

  return (
    <Card className="max-w-sm mx-auto my-4 p-4">
      <CardContent>
        <h2 className="text-lg font-semibold">Presentation ID: {presentationId}</h2>
      </CardContent>
    </Card>
  );
};

export default PresentationCard;
