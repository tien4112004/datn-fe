import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PresentationPage from '@/features/presentation/page';
import { CardsDemo } from '@/components/cards';
import Nav from '@/shared/layouts/Nav';

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<CardsDemo />} />
        <Route path="/presentation" element={<PresentationPage />} />
      </Routes>
    </BrowserRouter>
  );
}
