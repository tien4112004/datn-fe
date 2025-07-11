import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import PresentationPage from '@/features/presentation/page';
import { CardsDemo } from '@/components/cards';

export default function App() {
  return (
    <BrowserRouter>
      <nav className="p-4 bg-gray-100 header-nav">
        <Link to="/" className="mr-4 hover:underline">
          Home
        </Link>
        <Link to="/presentation" className="hover:underline">
          Presentation
        </Link>
      </nav>

      <Routes>
        <Route path="/" element={<CardsDemo />} />
        <Route path="/presentation" element={<PresentationPage />} />
      </Routes>
    </BrowserRouter>
  );
}
