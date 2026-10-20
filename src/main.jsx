import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import '@fontsource/arimo/400.css';
import '@fontsource/arimo/600.css';
import '@fontsource/arimo/700.css';
import './index.css';

// HashRouter → routes work on GitHub Pages without server rewrites (/#/admin).
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
