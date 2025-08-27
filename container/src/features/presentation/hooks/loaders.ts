import { usePresentationApiService } from '../api';

export const createTestPresentations = async () => {
  // Read from /public/data/{presentation.json|presentation-2.json}
  const presentationApiService = usePresentationApiService(true);
  const responses = await Promise.all([fetch('/data/presentation.json'), fetch('/data/presentation2.json')]);
  const presentations = await Promise.all(responses.map((res) => res.json()));

  presentations.forEach((presentation: any) => {
    presentationApiService.createPresentation(presentation);
  });
};
