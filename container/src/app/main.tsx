import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

const removeLoader = async () => {
  const el = document.getElementById('loader-overlay');

  await new Promise((resolve) => setTimeout(resolve, 300));
  if (el) {
    el?.parentElement?.removeChild(el);
  }
};

removeLoader();
