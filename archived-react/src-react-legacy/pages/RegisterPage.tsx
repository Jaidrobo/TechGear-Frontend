import React, { useState } from 'react';
// Asegúrate de tener los iconos de Font Awesome importados en tu index.html:
// <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

// --- 1. Tipos y Estados Iniciales ---
interface ValidationResult {
    isValid: boolean;
    message: string;
}

type FormValues = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    dateOfBirth: string;
    quantity: number | '';
    terms: boolean;
};

// Mapea cada campo a su resultado de validación
type FormErrors = {
    [key in keyof FormValues]: ValidationResult;
};

const initialFormValues: FormValues = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    quantity: '',
    terms: false,
};

const initialValidationState: FormErrors = {
    name: { isValid: true, message: '' },
    email: { isValid: true, message: '' },
    password: { isValid: true, message: '' },
    confirmPassword: { isValid: true, message: '' },
    dateOfBirth: { isValid: true, message: '' },
    quantity: { isValid: true, message: '' },
    terms: { isValid: true, message: '' },
};

// --- 2. Constantes y Funciones de Validación (Reglas de Negocio) ---
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_STRENGTH_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const MIN_AGE_YEARS = 18;

const validateRequired = (value: string | number | boolean | null | undefined): ValidationResult => {
    if (value === null || value === undefined || value === false || (typeof value === 'string' && value.trim() === '') || value === '') {
        return { isValid: false, message: "Este campo es obligatorio." };
    }
    return { isValid: true, message: "" };
};

const validateEmail = (email: string): ValidationResult => {
    const required = validateRequired(email);
    if (!required.isValid) return required;
    if (!EMAIL_REGEX.test(email)) {
        return { isValid: false, message: "Formato de correo electrónico inválido." };
    }
    return { isValid: true, message: "Correo válido." };
};

const validatePasswordStrength = (password: string): ValidationResult => {
    const required = validateRequired(password);
    if (!required.isValid) return required;
    if (password.length < 8) {
        return { isValid: false, message: "La contraseña debe tener al menos 8 caracteres." };
    }
    if (!PASSWORD_STRENGTH_REGEX.test(password)) {
        return { isValid: false, message: "Debe incluir mayúsculas, minúsculas, un número y un símbolo especial (@$!%*?&)." };
    }
    return { isValid: true, message: "Contraseña fuerte." };
};

const validatePasswordMatch = (password: string, confirmPassword: string): ValidationResult => {
    const required = validateRequired(confirmPassword);
    if (!required.isValid) {
        return { isValid: false, message: "Confirme su contraseña." };
    }
    if (password !== confirmPassword) {
        return { isValid: false, message: "Las contraseñas no coinciden." };
    }
    return { isValid: true, message: "Las contraseñas coinciden." };
};

const validateDateOfBirth = (dateString: string): ValidationResult => {
    const required = validateRequired(dateString);
    if (!required.isValid) return required;
    const dateOfBirth = new Date(dateString);
    
    // Verificación de fecha inválida (e.g., "aaaa-mm-dd")
    if (isNaN(dateOfBirth.getTime())) {
        return { isValid: false, message: "Fecha de nacimiento inválida." };
    }
    
    // Verificación de edad mínima
    const today = new Date();
    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - MIN_AGE_YEARS);
    
    if (dateOfBirth > minDate) {
        return { isValid: false, message: `Debe ser mayor de ${MIN_AGE_YEARS} años para registrarse.` };
    }
    return { isValid: true, message: "Fecha válida." };
};

const validateNumericQuantity = (value: number | ''): ValidationResult => {
    const required = validateRequired(value);
    if (!required.isValid) return required;
    const num = Number(value);
    
    if (isNaN(num)) {
        return { isValid: false, message: "El valor debe ser un número." };
    }
    if (!Number.isInteger(num) || num < 1) { // Asume que la cantidad debe ser un entero positivo
        return { isValid: false, message: "La cantidad debe ser un número entero mayor o igual a 1." };
    }
    return { isValid: true, message: "Cantidad válida." };
};

// --- 3. Componente Principal (Renombrado a RegisterPage) ---
const RegisterPage = () => {
    const [values, setValues] = useState<FormValues>(initialFormValues);
    const [errors, setErrors] = useState<FormErrors>(initialValidationState);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Maneja los cambios en los inputs, incluyendo la validación dinámica (4.4)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        
        // Determina el nuevo valor basado en el tipo de input
        const newValue: FormValues[keyof FormValues] = 
            type === 'checkbox' 
                ? checked 
                : type === 'number' 
                    ? (value === '' ? '' : Number(value)) 
                    : value;

        const updatedValues = { ...values, [name]: newValue };
        setValues(updatedValues);

        let result: ValidationResult = { isValid: true, message: '' };
        
        // Aplicar la regla de validación correspondiente
        switch (name) {
            case 'name': result = validateRequired(String(value)); break;
            case 'email': result = validateEmail(String(value)); break;
            case 'password':
                result = validatePasswordStrength(String(value));
                // Revalidar confirmPassword si cambia password
                setErrors(prev => ({ ...prev, confirmPassword: validatePasswordMatch(String(value), updatedValues.confirmPassword) }));
                break;
            case 'confirmPassword': result = validatePasswordMatch(updatedValues.password, String(value)); break;
            case 'dateOfBirth': result = validateDateOfBirth(String(value)); break;
            case 'quantity': result = validateNumericQuantity(newValue as number | ''); break;
            case 'terms': result = checked ? { isValid: true, message: "" } : { isValid: false, message: "Debe aceptar los términos." }; break;
            default: break;
        }
        
        // Actualizar el estado de errores
        setErrors(prev => ({ ...prev, [name as keyof FormValues]: result }));
    };

    // Maneja el envío del formulario
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitted(true);
        
        // Ejecutar todas las validaciones finales
        const formErrors: FormErrors = {
            name: validateRequired(values.name),
            email: validateEmail(values.email),
            password: validatePasswordStrength(values.password),
            confirmPassword: validatePasswordMatch(values.password, values.confirmPassword),
            dateOfBirth: validateDateOfBirth(values.dateOfBirth),
            quantity: validateNumericQuantity(values.quantity),
            terms: values.terms ? { isValid: true, message: "" } : { isValid: false, message: "Debe aceptar los términos." }
        };
        setErrors(formErrors);

        const isFormValid = Object.values(formErrors).every(error => error.isValid);
        
        if (isFormValid) {
            // Lógica de envío de datos (4.2: Integración con API)
            // Aquí se integraría un servicio de autenticación/registro
            console.log('✅ Formulario Enviado con Éxito. Datos:', values);
            alert('¡Registro exitoso! Datos enviados a la consola.');
            setValues(initialFormValues); // Limpiar formulario
            setErrors(initialValidationState); // Limpiar errores
            setIsSubmitted(false);
        } else {
            console.error('⚠️ El formulario tiene errores de validación.');
            // Opcional: enfocar el primer campo con error
        }
    };

    // Renderiza el feedback de validación
    const renderValidationFeedback = (fieldName: keyof FormValues) => {
        const error = errors[fieldName];
        
        // Animación (4.5) para el mensaje de error
        if (!error.isValid) {
            return (
                <p className="text-sm mt-1 flex items-center text-red-500 font-medium animate-fadeIn">
                    <i className="fas fa-exclamation-circle mr-1"></i> {error.message}
                </p>
            );
        }
        // Feedback positivo para campos clave (ej: email, password strength)
        if (isSubmitted && error.isValid && error.message) { 
            return (
                <p className="text-sm mt-1 flex items-center text-green-600 font-medium animate-fadeIn">
                    <i className="fas fa-check-circle mr-1"></i> {error.message}
                </p>
            );
        }
        return null;
    };
    
    // Clase dinámica para inputs
    const getInputClass = (fieldName: keyof FormValues) => {
        const baseClass = "w-full p-3 border rounded-lg focus:outline-none transition duration-200 shadow-sm";
        const error = errors[fieldName];
        
        if (!error.isValid) {
            return `${baseClass} border-red-500 focus:ring-2 focus:ring-red-500/50`;
        }
        if (isSubmitted && error.isValid && error.message) {
             return `${baseClass} border-green-500 focus:ring-2 focus:ring-green-500/50`;
        }
        // Estilo profesional por defecto (indigo)
        return `${baseClass} border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/50`;
    };

    return (
        // Contenedor ajustado (se centra en App.tsx)
        <div className="bg-white p-8 md:p-10 rounded-xl shadow-2xl border-t-4 border-indigo-600 animate-fadeIn"> 
            <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">
                Registro de Usuario
            </h2>
             <p className="text-center text-gray-500 mb-8 text-sm">
                Cree su cuenta de acceso a la plataforma de administración.
            </p>
            
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
                
                {/* Nombre */}
                 <div>
                    <label htmlFor="name" className="block text-gray-700 font-semibold mb-2 text-sm">Nombre Completo (*)</label>
                    <input type="text" id="name" name="name" value={values.name} onChange={handleChange} className={getInputClass('name')} placeholder="Ingrese su nombre" />
                    {renderValidationFeedback('name')}
                </div>

                {/* Email */}
                <div>
                    <label htmlFor="email" className="block text-gray-700 font-semibold mb-2 text-sm">Correo Electrónico (*)</label>
                    <input type="email" id="email" name="email" value={values.email} onChange={handleChange} className={getInputClass('email')} placeholder="ejemplo@dominio.com" />
                    {renderValidationFeedback('email')}
                </div>
                
                {/* Contraseña */}
                <div>
                    <label htmlFor="password" className="block text-gray-700 font-semibold mb-2 text-sm">Contraseña (*)</label>
                    <input type="password" id="password" name="password" value={values.password} onChange={handleChange} className={getInputClass('password')} placeholder="Mín. 8 caracteres, Mayús, Minús, Núm, Símbolo" />
                    {renderValidationFeedback('password')}
                </div>

                {/* Confirmar Contraseña */}
                <div>
                    <label htmlFor="confirmPassword" className="block text-gray-700 font-semibold mb-2 text-sm">Confirmar Contraseña (*)</label>
                    <input type="password" id="confirmPassword" name="confirmPassword" value={values.confirmPassword} onChange={handleChange} className={getInputClass('confirmPassword')} placeholder="Repita la contraseña" />
                    {renderValidationFeedback('confirmPassword')}
                </div>

                {/* Fecha de Nacimiento */}
                <div>
                    <label htmlFor="dateOfBirth" className="block text-gray-700 font-semibold mb-2 text-sm">Fecha de Nacimiento (*)</label>
                    <input type="date" id="dateOfBirth" name="dateOfBirth" value={values.dateOfBirth} onChange={handleChange} className={getInputClass('dateOfBirth')} />
                    {renderValidationFeedback('dateOfBirth')}
                </div>
                
                {/* Cantidad Numérica */}
                <div>
                    <label htmlFor="quantity" className="block text-gray-700 font-semibold mb-2 text-sm">Cantidad Numérica (Ejemplo) (*)</label>
                    <input type="number" id="quantity" name="quantity" value={values.quantity} onChange={handleChange} className={getInputClass('quantity')} placeholder="Ingrese una cantidad entera mayor a 0" min="1" step="1" />
                    {renderValidationFeedback('quantity')}
                </div>
                
                {/* Términos y Condiciones */}
                <div className="mb-6">
                    <label htmlFor="terms" className="flex items-center text-gray-700 font-semibold text-sm cursor-pointer">
                        <input type="checkbox" id="terms" name="terms" checked={values.terms} onChange={handleChange} className="mr-2 h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                        Acepto los Términos y Condiciones de la Plataforma (*)
                    </label>
                    {renderValidationFeedback('terms')}
                </div>
                
                {/* Botón de Envío (4.5: Animación) */}
                <button type="submit" 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.01] active:scale-[0.99]">
                    <i className="fas fa-user-plus mr-2"></i> Crear Cuenta
                </button>
            </form>
        </div>
    );
};

export default RegisterPage;