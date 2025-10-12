// src/App.tsx

import React from 'react';
import { createBrowserRouter, RouterProvider, Link, Outlet } from 'react-router-dom';
import HomePage from './HomePage'; 
import RegisterPage from './RegisterPage'; 
import ProductForm from '../components/ProductForm'; 

// --- Constantes para la Solución del Error de Diseño ---
// Definimos la altura del header (80px) para que el main pueda compensarla.
// Esto garantiza que el contenido no se oculte debajo del header fijo (sticky).
const HEADER_HEIGHT_PX = 80; 
const HEADER_HEIGHT_CLASS = `h-[${HEADER_HEIGHT_PX}px]`; 
const MAIN_PADDING_TOP_CLASS = `pt-[${HEADER_HEIGHT_PX}px]`; 

// --- Componente de Diseño Base (RootLayout) ---
// Este componente define el marco de la aplicación (Header/Footer)
const RootLayout: React.FC = () => (
    <>
        {/* HEADER (Barra de Navegación Fija) 
            Clases CRÍTICAS: 
            1. sticky top-0 z-10 (Lo hace fijo)
            2. ${HEADER_HEIGHT_CLASS} (Le da una altura fija de 80px)
        */}
        <header className={`bg-gray-800 text-white shadow-lg sticky top-0 z-10 ${HEADER_HEIGHT_CLASS} flex items-center`}>
            {/* El p-4 original se elimina del header y se ajusta el padding en el div interno para usar el espacio */}
            <div className="container mx-auto flex justify-between items-center px-4 md:px-6"> 
                <h1 className="text-2xl font-bold text-indigo-400">Plataforma de Gestión 🎓</h1>
                <nav className="space-x-4">
                    <Link to="/" className="text-white hover:text-indigo-400 mx-3 transition duration-300 font-medium">
                        Catálogo
                    </Link>
                    <Link to="/products/new" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 transform hover:scale-105 shadow-md">
                        ➕ Nuevo Producto
                    </Link>
                    <Link to="/register" className="text-white hover:text-indigo-400 mx-3 transition duration-300 font-medium">
                        Registro
                    </Link>
                </nav>
            </div>
        </header>
        
        {/* MAIN (Contenido Dinámico) 
            Clase CRÍTICA: 
            1. ${MAIN_PADDING_TOP_CLASS} (Añade un relleno superior de 80px para empujar el contenido)
            2. py-10 original se reemplaza por pb-10 para mantener el relleno inferior.
        */}
        <main className={`${MAIN_PADDING_TOP_CLASS} pb-10 bg-gray-50 min-h-screen`}>
            <div className="container mx-auto px-6">
                <Outlet /> 
            </div>
        </main>
        
        {/* FOOTER */}
        <footer className="bg-gray-800 text-white text-center p-4 mt-auto border-t border-gray-700">
            <p className="text-sm text-gray-400">© 2025 Proyecto de Maestría | Desarrollo de Interfaces Avanzadas</p>
        </footer>
    </>
);

// --- Configuración del Router ---
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />, // Este es el marco fijo de la aplicación
    children: [
        {
            index: true, 
            element: <HomePage />, 
        },
        {
            path: "register", 
            element: <RegisterPage />, 
        },
        {
            path: "products/new", 
            element: <ProductForm />, 
        },
        {
            path: "products/edit/:id", 
            element: <ProductForm />, 
        },
    ]
  },
]);

// Componente principal que provee el router a la aplicación
const App: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default App;