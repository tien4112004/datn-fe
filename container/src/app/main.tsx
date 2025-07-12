import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { StagewiseToolbar } from '@stagewise/toolbar-react';
import ReactPlugin from '@stagewise-plugins/react';

const toolbarConfig = {
  plugins: [ReactPlugin],
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <StagewiseToolbar config={toolbarConfig} />
  </StrictMode>
);
