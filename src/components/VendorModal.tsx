import { useState, FormEvent } from 'react';
import { useRaffle } from '../context/RaffleContext';
import { generateId } from '../utils/helpers';
import { Vendor } from '../types';
import { 
  validateVendorForm, 
  validateId, 
  sanitizeFormData, 
  checkRateLimit 
} from '../utils/validation';
import LoadingSpinner from './LoadingSpinner';

interface VendorModalProps {
  raffleId: string;
  onClose: () => void;
  numbersPerVendor: number;
  raffleName: string;
}

const VendorModal = ({ raffleId, onClose, numbersPerVendor, raffleName }: VendorModalProps) => {
  const { addVendor } = useRaffle();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [createdVendorId, setCreatedVendorId] = useState('');
  
  // Estados para validación en tiempo real
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Función para mostrar toast notifications
  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    const event = new CustomEvent('show-toast', {
      detail: { type, title, message }
    });
    window.dispatchEvent(event);
  };

  // Función para obtener clases de input dinámicamente
  const getInputClass = (fieldName: keyof typeof fieldErrors) => {
    const baseClass = 'form-control';
    if (fieldErrors[fieldName]) {
      return `${baseClass} is-invalid`;
    }
    if (formData[fieldName] && !fieldErrors[fieldName]) {
      return `${baseClass} is-valid`;
    }
    return baseClass;
  };

  // Validación en tiempo real
  const validateField = (name: string, value: string) => {
    let error = '';
    
    switch (name) {
      case 'name':
        if (!value.trim()) {
          error = 'El nombre es requerido';
        } else if (value.trim().length < 2) {
          error = 'El nombre debe tener al menos 2 caracteres';
        } else if (value.trim().length > 50) {
          error = 'El nombre no puede exceder 50 caracteres';
        }
        break;
      case 'email':
        if (!value.trim()) {
          error = 'El email es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Formato de email inválido';
        }
        break;
      case 'phone':
        if (!value.trim()) {
          error = 'El teléfono es requerido';
        } else if (!/^\+?[\d\s\-\(\)]{8,15}$/.test(value)) {
          error = 'Formato de teléfono inválido';
        }
        break;
    }
    
    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Sanitizar la entrada en tiempo real
    const sanitizedData = sanitizeFormData({ [name]: value });
    
    setFormData({
      ...formData,
      [name]: sanitizedData[name],
    });

    // Validar campo en tiempo real
    validateField(name, sanitizedData[name] || '');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Prevenir múltiples envíos
    if (isLoading) {
      return;
    }
    
    setIsLoading(true);
    setError('');

    // Rate limiting - prevenir spam de formularios
    const clientId = `vendor-${raffleId}-${Date.now()}`;
    if (!checkRateLimit(clientId, 3, 60000)) {
      const errorMsg = 'Demasiados intentos. Por favor, espera un momento antes de intentar nuevamente.';
      setError(errorMsg);
      showToast('warning', 'Límite de intentos', errorMsg);
      setIsLoading(false);
      return;
    }

    // Verificar errores de validación
    const hasErrors = Object.values(fieldErrors).some(error => error !== '');
    if (hasErrors) {
      showToast('error', 'Errores de validación', 'Por favor, corrige los errores en el formulario');
      setIsLoading(false);
      return;
    }

    // Validar ID de rifa
    const raffleIdValidation = validateId(raffleId, 'ID de rifa');
    if (!raffleIdValidation.isValid) {
      const errorMsg = raffleIdValidation.error || 'ID de rifa inválido';
      setError(errorMsg);
      showToast('error', 'Error de validación', errorMsg);
      setIsLoading(false);
      return;
    }

    // Sanitizar datos del formulario
    const sanitizedFormData = sanitizeFormData(formData);

    // Validar formulario de vendedor
    const formValidation = validateVendorForm(sanitizedFormData);
    if (!formValidation.isValid) {
      const errorMsg = formValidation.error || 'Datos del formulario inválidos';
      setError(errorMsg);
      showToast('error', 'Error de validación', errorMsg);
      setIsLoading(false);
      return;
    }

    try {
      // Crear nuevo vendedor
      const vendorId = generateId();
      const vendorLink = `${window.location.origin}/sell/${raffleId}/${vendorId}`;
      const newVendor: Vendor = {
        id: vendorId,
        raffleId,
        name: sanitizedFormData.name || '',
        email: sanitizedFormData.email || '',
        phone: sanitizedFormData.phone || '',
        salesCount: 0,
        link: vendorLink,
      };

      // Guardar en el contexto
      addVendor(newVendor);

      // Guardar el ID del vendedor creado para mostrar el enlace
      setCreatedVendorId(vendorId);
      setEmailSent(true);
      setIsLoading(false);
      
      showToast('success', '¡Vendedor creado!', `Se ha creado el vendedor ${sanitizedFormData.name} exitosamente`);
      
      // Cerrar el modal después de 2 segundos
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      const errorMsg = 'Error al crear el vendedor. Por favor, intenta nuevamente.';
      setError(errorMsg);
      showToast('error', 'Error', errorMsg);
      setIsLoading(false);
    }
  };

  return (
    <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Añadir Nuevo Vendedor</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
            {emailSent && (
              <div className="alert alert-success">
                <p>¡Vendedor guardado correctamente!</p>
                <p>Enlace de venta:</p>
                <div className="input-group mb-3">
                  <input 
                    type="text" 
                    className="form-control" 
                    value={`${window.location.origin}/sell/${raffleId}/${createdVendorId}`} 
                    readOnly 
                  />
                  <button 
                    className="btn btn-outline-secondary" 
                    type="button"
                    onClick={() => {
                      const vendorLink = `${window.location.origin}/sell/${raffleId}/${createdVendorId}`;
                      navigator.clipboard.writeText(vendorLink);
                      alert('Enlace copiado al portapapeles');
                    }}
                  >
                    Copiar
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  className={getInputClass('name')}
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                {fieldErrors.name && (
                  <div className="invalid-feedback">
                    {fieldErrors.name}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  className={getInputClass('email')}
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                {fieldErrors.email && (
                  <div className="invalid-feedback">
                    {fieldErrors.email}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="phone" className="form-label">
                  Teléfono
                </label>
                <input
                  type="tel"
                  className={getInputClass('phone')}
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
                {fieldErrors.phone && (
                  <div className="invalid-feedback">
                    {fieldErrors.phone}
                  </div>
                )}
              </div>

              <div className="alert alert-info">
                <p className="mb-0">
                  <strong>Información:</strong> Este vendedor recibirá una cartilla virtual con{' '}
                  {numbersPerVendor} números para vender.
                </p>
              </div>

              <div className="d-grid gap-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading || emailSent}
                  style={{ pointerEvents: isLoading || emailSent ? 'none' : 'auto' }}
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" text="Guardando..." />
                  ) : emailSent ? (
                    'Vendedor Creado ✓'
                  ) : (
                    'Guardar Vendedor'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorModal;