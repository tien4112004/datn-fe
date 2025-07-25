import PresentationCard from './components/PresentationCard';
import PresentationWrapper from './components/PresentationWrapper';
import OutlineCard from './components/OutlineCard';

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

const OutlineWorkspace = () => {
  return (
    <div className="bg-accent flex w-full justify-center p-8">
      <div className="bg-background flex w-full max-w-3xl flex-col items-center gap-6 rounded-xl p-8">
        <OutlineCard />
        <OutlineCard />
        <OutlineCard />
      </div>
    </div>
  );
};

export default {
  EditorPage,
  DetailsPage,
  OutlineWorkspace,
};
