// src/index.tsx (Este archivo debe existir)
import React from 'react';
import { createRoot } from 'react-dom/client'; // Usa create-root para React 18+
import App from './pages/App';

// Busca el elemento de montaje en el DOM (el <div> con id="root")
const container = document.getElementById('root');

if (container) {
  // Crea la raíz de React
  const root = createRoot(container);

  // Renderiza tu componente principal de la aplicación
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
    console.error("No se encontró el elemento 'root' para montar la aplicación React.");
}