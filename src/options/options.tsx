import React from 'react';
import ReactDOM from 'react-dom/client';
import '../styles.css';
import { OptionsApp } from './OptionsApp';

ReactDOM.createRoot(document.getElementById('options-root')!).render(
  <React.StrictMode>
    <OptionsApp />
  </React.StrictMode>,
);