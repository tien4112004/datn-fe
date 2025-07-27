import { useState } from 'react';
import OutlineWorkspace from './components/OutlineWorkspace';
import PresentationCard from './components/PresentationCard';
import PresentationWrapper from './components/PresentationWrapper';

const EditorPage = () => {
  return <PresentationWrapper />;
};

const DetailsPage = () => {
  return (
    <div className="mx-auto my-8 max-w-2xl p-4">
      <h1>Presentation Details</h1>
      <PresentationCard />
    </div>
  );
};

const OutlineWorkspacePage = () => {
  const [items, setItems] = useState([{ id: '1' }, { id: '2' }, { id: '3' }]);
  return (
    <OutlineWorkspace
      items={items}
      setItems={setItems}
      onDownload={async () => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }}
    />
  );
};

export default {
  EditorPage,
  DetailsPage,
  OutlineWorkspacePage,
};
