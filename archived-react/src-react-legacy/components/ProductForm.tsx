// src/components/ProductForm.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createProduct, updateProduct, getProductById, Product, ProductInput } from '../app/services/productService'; 

// --- Tipos para la validación (4.4) ---
type ProductState = ProductInput; 
type FormErrors = { [key in keyof ProductInput]?: string };

const initialFormState: ProductState = { 
    name: '', 
    category: '', 
    price: 0, 
    stock: 0 
};

// --- Función de Validación (4.4) ---
const validateForm = (values: ProductState): FormErrors => {
    const errors: FormErrors = {};
    
    if (!values.name.trim()) errors.name = 'El nombre es obligatorio.';
    if (!values.category.trim()) errors.category = 'La categoría es obligatoria.';
    
    const price = Number(values.price);
    if (isNaN(price) || price <= 0) {
        errors.price = 'El valor debe ser un número positivo.';
    }
    
    const stock = Number(values.stock);
    if (isNaN(stock) || !Number.isInteger(stock) || stock < 0) {
        errors.stock = 'El stock debe ser un número entero no negativo.';
    }

    return errors;
};

// Componente principal del formulario
const ProductForm: React.FC = () => {
    const { id } = useParams<{ id: string }>(); 
    const navigate = useNavigate();
    
    // El estado incluye 'id' opcional para saber si estamos editando o creando
    const [product, setProduct] = useState<ProductState & { id?: number }>(initialFormState);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const isEditing = id !== undefined;
    const title = isEditing ? 'Editar Producto Existente' : 'Crear Nuevo Producto';

    // Carga de datos para edición (4.3)
    useEffect(() => {
        if (isEditing) {
            getProductById(id!)
                .then(data => setProduct(data))
                .catch(err => {
                    console.error(err);
                    alert("Error al cargar el producto para edición.");
                    navigate('/');
                });
        } else {
            setProduct(initialFormState);
        }
    }, [id, isEditing, navigate]);

    // Manejador de cambios
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        
        const newValue = type === 'number' && value !== '' ? parseFloat(value) : value;

        setProduct(prev => ({ ...prev, [name]: newValue }));
        setErrors(prev => ({ ...prev, [name]: undefined })); // Limpiar error al escribir
    };
    
    // Clase condicional para feedback visual (4.4)
    const getInputClass = (fieldName: keyof ProductState) => {
        const baseClass = "w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-200";
        if (errors[fieldName]) {
            return `${baseClass} border-red-500 focus:ring-red-300`;
        }
        return `${baseClass} border-gray-300 focus:ring-indigo-300`;
    };

    // Manejador de Submit (4.2, 4.4)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const formErrors = validateForm(product);
        setErrors(formErrors);

        if (Object.keys(formErrors).length > 0) return;

        setIsSubmitting(true);
        try {
            if (isEditing) {
                await updateProduct(product as Product); 
            } else {
                await createProduct(product);
            }
            
            alert(`Producto ${isEditing ? 'actualizado' : 'creado'} con éxito!`);
            navigate('/'); // Redirigir a la lista (4.3)
        } catch (error) {
            alert(`Error al ${isEditing ? 'actualizar' : 'crear'} el producto. Por favor, revisa la conexión con la API.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        // Animación (4.5): Contenedor con fade-in
        <div className="max-w-xl mx-auto bg-white p-8 md:p-10 rounded-xl shadow-2xl border-t-4 border-indigo-600 animate-fadeIn"> 
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">{title}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Campo: Nombre */}
                <div>
                    <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">Nombre (*)</label>
                    <input type="text" id="name" name="name" value={product.name} onChange={handleChange} 
                        className={getInputClass('name')} placeholder="Ej: Monitor Ultra HD" />
                    {errors.name && <p className="text-red-500 text-sm mt-1 animate-fadeIn">{errors.name}</p>}
                </div>

                {/* Campo: Categoría */}
                <div>
                    <label htmlFor="category" className="block text-gray-700 font-semibold mb-2">Categoría (*)</label>
                    <input type="text" id="category" name="category" value={product.category} onChange={handleChange} 
                        className={getInputClass('category')} placeholder="Ej: Portátiles" />
                    {errors.category && <p className="text-red-500 text-sm mt-1 animate-fadeIn">{errors.category}</p>}
                </div>
                
                {/* Campo: Valor/Precio */}
                <div>
                    <label htmlFor="price" className="block text-gray-700 font-semibold mb-2">Valor/Precio (*)</label>
                    <input type="number" id="price" name="price" value={product.price || ''} onChange={handleChange} 
                        className={getInputClass('price')} placeholder="Ej: 499.99" step="0.01" min="0.01" />
                    {errors.price && <p className="text-red-500 text-sm mt-1 animate-fadeIn">{errors.price}</p>}
                </div>

                {/* Campo: Stock */}
                <div>
                    <label htmlFor="stock" className="block text-gray-700 font-semibold mb-2">Stock (*)</label>
                    <input type="number" id="stock" name="stock" value={product.stock || ''} onChange={handleChange} 
                        className={getInputClass('stock')} placeholder="Ej: 50" min="0" step="1" />
                    {errors.stock && <p className="text-red-500 text-sm mt-1 animate-fadeIn">{errors.stock}</p>}
                </div>

                {/* Botón de Submit (4.5: Animación) */}
                <button type="submit" disabled={isSubmitting}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.01] active:scale-[0.99] disabled:bg-indigo-400">
                    {isSubmitting ? <i className="fas fa-spinner fa-spin mr-2"></i> : null}
                    {isEditing ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
                
                {/* Botón de Cancelar */}
                <button type="button" onClick={() => navigate('/')} 
                    className="w-full text-indigo-600 border border-indigo-600 hover:bg-indigo-50 font-bold py-3 rounded-lg transition duration-300">
                    Cancelar
                </button>
            </form>
        </div>
    );
};

export default ProductForm;