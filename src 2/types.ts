// src/types.ts

// Define la estructura para un campo individual del formulario
export interface FormField {
  value: string;
  error: string | null; // null si no hay error
  isValid: boolean;
}

// Define la estructura completa del estado del formulario
export interface FormState {
  name: FormField;
  email: FormField;
  password: FormField;
  confirmPassword: FormField;
  dob: FormField; // Fecha de Nacimiento (Date of Birth)
  quantity: FormField; // Cantidad numérica
  [key: string]: FormField; // Permite acceso dinámico por nombre de campo
}

// Define la estructura para el mensaje de alerta general
export interface AlertMessage {
  type: 'success' | 'error' | 'info';
  message: string;
}

// Describe las posibles reglas de validación para un campo.
export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  pattern?: RegExp; // Para formatos como la fortaleza de la contraseña
  isEmail?: boolean;
  isValidDate?: boolean; // Para asegurar que la fecha no sea en el futuro
  min?: number; // Para campos numéricos
  max?: number; // Para campos numéricos
  // Validación personalizada para casos complejos (ej. contraseñas iguales)
  custom?: (value: any, allValues?: any) => string | null;
}

// Un objeto que mapea el nombre de cada campo del formulario a sus reglas.
export type FormValidationRules<T> = {
  [K in keyof T]?: ValidationRules;
};

// Un objeto para guardar los mensajes de error de cada campo.
export type FormErrors<T> = {
  [K in keyof T]?: string;
};