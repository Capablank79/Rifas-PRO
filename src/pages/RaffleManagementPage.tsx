import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRaffle } from '../context/RaffleContext';
import { formatDate, formatPrice, calculatePercentage, getRandomElement } from '../utils/helpers';
import { Vendor, Buyer } from '../types';
import VendorModal from '../components/VendorModal';
import VendorExcelModal from '../components/VendorExcelModal';
import EditVendorModal from '../components/EditVendorModal';
import BuyersModal from '../components/BuyersModal';
import DrawModal from '../components/DrawModal';
import HamburgerMenu from '../components/HamburgerMenu';
import SocialShareButtons from '../components/SocialShareButtons';

// Declaración global para Bootstrap
declare global {
  interface Window {
    bootstrap: any;
  }
}

const RaffleManagementPage = () => {
  const { id: raffleId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRaffleById, getVendorsByRaffleId, getBuyersByVendorId, getBuyersByRaffleId, getMultipleResultsByRaffleId } = useRaffle();

  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showVendorExcelModal, setShowVendorExcelModal] = useState(false);
  const [showEditVendorModal, setShowEditVendorModal] = useState(false);
  const [showBuyersModal, setShowBuyersModal] = useState(false);
  const [showDrawModal, setShowDrawModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [vendorToEdit, setVendorToEdit] = useState<Vendor | null>(null);

  if (!raffleId) {
    return <div className="alert alert-danger">ID de rifa no válido</div>;
  }

  // Memoizar datos de la rifa
  const raffle = useMemo(() => getRaffleById(raffleId), [getRaffleById, raffleId]);
  const vendors = useMemo(() => getVendorsByRaffleId(raffleId), [getVendorsByRaffleId, raffleId]);
  const multipleResults = useMemo(() => getMultipleResultsByRaffleId(raffleId), [getMultipleResultsByRaffleId, raffleId]);

  // Memoizar cálculos costosos
  const totalSales = useMemo(() => vendors.reduce((acc, vendor) => acc + vendor.salesCount, 0), [vendors]);
  const totalPossibleSales = useMemo(() => raffle ? raffle.vendorsCount * raffle.numbersPerVendor : 0, [raffle]);
  const salesPercentage = useMemo(() => calculatePercentage(totalSales, totalPossibleSales), [totalSales, totalPossibleSales]);

  if (!raffle) {
    return (
      <div className="container">
        <div className="alert alert-danger">
          <h4 className="alert-heading">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Rifa no encontrada
          </h4>
          <p className="mb-3">
            La rifa con ID <code>{raffleId}</code> no existe o ha sido eliminada.
          </p>
          <hr />
          <div className="d-flex gap-2">
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/')}
            >
              <i className="bi bi-house-fill me-1"></i>
              Ir al Inicio
            </button>
            <button 
              className="btn btn-outline-primary"
              onClick={() => navigate('/create')}
            >
              <i className="bi bi-plus-circle me-1"></i>
              Crear Nueva Rifa
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleOpenBuyersModal = useCallback((vendor: Vendor) => {
    setSelectedVendor(vendor);
    setShowBuyersModal(true);
  }, []);

  const handleEditVendor = useCallback((vendor: Vendor) => {
    setVendorToEdit(vendor);
    setShowEditVendorModal(true);
  }, []);

  const handleEditVendorSuccess = useCallback(() => {
    // Refrescar la página para mostrar los datos actualizados
    window.location.reload();
  }, []);

  const handleStartDraw = useCallback(() => {
    // Verificar si hay ventas para realizar el sorteo
    if (totalSales === 0) {
      alert('No hay ventas registradas para realizar el sorteo');
      return;
    }

    setShowDrawModal(true);
  }, [totalSales]);

  // Inicializar carrusel automáticamente
  useEffect(() => {
    if (typeof window !== 'undefined' && window.bootstrap && raffle) {
      const carouselElement = document.getElementById('raffleImagesCarousel');
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Gestión de Rifa: {raffle.name}</h1>
        <div className="d-flex gap-2">
          <HamburgerMenu />
        </div>
      </div>
      
      {/* Mensaje para rifas completadas */}
      {raffle.status === 'completed' && (
        <div className="alert alert-info mb-4">
          <h5 className="alert-heading">
            <i className="bi bi-check-circle-fill me-2"></i>
            Rifa Completada
          </h5>
          <p className="mb-0">
            Esta rifa ya fue sorteada. Los ganadores han sido notificados y no se pueden realizar más ventas.
            Puedes consultar los resultados del sorteo a continuación.
          </p>
        </div>
      )}

      <div className="row mb-4">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Detalles de la Rifa</h5>
              <div className="row">
                <div className="col-md-6">
                  <p>
                    <strong>Precio por número:</strong> {formatPrice(raffle.pricePerNumber)}
                  </p>
                  <p>
                    <strong>Vendedores:</strong> {vendors.length} / {raffle.vendorsCount}
                  </p>
                  <p>
                    <strong>Números por vendedor:</strong> {raffle.numbersPerVendor}
                  </p>
                  <p>
                    <strong>Fecha del sorteo:</strong> {formatDate(raffle.raffleDate)}
                  </p>
                </div>
                <div className="col-md-6">
                  <p>
                    <strong>Estado:</strong>{' '}
                    <span
                      className={`badge ${raffle.status === 'active' ? 'bg-success' : 'bg-secondary'}`}
                    >
                      {raffle.status === 'active' ? 'Activa' : 'Completada'}
                    </span>
                  </p>
                  <p>
                    <strong>Ventas totales:</strong> {totalSales} / {totalPossibleSales} números
                    <br />
                    <strong>Recaudación total:</strong> ${(raffle.pricePerNumber * totalSales).toLocaleString()}
                  </p>
                  <p>
                    <strong>Progreso:</strong> {salesPercentage}%
                  </p>
                  <div className="progress">
                    <div
                      className="progress-bar bg-success"
                      role="progressbar"
                      style={{ width: `${salesPercentage}%` }}
                      aria-valuenow={salesPercentage}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Imágenes del Premio</h5>
              <div id="raffleImagesCarousel" className="carousel slide" data-bs-ride="carousel" data-bs-interval="3000">
                <div className="carousel-inner">
                  {(raffle.prizes && raffle.prizes.length > 0 ? raffle.prizes : raffle.images.map((image, index) => ({ id: `img-${index}`, name: `Premio ${index + 1}`, description: '', image }))).map((prize, index) => (
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
                      data-bs-target="#raffleImagesCarousel"
                      data-bs-slide="prev"
                    >
                      <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                      <span className="visually-hidden">Anterior</span>
                    </button>
                    <button
                      className="carousel-control-next"
                      type="button"
                      data-bs-target="#raffleImagesCarousel"
                      data-bs-slide="next"
                    >
                      <span className="carousel-control-next-icon" aria-hidden="true"></span>
                      <span className="visually-hidden">Siguiente</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de Compartir en Redes Sociales */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title text-center mb-3">
                <i className="bi bi-share me-2"></i>
                ¡Comparte esta rifa!
              </h5>
              <SocialShareButtons
                  title={`🎯 ¡Participa en la rifa: ${raffle.name}!`}
                  description={`Premio increíble por solo ${formatPrice(raffle.pricePerNumber)} por número. Sorteo el ${formatDate(raffle.raffleDate)}. ¡No te lo pierdas!`}
                  url={`${window.location.origin}/raffle/${raffle.id}`}
                  imageUrl={raffle.images[0]}
                  hashtags={['rifa', 'sorteo', 'premio', raffle.name.replace(/\s+/g, '')]}
                />
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Resultados del Sorteo */}
      {raffle.status === 'completed' && multipleResults && multipleResults.winners && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title mb-4">
                  <i className="bi bi-trophy-fill text-warning me-2"></i>
                  Resultados del Sorteo
                </h5>
                
                <div className="alert alert-success">
                  <p className="mb-2">
                    <strong>Fecha del sorteo:</strong> {new Date(multipleResults.drawDate).toLocaleString()}
                  </p>
                  <p className="mb-0">
                    <strong>Total de premios sorteados:</strong> {multipleResults.totalPrizes}
                  </p>
                </div>

                <div className="row">
                  {multipleResults.winners.map((result, index) => {
                    const winnerBuyer = getBuyersByRaffleId(raffleId).find(buyer => buyer.id === result.buyerId);
                    const seller = vendors.find(vendor => vendor.id === result.vendorId);
                    
                    return (
                      <div key={index} className="col-md-6 mb-3">
                        <div className="card border-success">
                          <div className="card-header bg-success text-white">
                            <div className="d-flex justify-content-between align-items-center">
                              <h6 className="mb-0">
                                <span className="badge bg-light text-dark me-2">{result.prizePosition}°</span>
                                {result.prizeName}
                              </h6>
                              <span className="badge bg-warning text-dark fs-6">#{result.winningNumber}</span>
                            </div>
                          </div>
                          <div className="card-body">
                            {winnerBuyer && (
                              <>
                                <p className="mb-2">
                                  <strong>Ganador:</strong> {winnerBuyer.name}
                                </p>
                                <p className="mb-2">
                                  <strong>Contacto:</strong> {winnerBuyer.email}
                                  <br />
                                  <small className="text-muted">{winnerBuyer.phone}</small>
                                </p>
                                <p className="mb-2">
                                  <strong>Vendedor:</strong> {seller?.name || 'N/A'}
                                </p>
                                <p className="mb-0">
                                  <strong>Fecha de compra:</strong> {new Date(winnerBuyer.purchaseDate).toLocaleDateString()}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3">
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => {
                      const resultsText = multipleResults.winners?.map((result, index) => {
                        const winnerBuyer = getBuyersByRaffleId(raffleId).find(buyer => buyer.id === result.buyerId);
                        return `${result.prizePosition}° Premio: ${result.prizeName}\nGanador: ${winnerBuyer?.name || 'N/A'}\nNúmero: #${result.winningNumber}\nContacto: ${winnerBuyer?.email || 'N/A'} - ${winnerBuyer?.phone || 'N/A'}\n`;
                      }).join('\n') || '';
                      
                      const fullText = `RESULTADOS DEL SORTEO\n${raffle.name}\nFecha: ${new Date(multipleResults.drawDate).toLocaleString()}\n\n${resultsText}`;
                      
                      navigator.clipboard.writeText(fullText);
                      alert('Resultados copiados al portapapeles');
                    }}
                  >
                    <i className="bi bi-clipboard me-1"></i>
                    Copiar Resultados
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">Gestión de Vendedores</h5>
                <div className="d-flex gap-2">
                  {raffle.status === 'active' && vendors.length < raffle.vendorsCount && (
                    <>
                      <div className="btn-group" role="group">
                        <button
                          className="btn btn-primary"
                          onClick={() => setShowVendorModal(true)}
                        >
                          <i className="bi bi-person-plus me-1"></i>
                          Añadir Vendedor
                        </button>
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => setShowVendorExcelModal(true)}
                          title="Gestión masiva con Excel"
                        >
                          <i className="bi bi-file-earmark-excel"></i>
                        </button>
                      </div>
                    </>
                  )}
                  {raffle.status === 'active' && totalSales > 0 && (
                    <button className="btn btn-success" onClick={handleStartDraw}>
                      <i className="bi bi-trophy me-1"></i>
                      Realizar Sorteo
                    </button>
                  )}
                </div>
              </div>

              {/* Información adicional sobre gestión masiva */}
              {raffle.status === 'active' && vendors.length < raffle.vendorsCount && (
                <div className="alert alert-light border-0 mb-3">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-lightbulb text-warning me-2"></i>
                    <small className="text-muted">
                      <strong>Tip:</strong> Usa el botón <i className="bi bi-file-earmark-excel"></i> para agregar múltiples vendedores desde un archivo Excel.
                    </small>
                  </div>
                </div>
              )}

              {vendors.length === 0 ? (
                <div className="alert alert-info">
                  No hay vendedores registrados. Añade vendedores para comenzar a vender números.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Nombre</th>
                        <th>Contacto</th>
                        <th>Código</th>
                        <th>Ventas</th>
                        <th>Progreso</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendors.map(vendor => {
                        const vendorProgress = calculatePercentage(
                          vendor.salesCount,
                          raffle.numbersPerVendor
                        );
                        return (
                          <tr key={vendor.id}>
                            <td>{vendor.name}</td>
                            <td>
                              {vendor.email}
                              <br />
                              {vendor.phone}
                            </td>
                            <td>
                              <small className="text-muted">{vendor.id.substring(0, 8)}</small>
                              <br />
                              <div className="d-flex flex-column gap-1">
                                <div className="d-flex gap-1">
                                  <button
                                    className={`btn btn-sm btn-outline-primary flex-grow-1 ${raffle.status !== 'active' ? 'disabled' : ''}`}
                                    onClick={() => {
                                      if (raffle.status !== 'active') {
                                        alert('Esta rifa ya fue sorteada. No se pueden generar más enlaces de venta.');
                                        return;
                                      }
                                      const vendorLink = `${window.location.origin}/sell/${raffleId}/${vendor.id}`;
                                      navigator.clipboard.writeText(vendorLink);
                                      alert('Enlace de venta copiado al portapapeles');
                                    }}
                                    disabled={raffle.status !== 'active'}
                                  >
                                    <i className="bi bi-clipboard me-1"></i> Link Vendedor
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => window.location.reload()}
                                    title="Refrescar datos"
                                  >
                                    <i className="bi bi-arrow-clockwise"></i>
                                  </button>
                                </div>
                                <div className="d-flex gap-1">
                                  <button
                                    className={`btn btn-sm btn-outline-success flex-grow-1 ${raffle.status !== 'active' ? 'disabled' : ''}`}
                                    onClick={() => {
                                      if (raffle.status !== 'active') {
                                        alert('Esta rifa ya fue sorteada. No se pueden generar más enlaces de compra.');
                                        return;
                                      }
                                      const buyerLink = `${window.location.origin}/comprar/${raffleId}/${vendor.id}`;
                                      navigator.clipboard.writeText(buyerLink);
                                      alert('Enlace de compra copiado al portapapeles');
                                    }}
                                    disabled={raffle.status !== 'active'}
                                  >
                                    <i className="bi bi-cart me-1"></i> Link Comprador
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => window.location.reload()}
                                    title="Refrescar datos"
                                  >
                                    <i className="bi bi-arrow-clockwise"></i>
                                  </button>
                                </div>
                                <button
                                  className={`btn btn-sm btn-success ${raffle.status !== 'active' ? 'disabled' : ''}`}
                                  onClick={() => {
                                    if (raffle.status !== 'active') {
                                      alert('Esta rifa ya fue sorteada. No se puede acceder a la página de venta.');
                                      return;
                                    }
                                    navigate(`/sell/${raffleId}/${vendor.id}`);
                                  }}
                                  disabled={raffle.status !== 'active'}
                                >
                                  <i className="bi bi-arrow-right me-1"></i> Ir a Página de Venta
                                </button>
                              </div>
                            </td>
                            <td>
                              {vendor.salesCount} / {raffle.numbersPerVendor}
                            </td>
                            <td>
                              <div className="progress">
                                <div
                                  className={`progress-bar ${vendorProgress < 50 ? 'bg-warning' : 'bg-success'}`}
                                  role="progressbar"
                                  style={{ width: `${vendorProgress}%` }}
                                  aria-valuenow={vendorProgress}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                >
                                  {vendorProgress}%
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="d-flex flex-column gap-1">
                                <button
                                  className="btn btn-sm btn-info"
                                  onClick={() => handleOpenBuyersModal(vendor)}
                                  title="Ver compradores de este vendedor"
                                >
                                  <i className="bi bi-people me-1"></i>
                                  Ver Compradores
                                </button>
                                <button
                                  className="btn btn-sm btn-warning"
                                  onClick={() => handleEditVendor(vendor)}
                                  title="Editar datos del vendedor"
                                >
                                  <i className="bi bi-pencil-square me-1"></i>
                                  Editar Datos
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal para añadir vendedor */}
      {showVendorModal && (
        <VendorModal
          raffleId={raffleId}
          onClose={() => setShowVendorModal(false)}
          numbersPerVendor={raffle.numbersPerVendor}
          raffleName={raffle.name}
        />
      )}

      {/* Modal para gestión masiva de vendedores con Excel */}
      {showVendorExcelModal && (
        <VendorExcelModal
          raffleId={raffleId}
          onClose={() => setShowVendorExcelModal(false)}
          numbersPerVendor={raffle.numbersPerVendor}
          raffleName={raffle.name}
          maxVendors={raffle.vendorsCount}
          currentVendorsCount={vendors.length}
        />
      )}

      {/* Modal para ver compradores */}
      {showBuyersModal && selectedVendor && (
        <BuyersModal
          vendor={selectedVendor}
          onClose={() => setShowBuyersModal(false)}
          raffleData={raffle}
        />
      )}

      {/* Modal para editar vendedor */}
      {showEditVendorModal && vendorToEdit && (
        <EditVendorModal
          vendor={vendorToEdit}
          onClose={() => setShowEditVendorModal(false)}
          onSuccess={handleEditVendorSuccess}
        />
      )}

      {/* Modal para realizar sorteo */}
      {showDrawModal && (
        <DrawModal
          raffle={raffle}
          vendors={vendors}
          onClose={() => setShowDrawModal(false)}
        />
      )}
    </div>
  );
};

export default RaffleManagementPage;