import OutlineWorkspace from '@/features/presentation/components/OutlineWorkspace';
import { usePresentationOutlines } from '../hooks/useApi';

const OutlineWorkspacePage = () => {
  const { outlineItems, setOutlineItems } = usePresentationOutlines();

  return (
    <OutlineWorkspace
      items={outlineItems}
      setItems={setOutlineItems}

      onDownload={async () => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }}
    />
  );
};

export default OutlineWorkspacePage;
