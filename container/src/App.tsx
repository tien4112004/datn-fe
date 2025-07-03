import { Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import PresentationWrapper from './PresentationWrapper';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <BrowserRouter>
      <nav className="p-4 bg-gray-100">
        <Link to="/" className="mr-4 hover:underline">
          Home
        </Link>
        <Link to="/editor" className="hover:underline">
          Editor
        </Link>
      </nav>

      <Routes>
        <Route
          path="/"
          element={
            <div className="p-4">
              <h1 className="bg-red-100 mb-4">
                <button onClick={() => setCount((c) => c + 1)}>Count is {count}</button>
              </h1>
              <p>Welcome to the home page.</p>
            </div>
          }
        />
        <Route
          path="/editor"
          element={
            <Suspense fallback={<div>Loading editor…</div>}>
              <PresentationWrapper />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
