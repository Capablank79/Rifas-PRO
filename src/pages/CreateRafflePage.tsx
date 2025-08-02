import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRaffle } from '../context/RaffleContext';
import { generateId, fileToBase64 } from '../utils/helpers';
import { Raffle, Prize, BankingData } from '../types';
import HamburgerMenu from '../components/HamburgerMenu';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmationModal from '../components/ConfirmationModal';



const CreateRafflePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createRaffle, updateRaffle, raffles, getRaffleById, getBuyersByRaffleId } = useRaffle();
  
  // Detectar si estamos en modo edición
  const editMode = searchParams.get('edit') === 'true';
  const raffleId = searchParams.get('raffleId');
  
  // Solo buscar rifa si estamos en modo edición explícito
  const activeRaffle = editMode && raffleId ? getRaffleById(raffleId) : null;
  
  // Verificar si hay números vendidos en la rifa activa
  const hasNumbersSold = activeRaffle ? getBuyersByRaffleId(activeRaffle.id).length > 0 : false;

  const [formData, setFormData] = useState({
    name: '',
    pricePerNumber: 0,
    vendorsCount: 0,
    numbersPerVendor: 0,
    raffleDate: '',
  });

  const [bankingData, setBankingData] = useState({
    bankName: '',
    accountType: '',
    accountNumber: '',
    accountHolder: '',
    rut: '',
    email: ''
  });

  const [bankingDataSaved, setBankingDataSaved] = useState(false);
  const [showBankingModal, setShowBankingModal] = useState(false);
  const [tempBankingData, setTempBankingData] = useState({
    bankName: '',
    accountType: '',
    accountNumber: '',
    accountHolder: '',
    rut: '',
    email: ''
  });

  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);
  const [modalData, setModalData] = useState({
    name: '',
    description: '',
    image: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estados para validación en tiempo real
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    pricePerNumber: '',
    vendorsCount: '',
    numbersPerVendor: '',
    raffleDate: ''
  });

  // Estados para confirmación
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
    if (formData[fieldName as keyof typeof formData] && !fieldErrors[fieldName]) {
      return `${baseClass} is-valid`;
    }
    return baseClass;
  };

  // Validación en tiempo real
  const validateField = (name: string, value: string | number) => {
    let error = '';
    
    switch (name) {
      case 'name':
        if (!value || (typeof value === 'string' && !value.trim())) {
          error = 'El nombre de la rifa es requerido';
        } else if (typeof value === 'string' && value.trim().length < 3) {
          error = 'El nombre debe tener al menos 3 caracteres';
        } else if (typeof value === 'string' && value.trim().length > 100) {
          error = 'El nombre no puede exceder 100 caracteres';
        }
        break;
      case 'pricePerNumber':
        const priceValue = typeof value === 'string' ? parseFloat(value) : value;
        if (!priceValue || priceValue <= 0) {
          error = 'El precio debe ser mayor a 0';
        } else if (priceValue > 1000000) {
          error = 'El precio no puede exceder $1.000.000';
        }
        break;
      case 'vendorsCount':
        const vendorsValue = typeof value === 'string' ? parseInt(value) : value;
        if (!vendorsValue || vendorsValue <= 0) {
          error = 'Debe haber al menos 1 vendedor';
        } else if (vendorsValue > 100) {
          error = 'No puede haber más de 100 vendedores';
        }
        break;
      case 'numbersPerVendor':
        const numbersValue = typeof value === 'string' ? parseInt(value) : value;
        if (!numbersValue || numbersValue <= 0) {
          error = 'Debe haber al menos 1 número por vendedor';
        } else if (numbersValue > 1000) {
          error = 'No puede haber más de 1000 números por vendedor';
        }
        break;
      case 'raffleDate':
        if (!value) {
          error = 'La fecha del sorteo es requerida';
        } else if (typeof value === 'string' && new Date(value) <= new Date()) {
          error = 'La fecha debe ser futura';
        }
        break;
    }
    
    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  // Cargar datos de rifa existente si hay una activa o estamos en modo edición
  useEffect(() => {
    if (activeRaffle) {
      setFormData({
        name: activeRaffle.name,
        pricePerNumber: activeRaffle.pricePerNumber,
        vendorsCount: activeRaffle.vendorsCount,
        numbersPerVendor: activeRaffle.numbersPerVendor,
        raffleDate: activeRaffle.raffleDate,
      });
      setPrizes(activeRaffle.prizes || []);
      if (activeRaffle.bankingData) {
        setBankingData(activeRaffle.bankingData);
        setBankingDataSaved(true);
      }
    }
  }, [activeRaffle]);

  // Función para formatear precio en pesos chilenos sin decimales
  const formatPriceCLP = (value: number): string => {
    if (value === 0) return '';
    return `$${value.toLocaleString('es-CL')}`;
  };

  // Función para limpiar el formato y obtener solo el número
  const parsePrice = (value: string): number => {
    const cleanValue = value.replace(/[$.,\s]/g, '');
    return parseInt(cleanValue) || 0;
  };

  // Función específica para manejar el cambio del precio
  const handlePriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const numericValue = parsePrice(value);
    setFormData({
      ...formData,
      pricePerNumber: numericValue,
    });
    
    // Validar campo en tiempo real
    validateField('pricePerNumber', numericValue);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Para campos de texto, preservar espacios y caracteres especiales
    let newValue: string | number;
    if (type === 'number') {
      newValue = parseInt(value) || 0;
    } else {
      // Preservar el valor exacto para campos de texto, incluyendo espacios
      newValue = value;
    }
    
    setFormData({
      ...formData,
      [name]: newValue,
    });

    // Validar campo en tiempo real
    validateField(name, newValue);
  };

  const handleBankingChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBankingData({
      ...bankingData,
      [name]: value,
    });
  };

  const handleTempBankingChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTempBankingData({
      ...tempBankingData,
      [name]: value,
    });
  };

  const openBankingModal = () => {
    setTempBankingData({ ...bankingData });
    setShowBankingModal(true);
  };

  const closeBankingModal = () => {
    setShowBankingModal(false);
    setTempBankingData({
      bankName: '',
      accountType: '',
      accountNumber: '',
      accountHolder: '',
      rut: '',
      email: ''
    });
  };

  const saveBankingData = () => {
    if (!tempBankingData.accountNumber.trim() || 
        !tempBankingData.accountHolder.trim() || 
        !tempBankingData.rut.trim() || 
        !tempBankingData.email.trim()) {
      setError('Por favor, completa todos los campos bancarios');
      return;
    }

    setBankingData({ ...tempBankingData });
    setBankingDataSaved(true);
    setShowBankingModal(false);
    setError('');
  };

  const handleModalImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    try {
      const file = e.target.files[0];
      const imageBase64 = await fileToBase64(file);
      setModalData({ ...modalData, image: imageBase64 });
    } catch (error) {
      setError('Error al cargar la imagen');
    }
  };

  const openModal = (prize?: Prize) => {
    if (prize) {
      setEditingPrize(prize);
      setModalData({
        name: prize.name,
        description: prize.description,
        image: prize.image
      });
    } else {
      setEditingPrize(null);
      setModalData({ name: '', description: '', image: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPrize(null);
    setModalData({ name: '', description: '', image: '' });
  };

  const savePrize = () => {
    if (!modalData.name.trim()) {
      setError('El nombre del premio es requerido');
      return;
    }

    if (editingPrize) {
      // Editar premio existente
      setPrizes(prizes.map(p => 
        p.id === editingPrize.id 
          ? { ...p, name: modalData.name, description: modalData.description, image: modalData.image }
          : p
      ));
    } else {
      // Agregar nuevo premio
      const newPrize: Prize = {
        id: generateId(),
        name: modalData.name,
        description: modalData.description,
        image: modalData.image
      };
      setPrizes([...prizes, newPrize]);
    }
    closeModal();
  };

  const deletePrize = (prizeId: string) => {
    setPrizes(prizes.filter(p => p.id !== prizeId));
  };



  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Verificar errores de validación
    const hasErrors = Object.values(fieldErrors).some(error => error !== '');
    if (hasErrors) {
      showToast('error', 'Errores de validación', 'Por favor, corrige los errores en el formulario');
      return;
    }

    // Validaciones básicas
    if (
      !formData.name ||
      formData.pricePerNumber <= 0 ||
      formData.vendorsCount <= 0 ||
      formData.numbersPerVendor <= 0 ||
      !formData.raffleDate
    ) {
      const errorMsg = 'Por favor, completa todos los campos correctamente';
      setError(errorMsg);
      showToast('error', 'Campos incompletos', errorMsg);
      return;
    }

    if (prizes.length === 0) {
      const errorMsg = 'Por favor, agrega al menos un premio';
      setError(errorMsg);
      showToast('error', 'Premios requeridos', errorMsg);
      return;
    }

    // Mostrar confirmación antes de proceder
    const action = () => {
      setIsLoading(true);
      
      try {
        if (editMode && activeRaffle) {
          // Actualizar rifa existente
          const updatedRaffle: Raffle = {
            ...activeRaffle,
            name: formData.name,
            pricePerNumber: formData.pricePerNumber,
            vendorsCount: formData.vendorsCount,
            numbersPerVendor: formData.numbersPerVendor,
            raffleDate: formData.raffleDate,
            images: prizes.map(p => p.image).filter(img => img),
            prizes: prizes,
            description: prizes.map(p => `${p.name}: ${p.description}`).join('; '),
            bankingData: bankingDataSaved ? bankingData : undefined,
          };
          updateRaffle(updatedRaffle);
          showToast('success', '¡Rifa actualizada!', `La rifa "${formData.name}" ha sido actualizada exitosamente`);
          navigate(`/rafflemanagement/${activeRaffle.id}`);
        } else {
          // Crear nueva rifa
          const newRaffleId = generateId();
          const newRaffle: Raffle = {
            id: newRaffleId,
            name: formData.name,
            pricePerNumber: formData.pricePerNumber,
            vendorsCount: formData.vendorsCount,
            numbersPerVendor: formData.numbersPerVendor,
            raffleDate: formData.raffleDate,
            images: prizes.map(p => p.image).filter(img => img),
            prizes: prizes,
            createdAt: new Date().toISOString(),
            status: 'active',
            prizeValue: 0,
            description: prizes.map(p => `${p.name}: ${p.description}`).join('; '),
            bankingData: bankingDataSaved ? bankingData : undefined,
          };
          createRaffle(newRaffle);
          showToast('success', '¡Rifa creada!', `La rifa "${formData.name}" ha sido creada exitosamente`);
          
          // Navegar inmediatamente después de crear la rifa
          navigate(`/rafflemanagement/${newRaffleId}`);
        }
      } catch (error) {
        const errorMsg = editMode ? 'Error al actualizar la rifa' : 'Error al crear la rifa';
        setError(errorMsg);
        showToast('error', 'Error', errorMsg);
      } finally {
        setIsLoading(false);
        setShowConfirmModal(false);
      }
    };

    setConfirmAction(() => action);
    setShowConfirmModal(true);
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">{editMode ? 'Editar Rifa' : (activeRaffle ? 'Datos de la Rifa' : 'Crear Nueva Rifa')}</h1>
        <HamburgerMenu />
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      
      {activeRaffle && !editMode && (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          Estos son los datos de tu rifa activa. Para modificarlos, usa el menú hamburguesa → Ajustes → General.
          {hasNumbersSold && (
            <><br /><strong>Nota:</strong> Como ya hay números vendidos, solo podrás editar los datos bancarios, la fecha del sorteo y agregar más vendedores.</>
          )}
        </div>
      )}
      
      {activeRaffle && editMode && hasNumbersSold && (
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          <strong>Edición limitada:</strong> Como ya hay números vendidos, solo puedes modificar los datos bancarios, la fecha del sorteo y agregar más vendedores. No se pueden cambiar premios, precios o números por vendedor.
        </div>
      )}

      <div className="row">
        <div className="col-lg-8 mx-auto">
          <form onSubmit={handleSubmit}>
            {/* Sección 1: Información Básica */}
            <div className="card mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  Información Básica de la Rifa
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-12 mb-3">
                    <label htmlFor="name" className="form-label fw-bold">
                      <i className="bi bi-tag me-2"></i>
                      Nombre de la Rifa
                    </label>
                    <input
                      type="text"
                      className={getInputClass('name')}
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onKeyDown={(e) => {
                        // Asegurar que la tecla espacio funcione
                        if (e.key === ' ' || e.keyCode === 32) {
                          e.stopPropagation();
                        }
                      }}
                      onInput={(e) => {
                        // Forzar actualización del valor incluyendo espacios
                        const target = e.target as HTMLInputElement;
                        setFormData(prev => ({
                          ...prev,
                          name: target.value
                        }));
                      }}
                      placeholder="Ej. Rifa a Beneficio de..."
                      readOnly={!!activeRaffle && (!editMode || hasNumbersSold)}
                      required
                    />
                    {fieldErrors.name && (
                      <div className="invalid-feedback">
                        {fieldErrors.name}
                      </div>
                    )}
                    <div className="form-text">
                      <i className="bi bi-lightbulb me-1"></i>
                      Ingresa un nombre descriptivo para tu rifa
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="pricePerNumber" className="form-label fw-bold">
                      <i className="bi bi-currency-dollar me-2"></i>
                      Precio por Número
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input
                        type="text"
                        className={getInputClass('pricePerNumber')}
                        id="pricePerNumber"
                        name="pricePerNumber"
                        value={formatPriceCLP(formData.pricePerNumber)}
                        onChange={handlePriceChange}
                        placeholder="1000"
                        readOnly={!!activeRaffle && (!editMode || hasNumbersSold)}
                        required
                      />
                    </div>
                    {fieldErrors.pricePerNumber && (
                      <div className="invalid-feedback">
                        {fieldErrors.pricePerNumber}
                      </div>
                    )}
                    <div className="form-text">
                      <i className="bi bi-info-circle me-1"></i>
                      Precio en pesos chilenos (sin decimales)
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="raffleDate" className="form-label fw-bold">
                      <i className="bi bi-calendar-event me-2"></i>
                      Fecha del Sorteo
                    </label>
                    <input
                      type="date"
                      className={getInputClass('raffleDate')}
                      id="raffleDate"
                      name="raffleDate"
                      value={formData.raffleDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      readOnly={!!activeRaffle && !editMode}
                      required
                    />
                    {fieldErrors.raffleDate && (
                      <div className="invalid-feedback">
                        {fieldErrors.raffleDate}
                      </div>
                    )}
                    <div className="form-text">
                      <i className="bi bi-clock me-1"></i>
                      Fecha mínima: hoy
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección 2: Configuración de Vendedores */}
            <div className="card mb-4">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">
                  <i className="bi bi-people me-2"></i>
                  Configuración de Vendedores
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="vendorsCount" className="form-label fw-bold">
                      <i className="bi bi-person-badge me-2"></i>
                      Cantidad de Vendedores
                    </label>
                    <input
                      type="number"
                      className={getInputClass('vendorsCount')}
                      id="vendorsCount"
                      name="vendorsCount"
                      min="1"
                      value={formData.vendorsCount || ''}
                      onChange={handleChange}
                      placeholder="5"
                      readOnly={!!activeRaffle && !editMode}
                      required
                    />
                    {fieldErrors.vendorsCount && (
                      <div className="invalid-feedback">
                        {fieldErrors.vendorsCount}
                      </div>
                    )}
                    <div className="form-text">
                      <i className="bi bi-info-circle me-1"></i>
                      Número total de vendedores
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="numbersPerVendor" className="form-label fw-bold">
                      <i className="bi bi-hash me-2"></i>
                      Números por Vendedor
                    </label>
                    <input
                      type="number"
                      className={getInputClass('numbersPerVendor')}
                      id="numbersPerVendor"
                      name="numbersPerVendor"
                      min="1"
                      value={formData.numbersPerVendor || ''}
                      onChange={handleChange}
                      placeholder="100"
                      readOnly={!!activeRaffle && !editMode}
                      required
                    />
                    {fieldErrors.numbersPerVendor && (
                      <div className="invalid-feedback">
                        {fieldErrors.numbersPerVendor}
                      </div>
                    )}
                    <div className="form-text">
                      <i className="bi bi-info-circle me-1"></i>
                      Números asignados a cada vendedor
                    </div>
                  </div>
                </div>

                {/* Cálculo de Recaudación */}
                {formData.pricePerNumber > 0 && formData.vendorsCount > 0 && formData.numbersPerVendor > 0 && (
                  <div className="alert alert-info border-0 bg-light">
                    <div className="row align-items-center">
                      <div className="col-md-8">
                        <h6 className="mb-1">
                          <i className="bi bi-calculator me-2"></i>
                          Recaudación Máxima Estimada
                        </h6>
                        <div className="fs-4 fw-bold text-success mb-1">
                          {formatPriceCLP(
                            formData.pricePerNumber * 
                            formData.vendorsCount * 
                            formData.numbersPerVendor
                          )}
                        </div>
                        <small className="text-muted">
                          {formatPriceCLP(formData.pricePerNumber)} × {formData.vendorsCount} vendedores × {formData.numbersPerVendor} números
                        </small>
                      </div>
                      <div className="col-md-4 text-center">
                        <div className="badge bg-success fs-6 p-2">
                          {formData.vendorsCount * formData.numbersPerVendor} números totales
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sección 3: Datos Bancarios */}
            <div className="card mb-4">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">
                  <i className="bi bi-bank me-2"></i>
                  Datos Bancarios para Recaudación
                </h5>
                <small className="text-light d-block mt-1">
                  <i className="bi bi-shield-check me-1"></i>
                  Integración con Mercado Pago - Los fondos se depositarán automáticamente
                </small>
              </div>
              <div className="card-body">
                <div className="alert alert-info border-0 mb-3">
                  <div className="row align-items-center">
                    <div className="col-md-1 text-center">
                      <i className="bi bi-info-circle fs-4 text-info"></i>
                    </div>
                    <div className="col-md-11">
                      <strong>Demo:</strong> Esta sección muestra la funcionalidad de recaudación automática. 
                      En la versión real, los pagos se procesarían a través de Mercado Pago y se depositarían 
                      directamente en tu cuenta bancaria.
                    </div>
                  </div>
                </div>
                
                {!bankingDataSaved ? (
                  <div className="text-center py-4">
                    <div className="mb-3">
                      <i className="bi bi-credit-card fs-1 text-muted"></i>
                    </div>
                    <h6 className="text-muted mb-3">Información de Pago Pendiente</h6>
                    <button
                      type="button"
                      className="btn btn-primary btn-lg px-4"
                      onClick={openBankingModal}
                    >
                      <i className="bi bi-plus-circle me-2"></i>
                      Agregar Información de Pago
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="mb-3">
                      <i className="bi bi-check-circle fs-1 text-success"></i>
                    </div>
                    <div className="alert alert-success border-0 mb-0">
                      <h6 className="mb-1">
                        <i className="bi bi-shield-check me-2"></i>
                        ¡Información Bancaria Guardada!
                      </h6>
                      <small className="text-muted">
                        Tus datos están protegidos con encriptación de nivel bancario
                      </small>
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm mt-2"
                      onClick={openBankingModal}
                    >
                      <i className="bi bi-pencil me-1"></i>
                      Editar Información
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Sección 4: Premios */}
            <div className="card mb-4">
              <div className="card-header bg-warning text-dark">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-0">
                      <i className="bi bi-trophy me-2"></i>
                      Premios de la Rifa
                    </h5>
                    <small className="text-dark-50 d-block mt-1">
                      <i className="bi bi-info-circle me-1"></i>
                      Agrega los premios desde el 1er lugar hasta el último en ese orden
                    </small>
                  </div>
                  <button
                    type="button"
                    className="btn btn-dark btn-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openModal();
                    }}
                    disabled={!!activeRaffle && (!editMode || hasNumbersSold)}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Agregar Premio
                  </button>
                </div>
              </div>
              <div className="card-body">
                {prizes.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="mb-3">
                      <i className="bi bi-gift fs-1 text-muted"></i>
                    </div>
                    <h6 className="text-muted mb-3">No hay premios agregados</h6>
                    <p className="text-muted small mb-3">
                      Agrega al menos un premio para continuar con la creación de tu rifa
                    </p>
                    <button
                      type="button"
                      className="btn btn-warning"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openModal();
                      }}
                      disabled={!!activeRaffle && (!editMode || hasNumbersSold)}
                    >
                      <i className="bi bi-plus-circle me-2"></i>
                      Agregar Primer Premio
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="mb-0 text-success">
                        <i className="bi bi-check-circle me-2"></i>
                        Premios Configurados ({prizes.length})
                      </h6>
                      <span className="badge bg-success">{prizes.length} premio{prizes.length !== 1 ? 's' : ''}</span>
                    </div>
                    
                    <div className="row g-3">
                      {prizes.map((prize, index) => (
                        <div key={prize.id} className="col-md-6">
                          <div className="card border-warning h-100">
                            <div className="card-body">
                              <div className="d-flex align-items-start">
                                <div className="me-3">
                                  <div className="badge bg-warning text-dark rounded-circle p-2 fs-6">
                                    {index + 1}°
                                  </div>
                                </div>
                                
                                {prize.image && (
                                  <div className="me-3">
                                    <img
                                      src={prize.image}
                                      alt={prize.name}
                                      className="rounded border"
                                      style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                    />
                                  </div>
                                )}
                                
                                <div className="flex-grow-1">
                                  <h6 className="card-title mb-1">{prize.name}</h6>
                                  {prize.description && (
                                    <p className="card-text text-muted small mb-2">{prize.description}</p>
                                  )}
                                  <div className="btn-group btn-group-sm">
                                    <button
                                      type="button"
                                      className="btn btn-outline-primary"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        openModal(prize);
                                      }}
                                      disabled={!!activeRaffle && (!editMode || hasNumbersSold)}
                                      title="Editar premio"
                                    >
                                      <i className="bi bi-pencil"></i>
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-outline-danger"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        deletePrize(prize.id);
                                      }}
                                      disabled={!!activeRaffle && (!editMode || hasNumbersSold)}
                                      title="Eliminar premio"
                                    >
                                      <i className="bi bi-trash"></i>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sección 5: Botón de Acción */}
            {(editMode || !activeRaffle) && (
              <div className="card">
                <div className="card-body text-center py-4">
                  <div className="mb-3">
                    <i className="bi bi-rocket fs-1 text-primary"></i>
                  </div>
                  <h5 className="mb-3">
                    {editMode ? '¿Listo para actualizar tu rifa?' : '¿Listo para crear tu rifa?'}
                  </h5>
                  <p className="text-muted mb-4">
                    {editMode 
                      ? 'Los cambios se aplicarán inmediatamente y estarán disponibles para todos los vendedores.'
                      : 'Una vez creada, podrás gestionar vendedores, ver estadísticas y realizar el sorteo.'
                    }
                  </p>
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg px-5"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" text="" />
                        <span className="ms-2">Procesando...</span>
                      </>
                    ) : (
                      <>
                        <i className={`bi ${editMode ? 'bi-arrow-repeat' : 'bi-plus-circle'} me-2`}></i>
                        {editMode ? 'Actualizar Rifa' : 'Crear Rifa'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Modal para agregar/editar premios */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingPrize ? 'Editar Premio' : 'Agregar Premio'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Nombre del Premio</label>
                  <input
                    type="text"
                    className="form-control"
                    value={modalData.name}
                    onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Descripción</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={modalData.description}
                    onChange={(e) => setModalData({ ...modalData, description: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Foto del Premio</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handleModalImageUpload}
                  />
                  {modalData.image && (
                    <div className="mt-2">
                      <img
                        src={modalData.image}
                        alt="Preview"
                        className="img-thumbnail"
                        style={{ height: '100px', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={savePrize}
                >
                  {editingPrize ? 'Actualizar' : 'Agregar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para datos bancarios */}
      {showBankingModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-bank me-2"></i>
                  Información de Pago
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeBankingModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-info mb-3">
                  <i className="bi bi-info-circle me-2"></i>
                  Ingresa tus datos bancarios para recibir los pagos de la rifa.
                </div>
                
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="modalBankName" className="form-label">
                      Banco
                    </label>
                    <select
                      className="form-select"
                      id="modalBankName"
                      name="bankName"
                      value={tempBankingData.bankName}
                      onChange={handleTempBankingChange}
                      required
                    >
                      <option value="Banco de Chile">Banco de Chile</option>
                      <option value="Banco Santander">Banco Santander</option>
                      <option value="BancoEstado">BancoEstado</option>
                      <option value="Banco BCI">Banco BCI</option>
                      <option value="Scotiabank">Scotiabank</option>
                    </select>
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label htmlFor="modalAccountType" className="form-label">
                      Tipo de Cuenta
                    </label>
                    <select
                      className="form-select"
                      id="modalAccountType"
                      name="accountType"
                      value={tempBankingData.accountType}
                      onChange={handleTempBankingChange}
                      required
                    >
                      <option value="Cuenta Corriente">Cuenta Corriente</option>
                      <option value="Cuenta de Ahorros">Cuenta de Ahorros</option>
                      <option value="Cuenta Vista">Cuenta Vista</option>
                    </select>
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="modalAccountNumber" className="form-label">
                      Número de Cuenta
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="modalAccountNumber"
                      name="accountNumber"
                      value={tempBankingData.accountNumber}
                      onChange={handleTempBankingChange}
                      placeholder="1234567890"
                      required
                    />
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label htmlFor="modalRut" className="form-label">
                      RUT del Titular
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="modalRut"
                      name="rut"
                      value={tempBankingData.rut}
                      onChange={handleTempBankingChange}
                      placeholder="12.345.678-9"
                      required
                    />
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="modalAccountHolder" className="form-label">
                      Nombre del Titular
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="modalAccountHolder"
                      name="accountHolder"
                      value={tempBankingData.accountHolder}
                      onChange={handleTempBankingChange}
                      placeholder="Juan Pérez González"
                      required
                    />
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label htmlFor="modalEmail" className="form-label">
                      Email de Confirmación
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="modalEmail"
                      name="email"
                      value={tempBankingData.email}
                      onChange={handleTempBankingChange}
                      placeholder="juan.perez@email.com"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeBankingModal}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={saveBankingData}
                >
                  <i className="bi bi-save me-2"></i>
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación */}
      {showConfirmModal && (
        <ConfirmationModal
          isOpen={showConfirmModal}
          title={editMode ? "Confirmar Actualización" : "Confirmar Creación"}
          message={
            editMode 
              ? "¿Estás seguro de que deseas actualizar esta rifa? Los cambios se aplicarán inmediatamente."
              : "¿Estás seguro de que deseas crear esta rifa? Una vez creada, algunos campos no podrán modificarse."
          }
          confirmText={editMode ? "Actualizar" : "Crear"}
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
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default CreateRafflePage;