import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import SettingsProvider from './hooks/SettingsProvider.jsx';
import './styles/global.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SettingsProvider>
      <App />
    </SettingsProvider>
  </StrictMode>,
);
