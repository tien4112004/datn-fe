import RichTextEditor from '@/shared/components/rte/RichTextEditor';
import PresentationCard from './components/PresentationCard';
import PresentationWrapper from './components/PresentationWrapper';
import { useCreateBlockNote } from '@blocknote/react';

const EditorPage = () => {
  return <PresentationWrapper />;
};

const DetailsPage = () => {
  return (
    <div className="max-w-2xl mx-auto my-8 p-4">
      <h1>Presentation Details</h1>
      <PresentationCard />
    </div>
  );
};

const RichTextEditorPage = () => {
  const editor = useCreateBlockNote();
  return <RichTextEditor editor={editor} />;
};

export default {
  EditorPage,
  DetailsPage,
  RichTextEditorPage,
};
