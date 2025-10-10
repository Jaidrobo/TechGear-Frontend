import React, { useState, FormEvent, ChangeEvent } from 'react';

// =========================================================================
// 1. LÓGICA Y TIPADO DE VALIDACIÓN (TypeScript)
// =========================================================================

// Tipo para el resultado de cualquier validación
type ValidationResult = {
  isValid: boolean;
  message: string;
};

// Interfaz para los valores del formulario
interface FormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  quantity: number | string;
  terms: boolean;
}

// Constantes y RegEx para validaciones
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_STRENGTH_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const MIN_AGE_YEARS = 18;

// --- Funciones de Validación ---

const validateRequired = (value: string | number | boolean | null | undefined): ValidationResult => {
  if (value === null || value === undefined || value === false) {
    return { isValid: false, message: "Este campo es obligatorio." };
  }
  if (typeof value === 'string' && value.trim() === '') {
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

const validateNumericQuantity = (value: number | string): ValidationResult => {
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

// Función para validar todo el formulario al momento de enviar
const validateForm = (values: FormValues): Record<keyof FormValues, ValidationResult> => {
  return {
    name: validateRequired(values.name),
    email: validateEmail(values.email),
    password: validatePasswordStrength(values.password),
    confirmPassword: validatePasswordMatch(values.password, values.confirmPassword),
    dateOfBirth: validateDateOfBirth(values.dateOfBirth),
    quantity: validateNumericQuantity(values.quantity),
    terms: values.terms ? { isValid: true, message: "" } : { isValid: false, message: "Debe aceptar los términos." },
  };
};

// =========================================================================
// 2. COMPONENTE PRINCIPAL (App)
// =========================================================================

// Definiciones de estado inicial
const initialFormValues: FormValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  dateOfBirth: '',
  quantity: 0,
  terms: false,
};

const initialValidationState: Record<keyof FormValues, ValidationResult> = {
  name: { isValid: true, message: '' },
  email: { isValid: true, message: '' },
  password: { isValid: true, message: '' },
  confirmPassword: { isValid: true, message: '' },
  dateOfBirth: { isValid: true, message: '' },
  quantity: { isValid: true, message: '' },
  terms: { isValid: true, message: '' },
};

// Se modificó el diseño para encajar dentro del div#react-form-mount del HTML.
const App: React.FC = () => {
  const [values, setValues] = useState<FormValues>(initialFormValues);
  const [errors, setErrors] = useState(initialValidationState);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Manejador general de cambios en los inputs
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    // Determina el nuevo valor basado en el tipo de input (checkbox, number o text)
    const newValue: string | number | boolean = type === 'checkbox' 
      ? checked 
      : type === 'number' 
        ? value === '' ? '' : Number(value) 
        : value;

    // 1. Actualiza el estado de los valores del formulario
    setValues((prevValues: FormValues) => ({
      ...prevValues,
      [name]: newValue,
    }));
    
    // Objeto temporal para usar el valor actualizado inmediatamente en validaciones interdependientes (ej. confirmar contraseña)
    const updatedValues: FormValues = { ...values, [name]: newValue as any }; 
    
    // 2. Realizar la validación en tiempo real
    let result: ValidationResult = { isValid: true, message: '' };
    
    switch (name) {
      case 'name':
        result = validateRequired(String(value));
        break;
      case 'email':
        result = validateEmail(String(value));
        break;
      case 'password':
        result = validatePasswordStrength(String(value));
        // Revalida confirmPassword si cambia la contraseña principal
        setErrors(prevErrors => ({ 
            ...prevErrors, 
            confirmPassword: validatePasswordMatch(String(value), updatedValues.confirmPassword as string)
        }));
        break;
      case 'confirmPassword':
        result = validatePasswordMatch(updatedValues.password as string, String(value));
        break;
      case 'dateOfBirth':
        result = validateDateOfBirth(String(value));
        break;
      case 'quantity':
        result = validateNumericQuantity(newValue as (number | string));
        break;
      case 'terms':
        result = checked ? { isValid: true, message: "" } : { isValid: false, message: "Debe aceptar los términos." };
        break;
      default:
        break;
    }
    
    // 3. Actualiza el estado de los errores para el campo actual
    setErrors(prevErrors => ({
      ...prevErrors,
      [name]: result,
    }));
  };

  // Manejador del envío del formulario
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true); // Marca que el envío ha sido intentado

    const formErrors = validateForm(values);
    setErrors(formErrors); // Aplica la validación final a todos los campos

    const isFormValid = Object.values(formErrors).every(error => error.isValid);

    type FormErrorsEntry = [keyof FormValues, ValidationResult];

    if (isFormValid) {
      console.log('✅ ¡Formulario Enviado con Éxito! Los datos son válidos:', values);
      // Muestra una notificación simple de éxito
      alert('¡Formulario Enviado con Éxito! Los datos son válidos.'); 
      
    } else {
      // Encuentra el primer campo inválido para mostrar el mensaje de error
      const entries = Object.entries(formErrors) as FormErrorsEntry[];
      const firstInvalidField = entries.find(([, error]) => !error.isValid);
      
      if (firstInvalidField) {
        const errorMessage = firstInvalidField[1].message;
        console.error(`⚠️ Error de Validación en el campo "${firstInvalidField[0]}": ${errorMessage}`);
        // Muestra una notificación simple de error
        alert(`Error de Validación en el campo "${firstInvalidField[0]}": ${errorMessage}`);
      }
    }
  };

  // Helper: Renderiza el mensaje de validación (éxito o error)
  const renderValidationFeedback = (fieldName: keyof FormValues) => {
    const error = errors[fieldName];
    const hasError = !error.isValid;
    // Solo mostramos feedback si hay un error o si el campo es válido Y tiene un mensaje de éxito (ej. 'Correo válido.')
    const isInteracted = !error.isValid || (error.isValid && error.message); 
    
    if (isInteracted) {
        const className = `text-sm mt-1 flex items-center transition-opacity duration-300 ${hasError ? 'text-red-500' : 'text-green-600'}`;
        const icon = hasError ? 'fas fa-times-circle' : 'fas fa-check-circle';
        const message = error.message || 'Dato correcto.';
        
        return <p className={className}><i className={`${icon} mr-1`}></i>{message}</p>;
    }
    return null;
  };
  
  // Helper: Aplica clases dinámicas de Tailwind CSS para bordes y enfoque
  const getInputClass = (fieldName: keyof FormValues) => {
    const error = errors[fieldName];
    // Clase base para todos los inputs, usa la fuente 'Poppins' para alinearse con el HTML base
    const baseClass = "w-full p-3 border rounded-lg focus:outline-none transition duration-200 shadow-sm font-['Poppins', sans-serif]"; 
    
    // Si hay un error, aplica borde rojo
    if (!error.isValid) {
        return `${baseClass} border-red-500 focus:ring-2 focus:ring-red-500`;
    }

    // Si el campo es válido (y ha tenido alguna interacción que genere un mensaje), aplica borde verde
    if (error.isValid && error.message) {
      return `${baseClass} border-green-500 focus:ring-2 focus:ring-green-500`;
    }
    
    // Clase por defecto
    return `${baseClass} border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/50`;
  };

  return (
    // Contenedor principal del formulario, adaptado para encajar en la tarjeta del HTML
    <div className="w-full"> 
        <h2 className="text-3xl font-extrabold mb-6 text-indigo-700 border-b-4 border-indigo-100 pb-3">
            Registro de Cuenta <span className="text-xl">(Validación Dinámica)</span>
        </h2>
        <form onSubmit={handleSubmit} noValidate>
            
            {/* Campo: Nombre (Obligatorio) */}
            <div className="mb-5">
              <label htmlFor="name" className="block text-gray-700 font-semibold mb-2 text-sm">Nombre Completo (*)</label>
              <input
                type="text"
                id="name"
                name="name"
                value={values.name}
                onChange={handleChange}
                className={getInputClass('name')}
                placeholder="Ingrese su nombre"
                required
              />
              {renderValidationFeedback('name')}
            </div>

            {/* Campo: Correo Electrónico (Formato) */}
            <div className="mb-5">
              <label htmlFor="email" className="block text-gray-700 font-semibold mb-2 text-sm">Correo Electrónico (*)</label>
              <input
                type="email"
                id="email"
                name="email"
                value={values.email}
                onChange={handleChange}
                className={getInputClass('email')}
                placeholder="ejemplo@dominio.com"
                required
              />
              {renderValidationFeedback('email')}
            </div>

            {/* Campo: Contraseña (Fortaleza) */}
            <div className="mb-5">
              <label htmlFor="password" className="block text-gray-700 font-semibold mb-2 text-sm">Contraseña (*)</label>
              <input
                type="password"
                id="password"
                name="password"
                value={values.password}
                onChange={handleChange}
                className={getInputClass('password')}
                placeholder="Mín. 8 caracteres, Mayús, Minús, Núm, Símbolo"
                required
              />
              {renderValidationFeedback('password')}
            </div>

            {/* Campo: Confirmar Contraseña (Coincidencia) */}
            <div className="mb-5">
              <label htmlFor="confirmPassword" className="block text-gray-700 font-semibold mb-2 text-sm">Confirmar Contraseña (*)</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={values.confirmPassword}
                onChange={handleChange}
                className={getInputClass('confirmPassword')}
                placeholder="Repita la contraseña"
                required
              />
              {renderValidationFeedback('confirmPassword')}
            </div>

            {/* Campo: Fecha de Nacimiento (Validación de edad) */}
            <div className="mb-5">
              <label htmlFor="dateOfBirth" className="block text-gray-700 font-semibold mb-2 text-sm">Fecha de Nacimiento (*)</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={values.dateOfBirth}
                onChange={handleChange}
                className={getInputClass('dateOfBirth')}
                required
              />
              {renderValidationFeedback('dateOfBirth')}
            </div>

            {/* Campo: Cantidad Numérica (Mayor que cero) */}
            <div className="mb-5">
              <label htmlFor="quantity" className="block text-gray-700 font-semibold mb-2 text-sm">Cantidad Numérica (*)</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={values.quantity === 0 ? '' : values.quantity} // Evita mostrar 0 por defecto
                onChange={handleChange}
                className={getInputClass('quantity')}
                placeholder="Ingrese una cantidad mayor a 0"
                required
                min="1"
              />
              {renderValidationFeedback('quantity')}
            </div>

            {/* Campo: Términos y Condiciones (Obligatorio - Checkbox) */}
            <div className="mb-6">
              <label htmlFor="terms" className="flex items-center text-gray-700 font-semibold text-sm cursor-pointer">
                <input
                  type="checkbox"
                  id="terms"
                  name="terms"
                  checked={values.terms}
                  onChange={handleChange}
                  className="mr-2 h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  required
                />
                Acepto los Términos y Condiciones (*)
              </label>
              {renderValidationFeedback('terms')}
            </div>
            
            {/* Botón de Envío: Deshabilitado si algún campo no es válido */}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              disabled={!Object.values(errors).every(error => error.isValid)}
            >
              Enviar Registro
            </button>
        </form>
    </div>
  );
};

export default App;
