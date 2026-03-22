import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: { background: '#282828', color: '#fff', border: '1px solid #3E3E3E' },
        success: { iconTheme: { primary: '#1DB954', secondary: '#fff' } },
      }}
    />
  </BrowserRouter>
);
