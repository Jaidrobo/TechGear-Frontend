// src/components/ProductList.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, deleteProduct, Product } from '../app/services/productService'; 

// Componente individual de la tarjeta (usa animación 4.5)
const ProductCard: React.FC<{ product: Product, onReload: () => void }> = ({ product, onReload }) => {
    const navigate = useNavigate();

    const handleDelete = async (id: number) => {
        if (!window.confirm(`¿Seguro que quieres eliminar el producto '${product.name}'?`)) return;

        try {
            await deleteProduct(id);
            onReload(); // Recargar la lista después de eliminar
        } catch (err) {
            alert("Error al eliminar el producto.");
        }
    };

    return (
        <article 
            // Animación (4.5): Transformación y sombra al pasar el mouse
            className="bg-white rounded-xl shadow-xl overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 border-t-4 border-indigo-500 flex flex-col justify-between"
        >
            <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{product.name}</h3>
                <p className="text-sm text-indigo-600 font-medium mb-4">Categoría: {product.category}</p>
                <div className="space-y-1">
                    <p className="text-gray-600">Valor: <span className="text-2xl font-bold text-green-600">${product.price.toFixed(2)}</span></p>
                    <p className="text-gray-600">Stock: <span className="font-semibold">{product.stock}</span> unidades</p>
                </div>
            </div>
            <div className="p-4 bg-gray-50 flex justify-end space-x-2 border-t">
                {/* Navegación a la ruta de edición (4.3) */}
                <button 
                    onClick={() => navigate(`/products/edit/${product.id}`)}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm transition duration-300 transform hover:scale-105"
                >
                    <i className="fas fa-edit mr-1"></i> Editar
                </button>
                <button 
                    onClick={() => handleDelete(product.id)}
                    className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg text-sm transition duration-300 transform hover:scale-105"
                >
                    <i className="fas fa-trash-alt mr-1"></i> Eliminar
                </button>
            </div>
        </article>
    );
};


const ProductList: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Función para recargar la lista (pasada a ProductCard)
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getProducts();
            setProducts(data);
        } catch (err) {
            setError("No se pudo cargar la lista. Asegúrate de que JSON Server esté activo.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    if (loading) return <p className="text-center text-xl text-indigo-600"><i className="fas fa-spinner fa-spin mr-2"></i> Cargando productos...</p>;
    if (error) return <p className="text-center text-red-600 text-xl font-semibold">{error}</p>;
    if (products.length === 0) return <p className="text-center text-gray-500 text-xl">No hay productos. ¡Crea uno!</p>;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map(product => (
                <ProductCard key={product.id} product={product} onReload={fetchProducts} />
            ))}
        </div>
    );
};

export default ProductList;