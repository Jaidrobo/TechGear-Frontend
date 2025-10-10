// src/index.tsx

import React from 'react';
import { createRoot } from 'react-dom/client';
import DynamicFormValidator from './DynamicFormValidator';

import './styles.css'; 

// 1. Encontrar el contenedor en el HTML
const container = document.getElementById('react-form-mount');

if (container) {
    // 2. Crear la raíz de React 18
    const root = createRoot(container);

    // 3. Renderizar el componente principal
    root.render(
        <React.StrictMode>
            <DynamicFormValidator />
        </React.StrictMode>
    );
}

