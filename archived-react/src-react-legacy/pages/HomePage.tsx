import React from 'react';
import ProductList from '../components/ProductList'; 
// *** ¡CRÍTICO! Asegúrate de que no haya importación de RegisterPage aquí. ***

const HomePage: React.FC = () => {
    return (
        // Contenedor principal para la página Catálogo
        <div className="w-full min-h-screen">
            
            {/* Sección de la Lista de Productos (ÚNICO CONTENIDO DE ESTA RUTA) */}
            <section id="productos-dinamicos" className="pb-10">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-extrabold text-gray-800 inline-block pb-2 border-b-4 border-indigo-600">
                            Catálogo y Gestión de Inventario
                        </h2>
                        <p className="mt-4 text-gray-600 text-lg">
                            Interfaz profesional para la administración de productos.
                        </p>
                    </div>
                    {/* Componente que muestra la lista de productos */}
                    <ProductList />
                </div>
            </section>
        </div>
    );
};

export default HomePage;
