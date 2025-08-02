import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRaffle } from '../context/RaffleContext';
import { Buyer } from '../types';
import { generateId, formatDate } from '../utils/helpers';
import { 
  validateBuyerForm, 
  validateSelectedNumbers, 
  validateId, 
  sanitizeFormData, 
  checkRateLimit 
} from '../utils/validation';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmationModal from '../components/ConfirmationModal';

const BuyerPage = () => {
  const { raffleId, vendorId } = useParams<{ raffleId: string; vendorId: string }>();
  const navigate = useNavigate();
  const { 
    getRaffleById, 
    getVendorsByRaffleId,
    getBuyersByVendorId,
    addBuyer 
  } = useRaffle();

  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [buyerData, setBuyerData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  
  // Estados para validación en tiempo real
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  // Estados para modal de confirmación
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

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
    if (buyerData[fieldName] && !fieldErrors[fieldName]) {
      return `${baseClass} is-valid`;
    }
    return baseClass;
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
        } else if (value.trim().length > 50) {
          isValid = false;
          errorMessage = 'El nombre no puede exceder 50 caracteres';
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
        const phoneRegex = /^[+]?[\d\s\-()]{8,15}$/;
        if (!value.trim()) {
          isValid = false;
          errorMessage = 'El teléfono es requerido';
        } else if (!phoneRegex.test(value)) {
          isValid = false;
          errorMessage = 'Formato de teléfono inválido';
        }
        break;
    }

    setFieldErrors(prev => ({
      ...prev,
      [name]: errorMessage
    }));

    return isValid;
  };

  const raffle = raffleId ? getRaffleById(raffleId) : null;
  const vendors = raffleId ? getVendorsByRaffleId(raffleId) : [];
  const vendor = vendors.find(v => v.id === vendorId);
  
  // Obtener solo los compradores de este vendedor específico
  const vendorBuyers = vendorId ? getBuyersByVendorId(vendorId) : [];
  const soldNumbers = vendorBuyers.flatMap(buyer => buyer.numbers);

  // Generar números disponibles solo para este vendedor (su cartón independiente)
  const totalNumbers = raffle ? raffle.numbersPerVendor : 0;
  const availableNumbers = Array.from({ length: totalNumbers }, (_, i) => i + 1)
    .filter(num => !soldNumbers.includes(num));

  useEffect(() => {
    if (!raffle || !vendor) {
      setError('Enlace inválido o rifa no encontrada');
    }
  }, [raffle, vendor]);

  const handleNumberSelect = (number: number) => {
    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== number));
    } else {
      setSelectedNumbers([...selectedNumbers, number]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Para el campo nombre, preservar espacios completamente
    if (name === 'name') {
      setBuyerData(prev => ({
        ...prev,
        [name]: value, // Preservar el valor exacto incluyendo espacios
      }));
      
      // Validar el campo en tiempo real sin sanitización para preservar espacios
      validateField(name, value);
    } else {
      // Para otros campos, aplicar sanitización normal
      const sanitizedData = sanitizeFormData({ [name]: value });
      
      setBuyerData(prev => ({
        ...prev,
        [name]: sanitizedData[name],
      }));

      // Validar campo en tiempo real
      validateField(name, sanitizedData[name] || '');
    }
  };

  const handlePurchase = async () => {
    // Rate limiting - prevenir spam de formularios
    const clientId = `buyer-${raffleId}-${vendorId}-${Date.now()}`;
    if (!checkRateLimit(clientId, 3, 60000)) {
      const errorMsg = 'Demasiados intentos. Por favor, espera un momento antes de intentar nuevamente.';
      setError(errorMsg);
      showToast('warning', 'Límite de intentos', errorMsg);
      return;
    }

    // Verificar errores de validación
    const hasErrors = Object.values(fieldErrors).some(error => error !== '');
    if (hasErrors) {
      showToast('error', 'Errores en el formulario', 'Por favor corrige los errores antes de continuar');
      return;
    }

    // Validar IDs
    const raffleIdValidation = validateId(raffleId || '', 'ID de rifa');
    if (!raffleIdValidation.isValid) {
      const errorMsg = raffleIdValidation.error || 'ID de rifa inválido';
      setError(errorMsg);
      showToast('error', 'Error de validación', errorMsg);
      return;
    }

    const vendorIdValidation = validateId(vendorId || '', 'ID de vendedor');
    if (!vendorIdValidation.isValid) {
      const errorMsg = vendorIdValidation.error || 'ID de vendedor inválido';
      setError(errorMsg);
      showToast('error', 'Error de validación', errorMsg);
      return;
    }

    // Verificar que tenemos datos válidos
    if (!raffle || !vendor) {
      const errorMsg = 'Datos de rifa o vendedor no encontrados';
      setError(errorMsg);
      showToast('error', 'Error de datos', errorMsg);
      return;
    }

    // Sanitizar datos del formulario preservando espacios en el nombre
    const sanitizedBuyerData = {
      ...sanitizeFormData(buyerData),
      name: buyerData.name.trim() // Solo quitar espacios al inicio y final, preservar espacios internos
    };

    // Validar formulario de comprador
    const formValidation = validateBuyerForm(sanitizedBuyerData);
    if (!formValidation.isValid) {
      const errorMsg = formValidation.error || 'Datos del formulario inválidos';
      setError(errorMsg);
      showToast('error', 'Error de validación', errorMsg);
      return;
    }

    // Validar números seleccionados
    const numbersValidation = validateSelectedNumbers(selectedNumbers, raffle.numbersPerVendor);
    if (!numbersValidation.isValid) {
      const errorMsg = numbersValidation.error || 'Números seleccionados inválidos';
      setError(errorMsg);
      showToast('error', 'Error de selección', errorMsg);
      return;
    }

    // Mostrar modal de confirmación
    setConfirmAction(() => async () => {
      setIsLoading(true);
      setError('');

      try {
        // Simular proceso de pago
        await new Promise(resolve => setTimeout(resolve, 2000));

        const newBuyer: Buyer = {
          id: generateId(),
          vendorId: vendor.id,
          raffleId: raffle.id,
          name: sanitizedBuyerData.name || '',
          email: sanitizedBuyerData.email || '',
          phone: sanitizedBuyerData.phone || '',
          numbers: selectedNumbers,
          purchaseDate: new Date().toISOString()
        };

        // Guardar en el contexto
        addBuyer(newBuyer);

        showToast('success', '¡Compra exitosa!', 'Redirigiendo al sistema de pago...');

        // Redirigir a página de pago (Webpay)
        navigate('/webpay', {
          state: {
            buyer: newBuyer,
            raffle: raffle,
            vendor: vendor,
            totalAmount: selectedNumbers.length * raffle.pricePerNumber,
            userType: 'buyer' // Identificar que es un comprador
          }
        });
      } catch (error) {
        const errorMsg = 'Error al procesar la compra. Inténtalo nuevamente.';
        setError(errorMsg);
        showToast('error', 'Error de compra', errorMsg);
      } finally {
        setIsLoading(false);
      }
    });

    setShowConfirmModal(true);
  };

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('es-CL')}`;
  };

  if (error && (!raffle || !vendor)) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="alert alert-danger text-center">
              <i className="bi bi-exclamation-triangle fs-1 mb-3"></i>
              <h4>Enlace no válido</h4>
              <p>El enlace que has seguido no es válido o la rifa ya no está disponible.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!raffle || !vendor) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <LoadingSpinner size="lg" text="Cargando rifa..." />
        </div>
      </div>
    );
  }

  // Verificar si la rifa ya fue sorteada
  if (raffle && raffle.status === 'completed') {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="alert alert-warning text-center">
              <h4 className="alert-heading">¡Rifa ya sorteada!</h4>
              <p className="mb-3">
                Esta rifa ya fue sorteada y no se pueden comprar más números.
              </p>
              <hr />
              <p className="mb-0">
                Los ganadores ya han sido notificados. Gracias por tu interés.
              </p>
              <button className="btn btn-primary mt-3" onClick={() => navigate('/')}>
                Volver al Inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          {/* Header de la rifa */}
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <div className="row align-items-center">
                <div className="col">
                  <h3 className="mb-0">
                    <i className="bi bi-gift me-2"></i>
                    {raffle.name}
                  </h3>
                  <small>Vendedor: {vendor.name}</small>
                </div>
                <div className="col-auto">
                  <div className="text-end">
                    <div className="fs-5 fw-bold">{formatPrice(raffle.pricePerNumber)}</div>
                    <small>por número</small>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Fecha del sorteo:</strong> {formatDate(raffle.raffleDate)}</p>
                  <p><strong>Números disponibles:</strong> {availableNumbers.length} de {totalNumbers}</p>
                </div>
                <div className="col-md-6">
                  {raffle.description && (
                    <p><strong>Descripción:</strong> {raffle.description}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Premios */}
          {raffle.prizes && raffle.prizes.length > 0 && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="bi bi-trophy me-2"></i>
                  Premios
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {raffle.prizes.map((prize, index) => (
                    <div key={prize.id} className="col-md-6 mb-3">
                      <div className="d-flex align-items-center">
                        <div className="me-3">
                          <span className="badge bg-warning text-dark fs-6">
                            {index + 1}°
                          </span>
                        </div>
                        {prize.image && (
                          <img
                            src={prize.image}
                            alt={prize.name}
                            className="me-3 rounded"
                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                          />
                        )}
                        <div>
                          <h6 className="mb-1">{prize.name}</h6>
                          {prize.description && (
                            <small className="text-muted">{prize.description}</small>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Selección de números */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-grid-3x3-gap me-2"></i>
                Selecciona tus números
              </h5>
              {selectedNumbers.length > 0 && (
                <small className="text-muted">
                  {selectedNumbers.length} número(s) seleccionado(s) - Total: {formatPrice(selectedNumbers.length * raffle.pricePerNumber)}
                </small>
              )}
            </div>
            <div className="card-body">
              {availableNumbers.length === 0 ? (
                <div className="alert alert-warning text-center">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  No hay números disponibles en este momento.
                </div>
              ) : (
                <>
                  <div className="row g-2 mb-3">
                    {Array.from({ length: totalNumbers }, (_, i) => i + 1).map(number => {
                      const isAvailable = availableNumbers.includes(number);
                      const isSelected = selectedNumbers.includes(number);
                      const isSold = soldNumbers.includes(number);
                      
                      return (
                        <div key={number} className="col-2 col-sm-1">
                          <button
                            className={`btn btn-sm w-100 ${
                              isSold 
                                ? 'btn-secondary disabled' 
                                : isSelected 
                                  ? 'btn-success' 
                                  : 'btn-outline-primary'
                            }`}
                            onClick={() => isAvailable && handleNumberSelect(number)}
                            disabled={!isAvailable}
                            style={{ fontSize: '0.8rem' }}
                          >
                            {number}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="d-flex gap-3 mb-3">
                    <div className="d-flex align-items-center">
                      <div className="btn btn-outline-primary btn-sm me-2" style={{ width: '30px', height: '30px' }}></div>
                      <small>Disponible</small>
                    </div>
                    <div className="d-flex align-items-center">
                      <div className="btn btn-success btn-sm me-2" style={{ width: '30px', height: '30px' }}></div>
                      <small>Seleccionado</small>
                    </div>
                    <div className="d-flex align-items-center">
                      <div className="btn btn-secondary btn-sm me-2" style={{ width: '30px', height: '30px' }}></div>
                      <small>Vendido</small>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Botón de compra */}
          {selectedNumbers.length > 0 && !showPurchaseForm && (
            <div className="card mb-4">
              <div className="card-body text-center">
                <h5>Resumen de compra</h5>
                <p>
                  <strong>Números seleccionados:</strong> {selectedNumbers.join(', ')}
                </p>
                <p>
                  <strong>Total a pagar:</strong> {formatPrice(selectedNumbers.length * raffle.pricePerNumber)}
                </p>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => setShowPurchaseForm(true)}
                >
                  <i className="bi bi-cart-plus me-2"></i>
                  Proceder con la compra
                </button>
              </div>
            </div>
          )}

          {/* Formulario de compra */}
          {showPurchaseForm && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="bi bi-person me-2"></i>
                  Datos del comprador
                </h5>
              </div>
              <div className="card-body">
                {error && (
                  <div className="alert alert-danger">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}
                
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="name" className="form-label">Nombre completo *</label>
                    <input
                      type="text"
                      className={getInputClass('name')}
                      id="name"
                      name="name"
                      value={buyerData.name}
                      onChange={handleInputChange}
                      required
                    />
                    {fieldErrors.name && (
                      <div className="invalid-feedback">
                        {fieldErrors.name}
                      </div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="email" className="form-label">Email *</label>
                    <input
                      type="email"
                      className={getInputClass('email')}
                      id="email"
                      name="email"
                      value={buyerData.email}
                      onChange={handleInputChange}
                      required
                    />
                    {fieldErrors.email && (
                      <div className="invalid-feedback">
                        {fieldErrors.email}
                      </div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="phone" className="form-label">Teléfono *</label>
                    <input
                      type="tel"
                      className={getInputClass('phone')}
                      id="phone"
                      name="phone"
                      value={buyerData.phone}
                      onChange={handleInputChange}
                      required
                    />
                    {fieldErrors.phone && (
                      <div className="invalid-feedback">
                        {fieldErrors.phone}
                      </div>
                    )}
                  </div>
                </div>

                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>Resumen:</strong> {selectedNumbers.length} número(s) por {formatPrice(selectedNumbers.length * raffle.pricePerNumber)}
                </div>

                <div className="d-flex gap-2">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowPurchaseForm(false)}
                    disabled={isLoading}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Volver
                  </button>
                  <button
                    className="btn btn-success flex-grow-1"
                    onClick={handlePurchase}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <LoadingSpinner size="sm" text="Procesando..." />
                    ) : (
                      <>
                        <i className="bi bi-credit-card me-2"></i>
                        Confirmar compra
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        title="Confirmar compra"
        message={`¿Estás seguro de que deseas comprar ${selectedNumbers.length} número(s) por ${formatPrice(selectedNumbers.length * (raffle?.pricePerNumber || 0))}?`}
        confirmText="Confirmar compra"
        cancelText="Cancelar"
        onConfirm={() => {
          setShowConfirmModal(false);
          if (confirmAction) {
            confirmAction();
          }
        }}
        onCancel={() => {
          setShowConfirmModal(false);
          setConfirmAction(null);
        }}
      />
    </div>
  );
};

export default BuyerPage;