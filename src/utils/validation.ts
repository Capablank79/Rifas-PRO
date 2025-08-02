// Utilidades de validación y seguridad

// Expresiones regulares para validación
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^[\+]?[0-9\s\-\(\)]{8,15}$/;
const NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/;
const SAFE_STRING_REGEX = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-_.,!?()]{1,200}$/;

// Tipos para validación
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FormData {
  name?: string;
  email?: string;
  phone?: string;
  [key: string]: any;
}

// Función para sanitizar strings
export const sanitizeString = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>"'&]/g, '') // Remover caracteres peligrosos
    .replace(/\s+/g, ' ') // Normalizar espacios múltiples a uno solo
    .substring(0, 200); // Limitar longitud
};

// Función para sanitizar email
export const sanitizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') return '';
  
  return email
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9@._+-]/g, '') // Solo caracteres válidos para email
    .substring(0, 100); // Limitar longitud
};

// Función para sanitizar teléfono
export const sanitizePhone = (phone: string): string => {
  if (!phone || typeof phone !== 'string') return '';
  
  return phone
    .trim()
    .replace(/[^0-9\+\-\s\(\)]/g, '') // Solo caracteres válidos para teléfono
    .substring(0, 20); // Limitar longitud
};

// Validación de email
export const validateEmail = (email: string): ValidationResult => {
  const sanitizedEmail = sanitizeEmail(email);
  
  if (!sanitizedEmail) {
    return { isValid: false, error: 'El email es requerido' };
  }
  
  if (sanitizedEmail.length < 5) {
    return { isValid: false, error: 'El email debe tener al menos 5 caracteres' };
  }
  
  if (!EMAIL_REGEX.test(sanitizedEmail)) {
    return { isValid: false, error: 'El formato del email no es válido' };
  }
  
  return { isValid: true };
};

// Validación de teléfono
export const validatePhone = (phone: string): ValidationResult => {
  const sanitizedPhone = sanitizePhone(phone);
  
  if (!sanitizedPhone) {
    return { isValid: false, error: 'El teléfono es requerido' };
  }
  
  if (sanitizedPhone.length < 8) {
    return { isValid: false, error: 'El teléfono debe tener al menos 8 caracteres' };
  }
  
  if (!PHONE_REGEX.test(sanitizedPhone)) {
    return { isValid: false, error: 'El formato del teléfono no es válido' };
  }
  
  return { isValid: true };
};

// Validación de nombre
export const validateName = (name: string): ValidationResult => {
  const sanitizedName = sanitizeString(name);
  
  if (!sanitizedName) {
    return { isValid: false, error: 'El nombre es requerido' };
  }
  
  if (sanitizedName.length < 2) {
    return { isValid: false, error: 'El nombre debe tener al menos 2 caracteres' };
  }
  
  if (sanitizedName.length > 50) {
    return { isValid: false, error: 'El nombre no puede tener más de 50 caracteres' };
  }
  
  if (!NAME_REGEX.test(sanitizedName)) {
    return { isValid: false, error: 'El nombre solo puede contener letras y espacios' };
  }
  
  return { isValid: true };
};

// Validación de string seguro
export const validateSafeString = (input: string, fieldName: string = 'Campo'): ValidationResult => {
  const sanitizedInput = sanitizeString(input);
  
  if (!sanitizedInput) {
    return { isValid: false, error: `${fieldName} es requerido` };
  }
  
  if (!SAFE_STRING_REGEX.test(sanitizedInput)) {
    return { isValid: false, error: `${fieldName} contiene caracteres no válidos` };
  }
  
  return { isValid: true };
};

// Validación de número positivo
export const validatePositiveNumber = (value: any, fieldName: string = 'Número'): ValidationResult => {
  const num = Number(value);
  
  if (isNaN(num)) {
    return { isValid: false, error: `${fieldName} debe ser un número válido` };
  }
  
  if (num <= 0) {
    return { isValid: false, error: `${fieldName} debe ser mayor que 0` };
  }
  
  if (num > 1000000) {
    return { isValid: false, error: `${fieldName} es demasiado grande` };
  }
  
  return { isValid: true };
};

// Validación de rango de números
export const validateNumberRange = (value: any, min: number, max: number, fieldName: string = 'Número'): ValidationResult => {
  const num = Number(value);
  
  if (isNaN(num)) {
    return { isValid: false, error: `${fieldName} debe ser un número válido` };
  }
  
  if (num < min || num > max) {
    return { isValid: false, error: `${fieldName} debe estar entre ${min} y ${max}` };
  }
  
  return { isValid: true };
};

// Validación completa de formulario de comprador
export const validateBuyerForm = (data: FormData): ValidationResult => {
  // Validar nombre
  const nameValidation = validateName(data.name || '');
  if (!nameValidation.isValid) {
    return nameValidation;
  }
  
  // Validar email
  const emailValidation = validateEmail(data.email || '');
  if (!emailValidation.isValid) {
    return emailValidation;
  }
  
  // Validar teléfono
  const phoneValidation = validatePhone(data.phone || '');
  if (!phoneValidation.isValid) {
    return phoneValidation;
  }
  
  return { isValid: true };
};

// Validación de formulario de vendedor
export const validateVendorForm = (data: FormData): ValidationResult => {
  return validateBuyerForm(data); // Mismas validaciones por ahora
};

// Función para prevenir XSS
export const escapeHtml = (text: string): string => {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

// Función para validar IDs
export const validateId = (id: string, fieldName: string = 'ID'): ValidationResult => {
  if (!id || typeof id !== 'string') {
    return { isValid: false, error: `${fieldName} es requerido` };
  }
  
  const sanitizedId = id.trim();
  
  if (sanitizedId.length === 0) {
    return { isValid: false, error: `${fieldName} no puede estar vacío` };
  }
  
  if (sanitizedId.length > 50) {
    return { isValid: false, error: `${fieldName} es demasiado largo` };
  }
  
  // Validar que solo contenga caracteres alfanuméricos y guiones
  if (!/^[a-zA-Z0-9\-_]+$/.test(sanitizedId)) {
    return { isValid: false, error: `${fieldName} contiene caracteres no válidos` };
  }
  
  return { isValid: true };
};

// Función para validar arrays de números seleccionados
export const validateSelectedNumbers = (numbers: number[], maxNumbers: number = 1000): ValidationResult => {
  if (!Array.isArray(numbers)) {
    return { isValid: false, error: 'Los números seleccionados deben ser un array' };
  }
  
  if (numbers.length === 0) {
    return { isValid: false, error: 'Debe seleccionar al menos un número' };
  }
  
  if (numbers.length > 50) {
    return { isValid: false, error: 'No puede seleccionar más de 50 números a la vez' };
  }
  
  // Validar que todos sean números válidos
  for (const num of numbers) {
    if (!Number.isInteger(num) || num < 1 || num > maxNumbers) {
      return { isValid: false, error: `Número ${num} no es válido` };
    }
  }
  
  // Validar que no haya duplicados
  const uniqueNumbers = new Set(numbers);
  if (uniqueNumbers.size !== numbers.length) {
    return { isValid: false, error: 'No puede seleccionar números duplicados' };
  }
  
  return { isValid: true };
};

// Función para validar datos de sessionStorage
export const validateSessionData = (data: any, requiredFields: string[]): ValidationResult => {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Datos de sesión inválidos' };
  }
  
  for (const field of requiredFields) {
    if (!data[field]) {
      return { isValid: false, error: `Campo requerido faltante: ${field}` };
    }
  }
  
  return { isValid: true };
};

// Rate limiting simple (en memoria)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

export const checkRateLimit = (identifier: string, maxRequests: number = 10, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now - record.lastReset > windowMs) {
    rateLimitMap.set(identifier, { count: 1, lastReset: now });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
};

// Función para limpiar datos de entrada
export const sanitizeFormData = (data: FormData): FormData => {
  const sanitized: FormData = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      switch (key) {
        case 'email':
          sanitized[key] = sanitizeEmail(value);
          break;
        case 'phone':
          sanitized[key] = sanitizePhone(value);
          break;
        default:
          sanitized[key] = sanitizeString(value);
      }
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};