import React, { useState } from 'react';

// --- Tipos y Estados Iniciales ---
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

// --- Constantes y Funciones de Validación ---
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_STRENGTH_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const MIN_AGE_YEARS = 18;

const validateRequired = (value: string | number | boolean | null | undefined): ValidationResult => {
    if (value === null || value === undefined || value === false || String(value).trim() === '') {
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
    if (isNaN(dateOfBirth.getTime())) {
        return { isValid: false, message: "Fecha de nacimiento inválida." };
    }
    const today = new Date();
    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - MIN_AGE_YEARS);
    if (dateOfBirth > minDate) {
        return { isValid: false, message: `Debe ser mayor de ${MIN_AGE_YEARS} años.` };
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
    if (num < 1) {
        return { isValid: false, message: "La cantidad debe ser mayor o igual a 1." };
    }
    return { isValid: true, message: "Cantidad válida." };
};

// --- Componente Principal ---
const App = () => {
    const [values, setValues] = useState<FormValues>(initialFormValues);
    const [errors, setErrors] = useState<FormErrors>(initialValidationState);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : type === 'number' ? (value === '' ? '' : Number(value)) : value;

        const updatedValues = { ...values, [name]: newValue };
        setValues(updatedValues);

        let result: ValidationResult = { isValid: true, message: '' };
        switch (name) {
            case 'name': result = validateRequired(String(value)); break;
            case 'email': result = validateEmail(String(value)); break;
            case 'password':
                result = validatePasswordStrength(String(value));
                setErrors(prev => ({ ...prev, confirmPassword: validatePasswordMatch(String(value), updatedValues.confirmPassword) }));
                break;
            case 'confirmPassword': result = validatePasswordMatch(updatedValues.password, String(value)); break;
            case 'dateOfBirth': result = validateDateOfBirth(String(value)); break;
            case 'quantity': result = validateNumericQuantity(newValue as number | ''); break;
            case 'terms': result = checked ? { isValid: true, message: "" } : { isValid: false, message: "Debe aceptar los términos." }; break;
            default: break;
        }
        setErrors(prev => ({ ...prev, [name]: result }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitted(true);
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
            console.log('✅ ¡Formulario Enviado con Éxito!', values);
            alert('¡Formulario Enviado con Éxito! Los datos son válidos.');
        } else {
            const firstInvalidField = Object.entries(formErrors).find(([, error]) => !error.isValid);
            if (firstInvalidField) {
                const [fieldName, error] = firstInvalidField;
                console.error(`⚠️ Error de Validación en "${fieldName}": ${error.message}`);
                alert(`Error de Validación en "${fieldName}": ${error.message}`);
            }
        }
    };

    const renderValidationFeedback = (fieldName: keyof FormValues) => {
        const error = errors[fieldName];
        if (!error.isValid) {
            return (
                <p className="text-sm mt-1 flex items-center text-red-500">
                    <i className="fas fa-times-circle mr-1"></i> {error.message}
                </p>
            );
        }
        if (error.isValid && error.message) {
            return (
                <p className="text-sm mt-1 flex items-center text-green-600">
                    <i className="fas fa-check-circle mr-1"></i> {error.message}
                </p>
            );
        }
        return null;
    };
    
    const getInputClass = (fieldName: keyof FormValues) => {
        const baseClass = "w-full p-3 border rounded-lg focus:outline-none transition duration-200 shadow-sm";
        if (!errors[fieldName].isValid) {
            return `${baseClass} border-red-500 focus:ring-2 focus:ring-red-500`;
        }
        if (errors[fieldName].isValid && errors[fieldName].message) {
             return `${baseClass} border-green-500 focus:ring-2 focus:ring-green-500`;
        }
        return `${baseClass} border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/50`;
    };

    return (
        <div className="w-full">
            <h2 className="text-3xl font-extrabold mb-6 text-indigo-700 border-b-4 border-indigo-100 pb-3">
                Registro de Cuenta <span className="text-xl">(Validación Dinámica)</span>
            </h2>
            <form onSubmit={handleSubmit} noValidate>
                {/* Campos del formulario... */}
                 <div className="mb-5">
                    <label htmlFor="name" className="block text-gray-700 font-semibold mb-2 text-sm">Nombre Completo (*)</label>
                    <input type="text" id="name" name="name" value={values.name} onChange={handleChange} className={getInputClass('name')} placeholder="Ingrese su nombre" required />
                    {renderValidationFeedback('name')}
                </div>

                <div className="mb-5">
                    <label htmlFor="email" className="block text-gray-700 font-semibold mb-2 text-sm">Correo Electrónico (*)</label>
                    <input type="email" id="email" name="email" value={values.email} onChange={handleChange} className={getInputClass('email')} placeholder="ejemplo@dominio.com" required />
                    {renderValidationFeedback('email')}
                </div>
                
                <div className="mb-5">
                    <label htmlFor="password" className="block text-gray-700 font-semibold mb-2 text-sm">Contraseña (*)</label>
                    <input type="password" id="password" name="password" value={values.password} onChange={handleChange} className={getInputClass('password')} placeholder="Mín. 8 caracteres, Mayús, Minús, Núm, Símbolo" required />
                    {renderValidationFeedback('password')}
                </div>

                <div className="mb-5">
                    <label htmlFor="confirmPassword" className="block text-gray-700 font-semibold mb-2 text-sm">Confirmar Contraseña (*)</label>
                    <input type="password" id="confirmPassword" name="confirmPassword" value={values.confirmPassword} onChange={handleChange} className={getInputClass('confirmPassword')} placeholder="Repita la contraseña" required />
                    {renderValidationFeedback('confirmPassword')}
                </div>

                <div className="mb-5">
                    <label htmlFor="dateOfBirth" className="block text-gray-700 font-semibold mb-2 text-sm">Fecha de Nacimiento (*)</label>
                    <input type="date" id="dateOfBirth" name="dateOfBirth" value={values.dateOfBirth} onChange={handleChange} className={getInputClass('dateOfBirth')} required />
                    {renderValidationFeedback('dateOfBirth')}
                </div>
                
                <div className="mb-5">
                    <label htmlFor="quantity" className="block text-gray-700 font-semibold mb-2 text-sm">Cantidad Numérica (*)</label>
                    <input type="number" id="quantity" name="quantity" value={values.quantity} onChange={handleChange} className={getInputClass('quantity')} placeholder="Ingrese una cantidad mayor a 0" required min="1" />
                    {renderValidationFeedback('quantity')}
                </div>
                
                <div className="mb-6">
                    <label htmlFor="terms" className="flex items-center text-gray-700 font-semibold text-sm cursor-pointer">
                        <input type="checkbox" id="terms" name="terms" checked={values.terms} onChange={handleChange} className="mr-2 h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" required />
                        Acepto los Términos y Condiciones (*)
                    </label>
                    {renderValidationFeedback('terms')}
                </div>
                
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.01] active:scale-[0.99]">
                    Enviar Registro
                </button>
            </form>
        </div>
    );
};

export default App;