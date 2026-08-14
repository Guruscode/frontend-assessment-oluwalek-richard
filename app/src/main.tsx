import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// StrictMode is intentionally omitted: its double-invoked dev renders would
// double-count the render-counter used for the constraint-2 evidence.
createRoot(document.getElementById('root')!).render(<App />);
