import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRaffle } from '../context/RaffleContext';
import { formatPrice, generateId } from '../utils/helpers';
import { 
  validateBuyerForm, 
  validateSelectedNumbers, 
  validateId, 
  sanitizeFormData, 
  checkRateLimit,
  ValidationResult 
} from '../utils/validation';
import { Buyer, NumberStatus, Prize } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmationModal from '../components/ConfirmationModal';

// Declaración global para Bootstrap
declare global {
  interface Window {
    bootstrap: any;
  }
}

const SellPage = () => {
  const { raffleId, vendorId } = useParams<{ raffleId: string; vendorId: string }>();
  const navigate = useNavigate();
  const { getRaffleById, getVendorsByRaffleId, addBuyer, getBuyersByVendorId } = useRaffle();

  const [numberStatus, setNumberStatus] = useState<NumberStatus[]>([]);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [buyerData, setBuyerData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Estados para almacenar los datos de la rifa y el vendedor
  const [raffle, setRaffle] = useState<any>(null);
  const [vendor, setVendor] = useState<any>(null);
  const [existingBuyers, setExistingBuyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para validación en tiempo real y UX mejorada
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
  }>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

  // Función para mostrar notificaciones toast
  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'error') => {
    const title = type === 'success' ? 'Éxito' : type === 'warning' ? 'Advertencia' : 'Error';
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { type, title, message }
    }));
  };

  // Función para obtener clases CSS dinámicas para inputs
  const getInputClass = (fieldName: string) => {
    const baseClass = 'form-control';
    if (fieldErrors[fieldName as keyof typeof fieldErrors]) {
      return `${baseClass} is-invalid`;
    }
    return baseClass;
  };

  // Función para validar campos en tiempo real
  const validateField = (name: string, value: string) => {
    let error = '';

    switch (name) {
      case 'name':
        if (!value.trim()) {
          error = 'El nombre es requerido';
        } else if (value.trim().length < 2) {
          error = 'El nombre debe tener al menos 2 caracteres';
        } else if (value.trim().length > 100) {
          error = 'El nombre no puede exceder 100 caracteres';
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

    return !error;
  };

  // Memoizar cálculos costosos
  const totalPrice = useMemo(() => {
    return raffle ? selectedNumbers.length * raffle.pricePerNumber : 0;
  }, [selectedNumbers.length, raffle?.pricePerNumber]);

  const sortedSelectedNumbers = useMemo(() => {
    return selectedNumbers.sort((a, b) => a - b);
  }, [selectedNumbers]);

  const availableNumbers = useMemo(() => {
    return numberStatus.filter(status => status.status === 'available').length;
  }, [numberStatus]);

  // Manejar cambios en el formulario
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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

      // Validar el campo en tiempo real
      validateField(name, sanitizedData[name] || '');
    }
  }, []);

  // Función para manejar errores de navegación
  const handleNavigationError = useCallback((error: any) => {
    console.error('Error al redirigir:', error);
    alert('Ha ocurrido un error al procesar tu compra. Por favor, inténtalo de nuevo.');
    setIsLoading(false);
  }, []);

  // Proceder a la compra
  const handleProceedToCheckout = useCallback(() => {
    if (selectedNumbers.length === 0) {
      setError('Por favor, selecciona al menos un número');
      return;
    }
    setShowForm(true);
    setError('');
  }, [selectedNumbers.length]);

  // Cancelar la compra
  const handleCancelCheckout = useCallback(() => {
    setShowForm(false);
    setError('');
  }, []);

  // Manejar el clic en un número
  const handleNumberClick = useCallback((number: number) => {
    // Verificar si el número está disponible
    const numberInfo = numberStatus.find(status => status.number === number);
    if (!numberInfo || numberInfo.status !== 'available') return;

    // Si ya está seleccionado, quitarlo de la selección
    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== number));
      return;
    }

    // Añadir a la selección
    setSelectedNumbers([...selectedNumbers, number]);
  }, [numberStatus, selectedNumbers]);

  // Manejar el envío del formulario
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar errores de validación en tiempo real
    const hasFieldErrors = Object.values(fieldErrors).some(error => error);
    if (hasFieldErrors) {
      showToast('Por favor, corrige los errores en el formulario');
      return;
    }

    // Validar campos básicos
    if (!buyerData.name.trim() || !buyerData.email.trim() || !buyerData.phone.trim()) {
      showToast('Todos los campos son requeridos');
      return;
    }

    // Validar números seleccionados
    if (selectedNumbers.length === 0) {
      showToast('Debes seleccionar al menos un número');
      return;
    }

    // Mostrar modal de confirmación
    setConfirmAction(() => () => processSubmit());
    setShowConfirmModal(true);
  }, [buyerData, selectedNumbers, fieldErrors]);

  // Función para procesar el envío después de la confirmación
  const processSubmit = useCallback(() => {
    setIsLoading(true);

    // Rate limiting - prevenir spam de formularios
    const clientId = `${raffleId || 'unknown'}-${vendorId || 'unknown'}-${Date.now()}`;
    if (!checkRateLimit(clientId, 3, 60000)) {
      showToast('Demasiados intentos. Por favor, espera un momento antes de intentar nuevamente.');
      setIsLoading(false);
      return;
    }

    // Validar IDs
    const raffleIdValidation = validateId(raffleId || '', 'ID de rifa');
    if (!raffleIdValidation.isValid) {
      showToast(raffleIdValidation.error || 'ID de rifa inválido');
      setIsLoading(false);
      return;
    }

    const vendorIdValidation = validateId(vendorId || '', 'ID de vendedor');
    if (!vendorIdValidation.isValid) {
      showToast(vendorIdValidation.error || 'ID de vendedor inválido');
      setIsLoading(false);
      return;
    }

    // Sanitizar datos del formulario preservando espacios en el nombre
    const sanitizedBuyerData = {
      ...sanitizeFormData(buyerData),
      name: buyerData.name.trim() // Solo eliminar espacios al inicio y final, preservar espacios internos
    };

    // Validar formulario de comprador
    const formValidation = validateBuyerForm(sanitizedBuyerData);
    if (!formValidation.isValid) {
      showToast(formValidation.error || 'Datos del formulario inválidos');
      setIsLoading(false);
      return;
    }

    // Validar números seleccionados
    const numbersValidation = validateSelectedNumbers(selectedNumbers, raffle?.numbersPerVendor);
    if (!numbersValidation.isValid) {
      showToast(numbersValidation.error || 'Números seleccionados inválidos');
      setIsLoading(false);
      return;
    }

    // Verificar que tenemos datos válidos de rifa y vendedor
    if (!raffle || !vendor) {
      showToast('Datos de rifa o vendedor no encontrados');
      setIsLoading(false);
      return;
    }

    // Verificar que los números seleccionados están disponibles
    const unavailableNumbers = selectedNumbers.filter(num => {
      const numberInfo = numberStatus.find(status => status.number === num);
      return !numberInfo || numberInfo.status !== 'available';
    });

    if (unavailableNumbers.length > 0) {
      showToast(`Los siguientes números ya no están disponibles: ${unavailableNumbers.join(', ')}`);
      setIsLoading(false);
      return;
    }

    try {
      // Marcar los números seleccionados como reservados
      setNumberStatus(
        numberStatus.map(status =>
          selectedNumbers.includes(status.number)
            ? { ...status, status: 'reserved' }
            : status
        )
      );

      // Crear nuevo comprador con datos sanitizados
      const newBuyer: Buyer = {
        id: generateId(),
        vendorId: vendorId || '',
        raffleId: raffleId || '',
        name: sanitizedBuyerData.name || '',
        email: sanitizedBuyerData.email || '',
        phone: sanitizedBuyerData.phone || '',
        numbers: selectedNumbers,
        purchaseDate: new Date().toISOString(),
      };

      // Guardar en el contexto
      addBuyer(newBuyer);

      // Crear los datos para la navegación
      const paymentData = {
        buyer: newBuyer,
        raffle: raffle,
        vendor: vendor,
        userType: 'vendor' // Identificar que es un vendedor
      };
      
      // Guardar datos en sessionStorage como respaldo
      try {
        sessionStorage.setItem('paymentData', JSON.stringify(paymentData));
      } catch (storageError) {
        console.error('Error al guardar datos en sessionStorage:', storageError);
        // Continuar aunque falle el almacenamiento
      }
      
      // Mostrar mensaje de éxito
      showToast('¡Venta procesada exitosamente!', 'success');
      
      // Desactivar el estado de carga antes de navegar
      setIsLoading(false);
      
      // Navegar directamente a la página de pago con un pequeño retraso para asegurar que el estado se ha actualizado
      setTimeout(() => {
        navigate('/webpay', {
          state: paymentData,
          replace: true // Usar replace para evitar problemas con el historial
        });
      }, 100);
    } catch (error) {
      console.error('Error al procesar la compra:', error);
      showToast('Ha ocurrido un error al procesar la venta. Por favor, inténtalo de nuevo.');
      setIsLoading(false);
    }
  }, [buyerData, selectedNumbers, raffleId, vendorId, raffle, vendor, numberStatus, addBuyer, navigate]);

  // Cargar los datos de la rifa y el vendedor
  useEffect(() => {
    // Verificar que los IDs sean válidos
    if (!raffleId || !vendorId) {
      setLoading(false);
      return;
    }

    try {
      const raffleData = getRaffleById(raffleId || '');
      if (!raffleData) {
        console.error(`Raffle with ID ${raffleId || 'undefined'} not found`);
        setLoading(false);
        return;
      }
      
      const vendors = getVendorsByRaffleId(raffleId || '');
      const vendorData = vendors.find(v => v.id === vendorId);
      if (!vendorData) {
        console.error(`Vendor with ID ${vendorId || 'undefined'} not found for raffle ${raffleId || 'undefined'}`);
        setLoading(false);
        return;
      }
      
      const buyers = getBuyersByVendorId(vendorId || '');

      setRaffle(raffleData);
      setVendor(vendorData);
      setExistingBuyers(buyers);
    } catch (error) {
      console.error('Error loading raffle or vendor data:', error);
    } finally {
      setLoading(false);
    }
  }, [raffleId, vendorId, getRaffleById, getVendorsByRaffleId, getBuyersByVendorId]);

  // Inicializar el estado de los números al cargar la página
  useEffect(() => {
    if (raffle && vendor) {
      // Crear un array con todos los números disponibles
      const initialStatus: NumberStatus[] = [];
      for (let i = 1; i <= raffle.numbersPerVendor; i++) {
        initialStatus.push({
          number: i,
          status: 'available',
        });
      }

      // Marcar los números ya vendidos
      existingBuyers.forEach((buyer: any) => {
        buyer.numbers.forEach((num: number) => {
          const index = initialStatus.findIndex(status => status.number === num);
          if (index !== -1) {
            initialStatus[index].status = 'sold';
            initialStatus[index].buyerId = buyer.id;
          }
        });
      });

      setNumberStatus(initialStatus);
    }
  }, [raffle, vendor, existingBuyers]);

  // Inicializar carrusel automáticamente
  useEffect(() => {
    if (typeof window !== 'undefined' && window.bootstrap && raffle) {
      const carouselElement = document.getElementById('prizeImagesCarousel');
      if (carouselElement) {
        // Crear nueva instancia del carrusel
        new window.bootstrap.Carousel(carouselElement, {
          interval: 3000,
          wrap: true,
          ride: 'carousel'
        });
      }
    }
  }, [raffle]);

  return (
    <div className="container">
      {/* Mostrar un indicador de carga mientras se cargan los datos */}
      {loading && (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
          <LoadingSpinner text="Cargando datos de la rifa..." />
        </div>
      )}
      
      {/* Verificar que los IDs sean válidos */}
      {!loading && (!raffleId || !vendorId) && (
        <div>
          <div className="alert alert-danger">Parámetros de URL no válidos</div>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Volver al Inicio
          </button>
        </div>
      )}
      
      {/* Verificar que la rifa y el vendedor existan */}
      {!loading && raffleId && vendorId && (!raffle || !vendor) && (
        <div>
          <div className="alert alert-danger">Rifa o vendedor no encontrados</div>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Volver al Inicio
          </button>
        </div>
      )}
      
      {/* Verificar si la rifa ya fue sorteada */}
      {!loading && raffle && vendor && raffle.status === 'completed' && (
        <div className="alert alert-warning text-center">
          <h4 className="alert-heading">¡Rifa ya sorteada!</h4>
          <p className="mb-3">
            Esta rifa ya fue sorteada y no se pueden vender más números.
          </p>
          <hr />
          <p className="mb-0">
            Los ganadores ya han sido notificados. Gracias por participar.
          </p>
          <button className="btn btn-primary mt-3" onClick={() => navigate('/')}>
            Volver al Inicio
          </button>
        </div>
      )}
      
      {/* Contenido principal - solo mostrar si tenemos todos los datos necesarios y la rifa está activa */}
      {!loading && raffle && vendor && raffle.status === 'active' && (
        <div className="row mb-4">
          <div className="col-md-8">
            <h1 className="mb-3">Rifa: {raffle.name}</h1>
            <h4 className="mb-4">Vendedor: {vendor.name}</h4>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Selecciona tus números</h5>
                <p className="card-text">
                  Precio por número: <strong>{formatPrice(raffle.pricePerNumber)}</strong>
                </p>
                
                <div className="cinema-container">
                  <div className="cinema-screen"></div>
                  
                  <div className="number-grid">
                    {numberStatus.map(status => (
                      <div
                        key={status.number}
                        className={`number-item ${status.status === 'available' ? 'number-available' : ''} ${status.status === 'reserved' ? 'number-reserved' : ''} ${status.status === 'sold' ? 'number-sold' : ''} ${selectedNumbers.includes(status.number) ? 'number-selected' : ''}`}
                        onClick={() => handleNumberClick(status.number)}
                      >
                        {status.number}
                      </div>
                    ))}
                  </div>
                  
                  <div className="d-flex justify-content-center mt-3">
                    <div className="d-flex">
                      <div className="legend-item">
                        <div className="legend-color legend-available"></div>
                        <span>Disponible</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-color legend-selected"></div>
                        <span>Seleccionado</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-color legend-sold"></div>
                        <span>Vendido</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-light rounded">
                  <h6 className="mb-3">Resumen de tu selección</h6>
                  <p>
                    <strong>Números seleccionados:</strong>{' '}
                    {selectedNumbers.length > 0
                      ? sortedSelectedNumbers.join(', ')
                      : 'Ninguno'}
                  </p>
                  <p className="mb-0">
                    <strong>Total a pagar:</strong>{' '}
                    <span className="text-primary fs-5">{formatPrice(totalPrice)}</span>
                  </p>
                </div>

                {!showForm && (
                  <div className="d-grid gap-2 mt-3">
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={handleProceedToCheckout}
                      disabled={selectedNumbers.length === 0}
                    >
                      <i className="bi bi-cart-check me-2"></i>
                      Continuar con la Compra
                    </button>
                  </div>
                )}
              </div>
            </div>

            {showForm && (
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title mb-4">Datos del Comprador</h5>
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-12 mb-3">
                        <label htmlFor="name" className="form-label">
                          <i className="bi bi-person me-2"></i>Nombre Completo
                        </label>
                        <input
                          type="text"
                          className={`${getInputClass('name')} form-control-lg`}
                          id="name"
                          name="name"
                          value={buyerData.name}
                          onChange={handleInputChange}
                          onKeyDown={(e) => {
                            // Asegurar que la tecla espacio funcione
                            if (e.key === ' ' || e.keyCode === 32) {
                              e.stopPropagation();
                            }
                          }}
                          onInput={(e) => {
                            // Forzar actualización del valor incluyendo espacios
                            const target = e.target as HTMLInputElement;
                            setBuyerData(prev => ({
                              ...prev,
                              name: target.value
                            }));
                          }}
                          placeholder="Ingresa tu nombre completo"
                          required
                        />
                        {fieldErrors.name && (
                          <div className="invalid-feedback">
                            {fieldErrors.name}
                          </div>
                        )}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="email" className="form-label">
                          <i className="bi bi-envelope me-2"></i>Correo Electrónico
                        </label>
                        <input
                          type="email"
                          className={`${getInputClass('email')} form-control-lg`}
                          id="email"
                          name="email"
                          value={buyerData.email}
                          onChange={handleInputChange}
                          placeholder="ejemplo@correo.com"
                          required
                        />
                        {fieldErrors.email && (
                          <div className="invalid-feedback">
                            {fieldErrors.email}
                          </div>
                        )}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="phone" className="form-label">
                          <i className="bi bi-telephone me-2"></i>Teléfono
                        </label>
                        <input
                          type="tel"
                          className={`${getInputClass('phone')} form-control-lg`}
                          id="phone"
                          name="phone"
                          value={buyerData.phone}
                          onChange={handleInputChange}
                          placeholder="Tu número de teléfono"
                          required
                        />
                        {fieldErrors.phone && (
                          <div className="invalid-feedback">
                            {fieldErrors.phone}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="row mt-4">
                      <div className="col-md-6">
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-lg w-100"
                          onClick={handleCancelCheckout}
                          disabled={isLoading}
                        >
                          <i className="bi bi-arrow-left me-2"></i>
                          Volver
                        </button>
                      </div>
                      <div className="col-md-6">
                        <button
                          type="submit"
                          className="btn btn-success btn-lg w-100"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <LoadingSpinner size="sm" text="Procesando..." />
                          ) : (
                            <>
                              <i className="bi bi-credit-card me-2"></i>
                              Proceder al Pago
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-primary text-white py-3">
                <h5 className="card-title mb-0">
                  <i className="bi bi-trophy me-2"></i>
                  Detalles del Premio
                </h5>
              </div>
              <div className="card-body">
                <div id="prizeImagesCarousel" className="carousel slide mb-3" data-bs-ride="carousel" data-bs-interval="3000">
                  <div className="carousel-inner rounded">
                    {(raffle.prizes && raffle.prizes.length > 0 ? raffle.prizes : raffle.images.map((image: string, index: number) => ({ id: `img-${index}`, name: `Premio ${index + 1}`, description: '', image }))).map((prize: Prize, index: number) => (
                      <div key={prize.id || index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                        <div className="position-relative d-flex justify-content-center align-items-center" style={{ height: '240px', backgroundColor: '#f8f9fa' }}>
                          <div className="position-absolute top-0 start-0 end-0 bg-primary text-white text-center py-1">
                            <small className="fw-bold">Premio #{index + 1}</small>
                          </div>
                          <img
                            src={prize.image}
                            className="rounded"
                            alt={prize.name}
                            style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                          />
                          <div className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-75 text-white p-2">
                            <h6 className="mb-1 small text-center">{prize.name}</h6>
                            {prize.description && <p className="mb-0 text-center" style={{ fontSize: '0.75rem' }}>{prize.description}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {((raffle.prizes && raffle.prizes.length > 1) || raffle.images.length > 1) && (
                    <>
                      <button
                        className="carousel-control-prev"
                        type="button"
                        data-bs-target="#prizeImagesCarousel"
                        data-bs-slide="prev"
                      >
                        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Anterior</span>
                      </button>
                      <button
                        className="carousel-control-next"
                        type="button"
                        data-bs-target="#prizeImagesCarousel"
                        data-bs-slide="next"
                      >
                        <span className="carousel-control-next-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Siguiente</span>
                      </button>
                    </>
                  )}
                </div>

                <div className="prize-details p-3 bg-light rounded">
                  <h6 className="border-bottom pb-2 mb-3">Información del Premio</h6>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <i className="bi bi-calendar-event me-2 text-primary"></i>
                      <strong>Fecha del sorteo:</strong> {new Date(raffle.raffleDate).toLocaleDateString('es-ES', {day: 'numeric', month: 'long', year: 'numeric'})}
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-cash-coin me-2 text-primary"></i>
                      <strong>Precio por número:</strong> {formatPrice(raffle.pricePerNumber)}
                    </li>
                    <li>
                      <i className="bi bi-ticket-perforated me-2 text-primary"></i>
                      <strong>Números disponibles:</strong> {numberStatus.filter(s => s.status === 'available').length} de {raffle.numbersPerVendor}
                    </li>
                  </ul>
                </div>
                
                <div className="mt-4">
                  <div className="alert alert-warning">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    <small>Esta es una simulación de compra de boletos. Selecciona tus números como si estuvieras comprando entradas para el cine.</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        title="Confirmar venta"
        message={`¿Estás seguro de que deseas procesar la venta de ${selectedNumbers.length} número(s) por ${formatPrice(totalPrice)}?`}
        confirmText="Confirmar venta"
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

export default SellPage;