import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './DynamicFormValidator';

const container = document.getElementById('react-form-mount');

if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}

