import DetailsPage from '@/features/presentation/pages/DetailsPage';
import EditorPage from '@/features/presentation/pages/EditorPage';
import CreateOutlinePage from '@/features/presentation/pages/CreateOutlinePage';
import { useState } from 'react';
import OutlineWorkspace from './components/OutlineWorkspace';

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
  CreateOutlinePage,
};
