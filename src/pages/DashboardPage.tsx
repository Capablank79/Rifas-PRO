import { useState, useEffect } from 'react';
import { useRaffle } from '../context/RaffleContext';
import { formatPrice } from '../utils/helpers';

const DashboardPage = () => {
  const { raffles, vendors, buyers, results } = useRaffle();
  const [stats, setStats] = useState({
    totalRaffles: 0,
    activeRaffles: 0,
    completedRaffles: 0,
    totalVendors: 0,
    totalBuyers: 0,
    totalRevenue: 0,
    totalNumbersSold: 0,
    totalNumbersAvailable: 0,
    averageTicketPrice: 0,
    topVendor: null as any,
    recentActivity: [] as any[]
  });

  useEffect(() => {
    calculateStats();
  }, [raffles, vendors, buyers, results]);

  const calculateStats = () => {
    const activeRaffles = raffles.filter(r => r.status === 'active');
    const completedRaffles = raffles.filter(r => r.status === 'completed');
    
    // Calcular números vendidos y disponibles
    let totalNumbersSold = 0;
    let totalNumbersAvailable = 0;
    let totalRevenue = 0;

    raffles.forEach(raffle => {
      const raffleBuyers = buyers.filter(buyer => 
        vendors.some(vendor => vendor.raffleId === raffle.id && vendor.id === buyer.vendorId)
      );
      
      const soldNumbers = raffleBuyers.reduce((sum, buyer) => sum + buyer.numbers.length, 0);
      const availableNumbers = raffle.vendorsCount * raffle.numbersPerVendor;
      
      totalNumbersSold += soldNumbers;
      totalNumbersAvailable += availableNumbers;
      totalRevenue += soldNumbers * raffle.pricePerNumber;
    });

    // Calcular vendedor top
    const vendorStats = vendors.map(vendor => {
      const vendorBuyers = buyers.filter(buyer => buyer.vendorId === vendor.id);
      const salesCount = vendorBuyers.reduce((sum, buyer) => sum + buyer.numbers.length, 0);
      const raffle = raffles.find(r => r.id === vendor.raffleId);
      const revenue = salesCount * (raffle?.pricePerNumber || 0);
      
      return {
        ...vendor,
        salesCount,
        revenue
      };
    });
    const topVendor = vendorStats.length > 0 
      ? vendorStats.reduce((top, current) => 
          current.salesCount > top.salesCount ? current : top
        )
      : null;

    // Actividad reciente (últimas ventas)
    const recentActivity = buyers
      .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
      .slice(0, 5)
      .map(buyer => {
        const vendor = vendors.find(v => v.id === buyer.vendorId);
        const raffle = raffles.find(r => r.id === vendor?.raffleId);
        return {
          ...buyer,
          vendorName: vendor?.name,
          raffleName: raffle?.name,
          amount: buyer.numbers.length * (raffle?.pricePerNumber || 0)
        };
      });

    setStats({
      totalRaffles: raffles.length,
      activeRaffles: activeRaffles.length,
      completedRaffles: completedRaffles.length,
      totalVendors: vendors.length,
      totalBuyers: buyers.length,
      totalRevenue,
      totalNumbersSold,
      totalNumbersAvailable,
      averageTicketPrice: raffles.length > 0 ? 
        raffles.reduce((sum, r) => sum + r.pricePerNumber, 0) / raffles.length : 0,
      topVendor,
      recentActivity
    });
  };

  const getProgressPercentage = () => {
    if (stats.totalNumbersAvailable === 0) return 0;
    return Math.round((stats.totalNumbersSold / stats.totalNumbersAvailable) * 100);
  };

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="h2 mb-0">
            <i className="bi bi-graph-up me-2"></i>
            Dashboard de Estadísticas
          </h1>
          <p className="text-muted">Resumen general del sistema de rifas</p>
        </div>
      </div>

      {/* Tarjetas de estadísticas principales */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Total Rifas
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats.totalRaffles}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-gift fs-2 text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-success shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Ingresos Totales
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    ${stats.totalRevenue.toLocaleString('es-CL')}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-currency-dollar fs-2 text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-info shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                    Números Vendidos
                  </div>
                  <div className="row no-gutters align-items-center">
                    <div className="col-auto">
                      <div className="h5 mb-0 mr-3 font-weight-bold text-gray-800">
                        {getProgressPercentage()}%
                      </div>
                    </div>
                    <div className="col">
                      <div className="progress progress-sm mr-2">
                        <div 
                          className="progress-bar bg-info" 
                          role="progressbar"
                          style={{ width: `${getProgressPercentage()}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-clipboard-data fs-2 text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-warning shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                    Total Compradores
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats.totalBuyers}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-people fs-2 text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos y estadísticas detalladas */}
      <div className="row">
        {/* Estado de Rifas */}
        <div className="col-xl-4 col-lg-5">
          <div className="card shadow mb-4">
            <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
              <h6 className="m-0 font-weight-bold text-primary">Estado de Rifas</h6>
            </div>
            <div className="card-body">
              <div className="chart-pie pt-4 pb-2">
                <div className="row text-center">
                  <div className="col-6">
                    <div className="border-left-success py-3">
                      <div className="h5 mb-0 font-weight-bold text-success">
                        {stats.activeRaffles}
                      </div>
                      <div className="text-xs text-uppercase">Activas</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="border-left-danger py-3">
                      <div className="h5 mb-0 font-weight-bold text-danger">
                        {stats.completedRaffles}
                      </div>
                      <div className="text-xs text-uppercase">Completadas</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vendedor Top */}
        <div className="col-xl-4 col-lg-7">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Vendedor Destacado</h6>
            </div>
            <div className="card-body">
              {stats.topVendor ? (
                <div className="text-center">
                  <div className="mb-3">
                    <i className="bi bi-trophy-fill fs-1 text-warning"></i>
                  </div>
                  <h5 className="font-weight-bold">{stats.topVendor.name}</h5>
                  <p className="text-muted mb-2">{stats.topVendor.email}</p>
                  <div className="row">
                    <div className="col-6">
                      <div className="border-right">
                        <div className="h6 mb-0 font-weight-bold">
                          {stats.topVendor.salesCount}
                        </div>
                        <div className="text-xs text-uppercase">Números Vendidos</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="h6 mb-0 font-weight-bold">
                        ${stats.topVendor.revenue?.toLocaleString('es-CL')}
                      </div>
                      <div className="text-xs text-uppercase">Ingresos</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted">
                  <i className="bi bi-person-x fs-1"></i>
                  <p>No hay vendedores registrados</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Estadísticas adicionales */}
        <div className="col-xl-4">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Estadísticas Generales</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="small text-gray-500">Total Vendedores</div>
                <div className="h6 mb-0">{stats.totalVendors}</div>
              </div>
              <div className="mb-3">
                <div className="small text-gray-500">Precio Promedio por Número</div>
                <div className="h6 mb-0">${Math.round(stats.averageTicketPrice).toLocaleString('es-CL')}</div>
              </div>
              <div className="mb-3">
                <div className="small text-gray-500">Números Disponibles</div>
                <div className="h6 mb-0">{stats.totalNumbersAvailable.toLocaleString('es-CL')}</div>
              </div>
              <div className="mb-3">
                <div className="small text-gray-500">Números Vendidos</div>
                <div className="h6 mb-0">{stats.totalNumbersSold.toLocaleString('es-CL')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Actividad Reciente</h6>
            </div>
            <div className="card-body">
              {stats.recentActivity.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Comprador</th>
                        <th>Rifa</th>
                        <th>Vendedor</th>
                        <th>Números</th>
                        <th>Monto</th>
                        <th>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentActivity.map((activity, index) => (
                        <tr key={index}>
                          <td>
                            <div className="font-weight-bold">{activity.name}</div>
                            <div className="text-muted small">{activity.email}</div>
                          </td>
                          <td>{activity.raffleName}</td>
                          <td>{activity.vendorName}</td>
                          <td>
                            <span className="badge badge-primary">
                              {activity.numbers.length} números
                            </span>
                          </td>
                          <td className="font-weight-bold text-success">
                            ${activity.amount?.toLocaleString('es-CL')}
                          </td>
                          <td>{new Date(activity.purchaseDate).toLocaleDateString('es-ES')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  <i className="bi bi-clock-history fs-1"></i>
                  <p>No hay actividad reciente</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;