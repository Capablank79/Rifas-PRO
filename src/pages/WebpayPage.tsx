import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Buyer, Raffle, Vendor } from '../types';
import { formatPrice } from '../utils/helpers';

interface LocationState {
  buyer: Buyer;
  raffle: Raffle;
  vendor: Vendor;
}

const WebpayPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [processingStep, setProcessingStep] = useState(1);
  const [processingComplete, setProcessingComplete] = useState(false);

  // Obtener los datos del estado de la ubicación
  const state = location.state as LocationState;

  useEffect(() => {
    // Verificar si hay datos en el estado
    if (!state || !state.buyer || !state.raffle || !state.vendor) {
      console.error('No se encontraron datos de pago en el estado');
      // Intentar recuperar datos de sessionStorage como respaldo
      try {
        const paymentDataStr = sessionStorage.getItem('paymentData');
        if (paymentDataStr) {
          const paymentData = JSON.parse(paymentDataStr);
          if (paymentData.buyer && paymentData.raffle && paymentData.vendor) {
            // Si hay datos en sessionStorage, usarlos como estado local en lugar de recargar
        
            // Usar los datos directamente en lugar de recargar la página
            // Esto evita el problema de navegación que causa el error net::ERR_ABORTED
            window.history.replaceState(
              { ...window.history.state, usr: paymentData },
              document.title
            );
            return;
          }
        }
      } catch (error) {
        console.error('Error al recuperar datos de sessionStorage:', error);
      }
      
      // Si no hay datos en el estado ni en sessionStorage, redirigir al inicio
      navigate('/', { replace: true });
      return;
    }

    // Simulación del proceso de pago
    const timer1 = setTimeout(() => {
      setProcessingStep(2);
    }, 2000);

    const timer2 = setTimeout(() => {
      setProcessingStep(3);
    }, 4000);

    const timer3 = setTimeout(() => {
      setIsProcessing(false);
      setProcessingComplete(true);
    }, 6000);

    // Limpiar los temporizadores si el componente se desmonta
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [state, navigate]);

  // Manejar la finalización del pago
  const handlePaymentComplete = () => {
    // Mostrar alerta de agradecimiento
    alert('¡Pago completado exitosamente! Ahora serás redirigido a tu comprobante de compra.');
    
    // Verificar que los datos del estado son válidos
    if (state && state.buyer && state.raffle && state.vendor) {
      try {
        // Guardar los datos en sessionStorage como respaldo
        try {
          sessionStorage.setItem('confirmationData', JSON.stringify(state));
        } catch (storageError) {
          console.error('Error al guardar datos en sessionStorage:', storageError);
          // Continuar aunque falle el almacenamiento
        }
        
        // Usar setTimeout para dar tiempo al DOM a actualizarse antes de navegar
        setTimeout(() => {
          // Redirigir a la página de confirmación con los datos
          navigate('/confirmation', {
            state: state,
            replace: true // Usar replace para evitar problemas con el historial
          });
        }, 300);
      } catch (error) {
        console.error('Error al redirigir a la página de confirmación:', error);
        alert('Ha ocurrido un error. Serás redirigido al inicio.');
        navigate('/', { replace: true });
      }
    } else {
      // Si no hay datos válidos, redirigir al inicio
      alert('Ha ocurrido un error al procesar tu compra. Por favor, inténtalo de nuevo.');
      navigate('/', { replace: true });
    }
  };

  // Si no hay datos, mostrar un mensaje de carga
  if (!state || !state.buyer || !state.raffle || !state.vendor) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">Cargando información...</p>
      </div>
    );
  }

  const { buyer, raffle, vendor } = state;
  const totalAmount = buyer.numbers.length * raffle.pricePerNumber;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card border-primary">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">
                <i className="bi bi-credit-card me-2"></i>
                Webpay - Plataforma de Pago
              </h3>
            </div>
            <div className="card-body">
              {isProcessing ? (
                <div className="text-center py-5">
                  <div className="webpay-logo mb-4">
                    <div 
                      className="d-flex align-items-center justify-content-center bg-primary text-white rounded p-3"
                      style={{ 
                        maxWidth: '200px', 
                        height: '80px', 
                        margin: '0 auto',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        letterSpacing: '2px'
                      }}
                    >
                      WEBPAY
                    </div>
                  </div>
                  
                  <div className="progress mb-4" style={{ height: '25px' }}>
                    <div 
                      className="progress-bar progress-bar-striped progress-bar-animated" 
                      role="progressbar" 
                      style={{ width: `${processingStep * 33}%` }}
                    ></div>
                  </div>
                  
                  <h4 className="mb-4">
                    {processingStep === 1 && 'Conectando con el servidor de pago...'}
                    {processingStep === 2 && 'Verificando información de tarjeta...'}
                    {processingStep === 3 && 'Procesando transacción...'}
                  </h4>
                  
                  <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                    <span className="visually-hidden">Procesando...</span>
                  </div>
                  
                  <p className="mt-4 text-muted">
                    Por favor, no cierres esta ventana mientras procesamos tu pago.
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="mb-4">
                    <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '5rem' }}></i>
                  </div>
                  
                  <h3 className="mb-3 text-success">¡Pago Completado con Éxito!</h3>
                  
                  <div className="alert alert-success">
                    <p className="mb-0">
                      <strong>Número de transacción:</strong> {Math.floor(Math.random() * 10000000000)}
                    </p>
                  </div>
                  
                  <div className="card mb-4">
                    <div className="card-header bg-light">
                      <h5 className="mb-0">Resumen de la compra</h5>
                    </div>
                    <div className="card-body">
                      <p><strong>Rifa:</strong> {raffle.name}</p>
                      <p><strong>Números comprados:</strong> {buyer.numbers.sort((a, b) => a - b).join(', ')}</p>
                      <p><strong>Total pagado:</strong> <span className="text-primary fw-bold">{formatPrice(totalAmount)}</span></p>
                    </div>
                  </div>
                  
                  <button 
                    className="btn btn-primary btn-lg" 
                    onClick={handlePaymentComplete}
                  >
                    <i className="bi bi-receipt me-2"></i>
                    Ver Comprobante de Compra
                  </button>
                </div>
              )}
            </div>
            <div className="card-footer bg-light">
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">Transacción segura</small>
                <div>
                  <i className="bi bi-shield-lock me-2"></i>
                  <i className="bi bi-credit-card me-2"></i>
                  <i className="bi bi-patch-check"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebpayPage;