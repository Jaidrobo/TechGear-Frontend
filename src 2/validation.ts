/// validation.ts

// Tipo para el resultado de cualquier validación
export type ValidationResult = {
  isValid: boolean;
  message: string;
};

// Constantes
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Regex para fortaleza: Mín. 8 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número y 1 símbolo
const PASSWORD_STRENGTH_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const MIN_AGE_YEARS = 18;

// --- Funciones de Validación Reutilizables ---

export const validateRequired = (value: string | number | boolean | null | undefined): ValidationResult => {
  if (value === null || value === undefined || value === false) {
    return { isValid: false, message: "Este campo es obligatorio." };
  }
  if (typeof value === 'string' && value.trim() === '') {
    return { isValid: false, message: "Este campo es obligatorio." };
  }
  return { isValid: true, message: "" };
};

export const validateEmail = (email: string): ValidationResult => {
  const required = validateRequired(email);
  if (!required.isValid) return required;
  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, message: "Formato de correo electrónico inválido." };
  }
  return { isValid: true, message: "Correo válido." };
};

export const validatePasswordStrength = (password: string): ValidationResult => {
  const required = validateRequired(password);
  if (!required.isValid) return required;

  if (password.length < 8) {
    return { isValid: false, message: "La contraseña debe tener al menos 8 caracteres." };
  }
  if (!PASSWORD_STRENGTH_REGEX.test(password)) {
    return { isValid: false, message: "Debe incluir mayúsculas, minúsculas, un número y un símbolo especial." };
  }
  return { isValid: true, message: "Contraseña fuerte." };
};

export const validatePasswordMatch = (password: string, confirmPassword: string): ValidationResult => {
  const required = validateRequired(confirmPassword);
  if (!required.isValid) {
    return { isValid: false, message: "Confirme su contraseña." };
  }
  if (password !== confirmPassword) {
    return { isValid: false, message: "Las contraseñas no coinciden." };
  }
  return { isValid: true, message: "Las contraseñas coinciden." };
};

export const validateDateOfBirth = (dateString: string): ValidationResult => {
  const required = validateRequired(dateString);
  if (!required.isValid) return required;

  const dateOfBirth = new Date(dateString);
  if (isNaN(dateOfBirth.getTime())) {
    return { isValid: false, message: "Fecha de nacimiento inválida." };
  }

  const today = new Date();
  const minDate = new Date();
  // Calcula la fecha mínima (Hoy - 18 años)
  minDate.setFullYear(today.getFullYear() - MIN_AGE_YEARS);

  if (dateOfBirth > minDate) {
    return { isValid: false, message: `Debe ser mayor de ${MIN_AGE_YEARS} años.` };
  }
  return { isValid: true, message: "Fecha válida." };
};

export const validateNumericQuantity = (value: number | string): ValidationResult => {
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

// --- Tipado y Validación General del Formulario ---

export interface FormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  quantity: number | string;
  terms: boolean;
}

// Función para validar todo el formulario al momento de enviar
export const validateForm = (values: FormValues): Record<keyof FormValues, ValidationResult> => {
  return {
    name: validateRequired(values.name),
    email: validateEmail(values.email),
    password: validatePasswordStrength(values.password),
    // Pasa ambas contraseñas para la validación de coincidencia
    confirmPassword: validatePasswordMatch(values.password, values.confirmPassword),
    dateOfBirth: validateDateOfBirth(values.dateOfBirth),
    quantity: validateNumericQuantity(values.quantity),
    terms: values.terms ? { isValid: true, message: "" } : { isValid: false, message: "Debe aceptar los términos." },
  };
};