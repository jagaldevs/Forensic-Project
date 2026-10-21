import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import { App } from './app/App';
import { levelFromLink } from './lib/linkLevel';
import { useSettings } from './stores/settingsStore';

// A teacher can share the lab as …/?level=guided to suggest a support level for the class.
// It is remembered on the device, so an installed app (which opens without it) keeps it.
const linkLevel = levelFromLink(window.location.search);
if (linkLevel !== undefined) useSettings.getState().setClassLevel(linkLevel);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
