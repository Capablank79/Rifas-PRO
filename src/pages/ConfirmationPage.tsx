import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { formatPrice } from '../utils/helpers';
import { Buyer, Raffle, Vendor } from '../types';
import { 
  validateSessionData, 
  validateId, 
  escapeHtml 
} from '../utils/validation';
import SocialShareButtons from '../components/SocialShareButtons';

interface LocationState {
  buyer: Buyer;
  raffle: Raffle;
  vendor: Vendor;
  userType?: 'buyer' | 'vendor'; // Tipo de usuario opcional
}

const ConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [qrValue, setQrValue] = useState('');
  const [showQrSentAlert, setShowQrSentAlert] = useState(false);

  // Obtener los datos del estado de la ubicación
  const state = location.state as LocationState;

  useEffect(() => {
    // Verificar si hay datos en el estado
    if (!state || !state.buyer || !state.raffle || !state.vendor) {
      console.error('No se encontraron datos de confirmación en el estado');
      // Intentar recuperar datos de sessionStorage como respaldo
      try {
        const confirmationDataStr = sessionStorage.getItem('confirmationData');
        if (confirmationDataStr) {
          const confirmationData = JSON.parse(confirmationDataStr);
          
          // Validar datos de sesión usando función centralizada
          const sessionValidation = validateSessionData(confirmationData, ['buyer', 'raffle', 'vendor']);
          if (sessionValidation.isValid && confirmationData.buyer && confirmationData.raffle && confirmationData.vendor) {
            // Validar IDs específicos
            const buyerIdValidation = validateId(confirmationData.buyer.id, 'ID de comprador');
            const raffleIdValidation = validateId(confirmationData.raffle.id, 'ID de rifa');
            const vendorIdValidation = validateId(confirmationData.vendor.id, 'ID de vendedor');
            
            if (buyerIdValidation.isValid && raffleIdValidation.isValid && vendorIdValidation.isValid) {
              navigate('/confirmation', { state: confirmationData, replace: true });
              return;
            }
          }
        }
      } catch (error) {
        console.error('Error al recuperar datos de sessionStorage:', error);
      }
      
      // Si no hay datos en el estado ni en sessionStorage, redirigir al inicio
      navigate('/', { replace: true });
      return;
    }

    // Crear el valor del QR con los datos de la compra
    const qrData = {
      raffleId: state.buyer.raffleId,
      vendorId: state.buyer.vendorId,
      buyerId: state.buyer.id,
      numbers: state.buyer.numbers,
      timestamp: state.buyer.purchaseDate,
    };

    setQrValue(JSON.stringify(qrData));
    
    // Limpiar datos de sessionStorage una vez que se ha cargado correctamente
    try {
      sessionStorage.removeItem('confirmationData');
      sessionStorage.removeItem('paymentData');
    } catch (error) {
      console.error('Error al limpiar sessionStorage:', error);
    }
  }, [state, navigate]);

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

  const { buyer, raffle, vendor, userType } = state;
  const totalAmount = buyer.numbers.length * raffle.pricePerNumber;

  // Determinar si es un vendedor (por defecto asumimos que es comprador si no se especifica)
  const isVendor = userType === 'vendor';

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card border-success">
            <div className="card-header bg-success text-white">
              <h3 className="mb-0">¡Pago Procesado con Éxito!</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-7">
                  <h4 className="card-title">Detalles de tu Compra</h4>
                  <p className="card-text">
                    <strong>Rifa:</strong> {raffle.name}
                  </p>
                  <p className="card-text">
                    <strong>Vendedor:</strong> {vendor.name}
                  </p>
                  <p className="card-text">
                    <strong>Fecha de compra:</strong>{' '}
                    {new Date(buyer.purchaseDate).toLocaleString()}
                  </p>
                  <p className="card-text">
                    <strong>Números comprados:</strong>{' '}
                    {buyer.numbers.sort((a, b) => a - b).join(', ')}
                  </p>
                  <p className="card-text">
                    <strong>Total pagado:</strong> {formatPrice(totalAmount)}
                  </p>
                  <p className="card-text">
                    <strong>Fecha del sorteo:</strong>{' '}
                    {new Date(raffle.raffleDate).toLocaleDateString()}
                  </p>

                  <hr />

                  <h5>Tus Datos</h5>
                  <p className="card-text">
                    <strong>Nombre:</strong> {buyer.name}
                  </p>
                  <p className="card-text">
                    <strong>Email:</strong> {buyer.email}
                  </p>
                  <p className="card-text">
                    <strong>Teléfono:</strong> {buyer.phone}
                  </p>
                </div>
                <div className="col-md-5 text-center">
                  <div className="mb-3">
                    <QRCodeSVG value={qrValue} size={200} level="H" />
                  </div>
                  <p className="text-muted small">
                    Este QR contiene la información de tu compra. Guárdalo como comprobante.
                  </p>
                </div>
              </div>

              <div className="alert alert-info mt-4">
                <i className="bi bi-info-circle me-2"></i>
                Te hemos enviado un correo electrónico con los detalles de tu compra y el comprobante de pago. Si no lo
                recibes, revisa tu carpeta de spam.
              </div>
              
              <div className="alert alert-success mt-3">
                <i className="bi bi-check-circle me-2"></i>
                El pago ha sido procesado correctamente a través de nuestra plataforma de pagos segura.
              </div>

              <div className="d-grid gap-2 d-md-flex justify-content-md-center mt-4">
                <button
                  className="btn btn-primary me-md-2"
                  onClick={() => window.print()}
                >
                  <i className="bi bi-printer me-2"></i>
                  Imprimir Comprobante
                </button>
                <button
                  className="btn btn-success me-md-2"
                  onClick={() => {
                    try {
                      setShowQrSentAlert(true);
                      alert('QR enviado a su correo electrónico');
                      
                      // Después de 10 segundos, redirigir según el tipo de usuario
                      setTimeout(() => {
                        try {
                          // Asegurarse de que los IDs son válidos antes de navegar
                          if (state && state.raffle && state.raffle.id && state.vendor && state.vendor.id) {
                            if (isVendor) {
                              // Si es vendedor, redirigir a la página de venta
                              navigate(`/sell/${state.raffle.id}/${state.vendor.id}`);
                            } else {
                              // Si es comprador, cerrar la ventana
                              window.close();
                              setTimeout(() => {
                                alert('Por favor, cierre esta pestaña manualmente.');
                              }, 100);
                            }
                          } else {
                            // Si no hay IDs válidos, redirigir al inicio
                      
                            navigate('/');
                          }
                        } catch (error) {
                          console.error('Error al navegar:', error);
                          navigate('/');
                        }
                      }, 10000);
                    } catch (error) {
                      console.error('Error al enviar QR:', error);
                      alert('Error al enviar el QR. Inténtalo de nuevo.');
                    }
                  }}
                >
                  <i className="bi bi-envelope me-2"></i>
                  Enviar QR por Email
                </button>
                {isVendor ? (
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => {
                      try {
                        if (state && state.raffle && state.raffle.id) {
                          navigate(`/rafflemanagement/${state.raffle.id}`);
                        } else {
                    
                          navigate('/');
                        }
                      } catch (error) {
                        console.error('Error al navegar a gestión:', error);
                        navigate('/');
                      }
                    }}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Volver a Gestión
                  </button>
                ) : (
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      try {
                        // Cerrar la ventana/pestaña actual
                        window.close();
                        
                        // Si window.close() no funciona (por restricciones del navegador),
                        // mostrar un mensaje al usuario
                        setTimeout(() => {
                          alert('Por favor, cierre esta pestaña manualmente.');
                        }, 100);
                      } catch (error) {
                        console.error('Error al cerrar ventana:', error);
                        alert('Por favor, cierre esta pestaña manualmente.');
                      }
                    }}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Cerrar
                  </button>
                )}
              </div>
              
              {showQrSentAlert && (
                <div className="alert alert-success mt-3 text-center">
                  <i className="bi bi-envelope-check me-2"></i>
                  QR enviado a su correo electrónico. Será redirigido en unos segundos...
                </div>
              )}

              {/* Botones de compartir en redes sociales */}
              <div className="mt-4">
                <h5 className="text-center mb-3">¡Comparte tu participación!</h5>
                <SocialShareButtons
                   title={`¡Participo en la rifa: ${raffle.name}!`}
                   description={`Acabo de comprar los números ${buyer.numbers.sort((a, b) => a - b).join(', ')} para la rifa "${raffle.name}". ¡Sorteo el ${new Date(raffle.raffleDate).toLocaleDateString()}!`}
                   url={window.location.href}
                   imageUrl=""
                   hashtags={['rifa', 'suerte', 'premio', raffle.name.replace(/\s+/g, '')]}
                 />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;