import { useRaffle } from '../context/RaffleContext';
import { formatDate, formatPrice } from '../utils/helpers';
import { Vendor, Raffle } from '../types';

interface BuyersModalProps {
  vendor: Vendor;
  onClose: () => void;
  raffleData: Raffle;
}

const BuyersModal = ({ vendor, onClose, raffleData }: BuyersModalProps) => {
  const { getBuyersByVendorId } = useRaffle();
  const buyers = getBuyersByVendorId(vendor.id);

  return (
    <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Compradores de {vendor.name}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {buyers.length === 0 ? (
              <div className="alert alert-info">
                Este vendedor aún no tiene compradores registrados.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Nombre</th>
                      <th>Contacto</th>
                      <th>Números</th>
                      <th>Fecha de Compra</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buyers.map(buyer => (
                      <tr key={buyer.id}>
                        <td>{buyer.name}</td>
                        <td>
                          {buyer.email}
                          <br />
                          {buyer.phone}
                        </td>
                        <td>
                          {buyer.numbers.sort((a, b) => a - b).join(', ')}
                          <br />
                          <small className="text-muted">
                            {buyer.numbers.length} número(s)
                          </small>
                        </td>
                        <td>{formatDate(buyer.purchaseDate)}</td>
                        <td>
                          {formatPrice(buyer.numbers.length * raffleData.pricePerNumber)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="table-light">
                    <tr>
                      <td colSpan={3}>
                        <strong>Total de ventas:</strong>
                      </td>
                      <td>
                        <strong>{vendor.salesCount} números</strong>
                      </td>
                      <td>
                        <strong>
                          {formatPrice(vendor.salesCount * raffleData.pricePerNumber)}
                        </strong>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyersModal;