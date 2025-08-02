import { useState, FormEvent, useEffect } from 'react';
import { useRaffle } from '../context/RaffleContext';
import { Vendor } from '../types';
import { 
  validateVendorForm, 
  validateId, 
  sanitizeFormData, 
  checkRateLimit 
} from '../utils/validation';
import LoadingSpinner from './LoadingSpinner';

interface EditVendorModalProps {
  vendor: Vendor;
  onClose: () => void;
  onSuccess: () => void;
}

const EditVendorModal = ({ vendor, onClose, onSuccess }: EditVendorModalProps) => {
  const { updateVendor } = useRaffle();

  const [formData, setFormData] = useState({
    name: vendor.name,
    email: vendor.email,
    phone: vendor.phone,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [fieldValidation, setFieldValidation] = useState<Record<string, boolean>>({});

  // Función para mostrar toasts
  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { type, title, message }
    }));
  };

  // Validación en tiempo real
  const validateField = (name: string, value: string) => {
    let isValid = true;
    let errorMessage = '';

    switch (name) {
      case 'name':
        if (!value.trim()) {
          isValid = false;
          errorMessage = 'El nombre es requerido';
        } else if (value.trim().length < 2) {
          isValid = false;
          errorMessage = 'El nombre debe tener al menos 2 caracteres';
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          isValid = false;
          errorMessage = 'El email es requerido';
        } else if (!emailRegex.test(value)) {
          isValid = false;
          errorMessage = 'Formato de email inválido';
        }
        break;
      case 'phone':
        if (!value.trim()) {
          isValid = false;
          errorMessage = 'El teléfono es requerido';
        } else if (value.trim().length < 8) {
          isValid = false;
          errorMessage = 'El teléfono debe tener al menos 8 dígitos';
        }
        break;
    }

    setFieldValidation(prev => ({ ...prev, [name]: isValid }));
    setErrors(prev => ({ ...prev, [name]: errorMessage }));
    
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Sanitizar datos
    const sanitizedData = sanitizeFormData({ [name]: value });
    const sanitizedValue = sanitizedData[name];
    
    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));

    // Validar campo en tiempo real
    validateField(name, sanitizedValue);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Verificar rate limiting
    if (!checkRateLimit('edit-vendor', 2000)) {
      showToast('warning', 'Acción muy rápida', 'Por favor espera un momento antes de intentar nuevamente');
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Validar formulario completo
      const validation = validateVendorForm(formData);
      if (!validation.isValid) {
        // Como validateVendorForm retorna un solo error, lo mostramos como toast
        showToast('error', 'Error de validación', validation.error || 'Por favor corrige los errores en el formulario');
        return;
      }

      // Validar ID del vendedor
      if (!validateId(vendor.id)) {
        showToast('error', 'Error', 'ID de vendedor inválido');
        return;
      }

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Actualizar vendedor
      const updatedVendor: Vendor = {
        ...vendor,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
      };

      updateVendor(updatedVendor);
      
      setSuccess(true);
      showToast('success', '¡Éxito!', 'Los datos del vendedor han sido actualizados correctamente');
      
      // Cerrar modal después de un breve delay
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Error al actualizar vendedor:', error);
      showToast('error', 'Error', 'No se pudo actualizar el vendedor. Inténtalo nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const getInputClass = (fieldName: string) => {
    let baseClass = 'form-control';
    
    if (fieldValidation[fieldName] === true) {
      baseClass += ' is-valid';
    } else if (fieldValidation[fieldName] === false) {
      baseClass += ' is-invalid';
    }
    
    return baseClass;
  };

  return (
    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-pencil-square me-2"></i>
              Editar Datos del Vendedor
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={isLoading}
              aria-label="Close"
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {success && (
                <div className="alert alert-success fade-in" role="alert">
                  <i className="bi bi-check-circle me-2"></i>
                  ¡Datos actualizados correctamente!
                </div>
              )}

              <div className="mb-3">
                <label htmlFor="edit-name" className="form-label">
                  <i className="bi bi-person me-1"></i>
                  Nombre del Vendedor *
                </label>
                <input
                  type="text"
                  className={getInputClass('name')}
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isLoading || success}
                  placeholder="Ingresa el nombre completo"
                />
                {errors.name && (
                  <div className="invalid-feedback">
                    {errors.name}
                  </div>
                )}
                {fieldValidation.name === true && (
                  <div className="valid-feedback">
                    ¡Nombre válido!
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="edit-email" className="form-label">
                  <i className="bi bi-envelope me-1"></i>
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  className={getInputClass('email')}
                  id="edit-email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading || success}
                  placeholder="ejemplo@correo.com"
                />
                {errors.email && (
                  <div className="invalid-feedback">
                    {errors.email}
                  </div>
                )}
                {fieldValidation.email === true && (
                  <div className="valid-feedback">
                    ¡Email válido!
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="edit-phone" className="form-label">
                  <i className="bi bi-telephone me-1"></i>
                  Teléfono *
                </label>
                <input
                  type="tel"
                  className={getInputClass('phone')}
                  id="edit-phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  disabled={isLoading || success}
                  placeholder="+56 9 1234 5678"
                />
                {errors.phone && (
                  <div className="invalid-feedback">
                    {errors.phone}
                  </div>
                )}
                {fieldValidation.phone === true && (
                  <div className="valid-feedback">
                    ¡Teléfono válido!
                  </div>
                )}
              </div>

              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                <strong>Nota:</strong> Los datos críticos como ID, código de vendedor y enlaces de venta no pueden ser modificados por seguridad.
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`btn btn-primary ${isLoading ? 'btn-loading' : ''}`}
                disabled={isLoading || success}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" color="light" text="" />
                    <span className="ms-2">Actualizando...</span>
                  </>
                ) : success ? (
                  <>
                    <i className="bi bi-check-lg me-2"></i>
                    Actualizado
                  </>
                ) : (
                  <>
                    <i className="bi bi-save me-2"></i>
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditVendorModal;