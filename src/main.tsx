import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';

document.addEventListener(
  'touchmove',
  (event) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest('input, textarea')) return;
    event.preventDefault();
  },
  { passive: false },
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
