import React from 'react';
import { createRoot } from 'react-dom/client';
import { DemoMode } from './DemoMode.jsx';
import '../styles/globals.css';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <DemoMode />
  </React.StrictMode>
);
