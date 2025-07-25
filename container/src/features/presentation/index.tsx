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
  return <OutlineWorkspace />;
};

export default {
  EditorPage,
  DetailsPage,
  OutlineWorkspacePage,
};
