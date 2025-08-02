import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRaffle } from '../context/RaffleContext';
import { Raffle, Vendor, Buyer, RaffleResult, MultipleDrawResult } from '../types';
import { formatPrice, getRandomNumber } from '../utils/helpers';
import { sendWinnerNotification, sendVendorNotification, WinnerNotificationData, VendorNotificationData } from '../services/emailService';

interface DrawModalProps {
  raffle: Raffle;
  vendors: Vendor[];
  onClose: () => void;
}

const DrawModal = ({ raffle, vendors, onClose }: DrawModalProps) => {
  const { updateRaffleStatus, getBuyersByRaffleId, setMultipleRaffleResults } = useRaffle();
  const [isDrawing, setIsDrawing] = useState(false);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [winner, setWinner] = useState<Buyer | null>(null);
  const [sellerName, setSellerName] = useState<string>('');
  const [drawComplete, setDrawComplete] = useState(false);
  const [drawingNumbers, setDrawingNumbers] = useState<number[]>([]);
  const [winners, setWinners] = useState<RaffleResult[]>([]);
  const [currentPrizeDrawing, setCurrentPrizeDrawing] = useState(0);
  const [allDrawsComplete, setAllDrawsComplete] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [vendorEmailsSending, setVendorEmailsSending] = useState(false);
  const [vendorEmailsSent, setVendorEmailsSent] = useState(false);

  // Memoizar cálculos costosos
  const allBuyers = useMemo(() => getBuyersByRaffleId(raffle.id), [getBuyersByRaffleId, raffle.id]);
  
  // Obtener todos los números vendidos
  const soldNumbers = useMemo(() => {
    const numbers: number[] = [];
    allBuyers.forEach(buyer => {
      buyer.numbers.forEach(number => {
        numbers.push(number);
      });
    });
    return numbers;
  }, [allBuyers]);

  useEffect(() => {
    // Efecto para la animación del sorteo
    if (isDrawing && !drawComplete) {
      const interval = setInterval(() => {
        // Generar un número aleatorio entre los vendidos
        if (soldNumbers.length > 0) {
          const randomIndex = Math.floor(Math.random() * soldNumbers.length);
          const randomNumber = soldNumbers[randomIndex];
          setDrawingNumbers(prev => [...prev, randomNumber].slice(-10)); // Mantener solo los últimos 10 números
        }
      }, 100);

      // Detener la animación después de 3 segundos
      setTimeout(() => {
        clearInterval(interval);
        determineWinner();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isDrawing, drawComplete, soldNumbers]);

  const startDraw = useCallback(() => {
    setIsDrawing(true);
  }, []);

  const determineWinner = useCallback(() => {
    if (soldNumbers.length === 0) {
      alert('No hay números vendidos para realizar el sorteo');
      setIsDrawing(false);
      return;
    }

    // Obtener números que ya ganaron premios
    const usedNumbers = winners.map(w => w.winningNumber);
    
    // Filtrar solo los números que no han ganado aún (no los compradores)
    const eligibleNumbers = soldNumbers.filter(num => !usedNumbers.includes(num));

    if (eligibleNumbers.length === 0) {
      alert('No hay más números elegibles para sortear.');
      setIsDrawing(false);
      return;
    }

    // Seleccionar número ganador
    const randomIndex = Math.floor(Math.random() * eligibleNumbers.length);
    const selectedNumber = eligibleNumbers[randomIndex];
    
    // Encontrar al comprador del número ganador
    const winningBuyer = allBuyers.find(buyer => 
      buyer.numbers.includes(selectedNumber)
    );

    if (winningBuyer) {
      // Encontrar el vendedor del ganador
      const seller = vendors.find(vendor => vendor.id === winningBuyer.vendorId);
      
      const prize = raffle.prizes && raffle.prizes[currentPrizeDrawing] ? raffle.prizes[currentPrizeDrawing] : null;
      
      const result: RaffleResult = {
        raffleId: raffle.id,
        winningNumber: selectedNumber,
        vendorId: winningBuyer.vendorId,
        buyerId: winningBuyer.id,
        buyerName: winningBuyer.name,
        buyerContact: `${winningBuyer.email} - ${winningBuyer.phone}`,
        drawDate: new Date().toISOString(),
        prizeId: prize?.id,
        prizeName: prize?.name || `Premio ${currentPrizeDrawing + 1}`,
        prizePosition: currentPrizeDrawing + 1
      };

      const newWinners = [...winners, result];
      setWinners(newWinners);
      
      // Establecer ganador actual para la UI
      setWinningNumber(selectedNumber);
      setWinner(winningBuyer);
      if (seller) {
        setSellerName(seller.name);
      }

      setDrawComplete(true);
      setIsDrawing(false);
      
      // Enviar notificación por email al ganador
      sendEmailNotification(result, winningBuyer, seller);
    }
  }, [soldNumbers, winners, allBuyers, vendors, raffle, currentPrizeDrawing]);

  // Función para enviar notificación al vendedor del ganador
  const sendVendorNotifications = useCallback(async (result: RaffleResult, winningBuyer: Buyer, winningSeller?: Vendor) => {
    // Solo notificar al vendedor que le vendió el número al ganador
    if (!winningSeller) {
      
      return;
    }
    
    setVendorEmailsSending(true);
    
    try {
      // Calcular total de ventas del vendedor en esta rifa específica
      const raffleBuyers = allBuyers.filter(buyer => buyer.raffleId === raffle.id && buyer.vendorId === winningSeller.id);
      const totalSales = raffleBuyers.reduce((total, buyer) => total + (buyer.numbers.length * raffle.pricePerNumber), 0);
      
      const vendorEmailData: VendorNotificationData = {
        vendorName: winningSeller.name,
        vendorEmail: winningSeller.email,
        raffleName: raffle.name,
        winnerName: winningBuyer.name,
        prizeName: result.prizeName || `Premio ${currentPrizeDrawing + 1}`,
        prizePosition: result.prizePosition || (currentPrizeDrawing + 1),
        winningNumber: result.winningNumber,
        drawDate: result.drawDate,
        isTheirCustomer: true, // Siempre es su cliente porque le vendió el número ganador
        totalSales
      };
      
      const vendorEmailSent = await sendVendorNotification(vendorEmailData);
      
      if (vendorEmailSent) {

      } else {
        console.error(`❌ Error al enviar notificación al vendedor: ${winningSeller.name}`);
      }
      
    } catch (error) {
      console.error('❌ Error al procesar envío de notificación al vendedor:', error);
    } finally {
      setVendorEmailsSending(false);
      setVendorEmailsSent(true);
    }
  }, [allBuyers, raffle, currentPrizeDrawing]);

  // Función para enviar notificación por email
  const sendEmailNotification = useCallback(async (result: RaffleResult, winningBuyer: Buyer, seller?: Vendor) => {
    setEmailSending(true);
    setEmailSent(false);
    
    try {
      // Enviar email al ganador
      const emailData: WinnerNotificationData = {
        winnerName: winningBuyer.name,
        winnerEmail: winningBuyer.email,
        raffleName: raffle.name,
        prizeName: result.prizeName || `Premio ${currentPrizeDrawing + 1}`,
        prizePosition: result.prizePosition || (currentPrizeDrawing + 1),
        winningNumber: result.winningNumber,
        drawDate: result.drawDate,
        sellerName: seller?.name
      };
      
      const emailSent = await sendWinnerNotification(emailData);
      
      if (emailSent) {
        setEmailSent(true);
  
      } else {
        console.error('❌ Error al enviar la notificación por email');
      }
      
      // Enviar notificaciones a todos los vendedores
      await sendVendorNotifications(result, winningBuyer, seller);
      
    } catch (error) {
      console.error('❌ Error al procesar el envío de email:', error);
    } finally {
      setEmailSending(false);
    }
  }, [raffle, currentPrizeDrawing, sendVendorNotifications]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const continueDrawing = useCallback(() => {
    setCurrentPrizeDrawing(prev => prev + 1);
    setDrawComplete(false);
    setWinningNumber(null);
    setWinner(null);
    setSellerName('');
    setDrawingNumbers([]);
    // Resetear estados de email para el siguiente sorteo
    setEmailSending(false);
    setEmailSent(false);
    setVendorEmailsSending(false);
    setVendorEmailsSent(false);
  }, []);

  const finishAllDraws = useCallback(() => {
    // Guardar todos los resultados
    const multipleResult: MultipleDrawResult = {
      raffleId: raffle.id,
      drawDate: new Date().toISOString(),
      winners: winners,
      totalPrizes: winners.length
    };
    
    setMultipleRaffleResults(multipleResult);
    setAllDrawsComplete(true);
    updateRaffleStatus(raffle.id, 'completed');
  }, [raffle.id, winners, setMultipleRaffleResults, updateRaffleStatus]);

  // Verificar si hay más premios disponibles
  const hasMorePrizes = useCallback(() => {
    const totalPrizes = raffle.prizes?.length || 1;
    return currentPrizeDrawing < totalPrizes - 1;
  }, [raffle.prizes?.length, currentPrizeDrawing]);

  // Verificar si hay más números elegibles
  const hasEligibleNumbers = useCallback(() => {
    const usedNumbers = winners.map(w => w.winningNumber);
    return soldNumbers.some(num => !usedNumbers.includes(num));
  }, [winners, soldNumbers]);

  return (
    <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Sorteo de Rifa: {raffle.name}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body text-center">
            {!isDrawing && !drawComplete ? (
              <div>
                <p className="mb-4">¿Estás seguro de que deseas realizar el sorteo ahora?</p>
                <p>Una vez realizado el sorteo, la rifa se marcará como completada y no se podrán vender más números.</p>
                
                <div className="alert alert-info">
                  <p className="mb-2">
                    <strong>Números vendidos:</strong> {soldNumbers.length} de {raffle.vendorsCount * raffle.numbersPerVendor}
                  </p>
                  <p className="mb-2">
                    <strong>Premios disponibles:</strong> {raffle.prizes?.length || 1}
                  </p>
                  <p className="mb-0">
                    <strong>Premio actual:</strong> {currentPrizeDrawing + 1}° - {raffle.prizes?.[currentPrizeDrawing]?.name || `Premio ${currentPrizeDrawing + 1}`}
                  </p>
                </div>

                {winners.length > 0 && (
                  <div className="alert alert-success">
                    <h6>Ganadores anteriores:</h6>
                    {winners.map((winner, index) => (
                      <p key={index} className="mb-1">
                        <strong>{winner.prizePosition}° Premio:</strong> {winner.prizeName} - #{winner.winningNumber} ({winner.buyerName})
                      </p>
                    ))}
                  </div>
                )}

                <button className="btn btn-primary btn-lg mt-3" onClick={startDraw}>
                  Iniciar Sorteo
                </button>
              </div>
            ) : isDrawing && !drawComplete ? (
              <div>
                <h3 className="mb-4">¡Sorteando!</h3>
                <div className="drawing-animation mb-4">
                  <div className="drawing-numbers">
                    {drawingNumbers.map((num, index) => (
                      <span 
                        key={index} 
                        className="badge bg-primary mx-1" 
                        style={{ 
                          fontSize: '1.5rem', 
                          opacity: (index / drawingNumbers.length) + 0.3 
                        }}
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </div>
                <p>Seleccionando un número ganador...</p>
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
              </div>
            ) : (
              <div className="result-container">
                <h3 className="mb-4">
                  ¡Tenemos un ganador para el {currentPrizeDrawing + 1}° premio!
                </h3>
                
                <div className="current-winner mb-4">
                  <div className="alert alert-success">
                    <h5 className="mb-3">
                      <span className="badge bg-primary me-2">{currentPrizeDrawing + 1}°</span>
                      {raffle.prizes?.[currentPrizeDrawing]?.name || `Premio ${currentPrizeDrawing + 1}`}
                    </h5>
                    <div className="winner-number mb-3">
                      <span className="display-4 badge bg-success">#{winningNumber}</span>
                    </div>
                    {winner && (
                      <div className="winner-info">
                        <p className="mb-1"><strong>Ganador:</strong> {winner.name}</p>
                        <p className="mb-1"><strong>Email:</strong> {winner.email}</p>
                        <p className="mb-1"><strong>Teléfono:</strong> {winner.phone}</p>
                        <p className="mb-1"><strong>Vendedor:</strong> {sellerName}</p>
                        <p className="mb-2"><strong>Fecha de compra:</strong> {new Date(winner.purchaseDate).toLocaleDateString()}</p>
                        
                        {/* Estado del envío de email */}
                        <div className="email-status mt-3">
                          {emailSending && (
                            <div className="alert alert-info py-2 mb-0">
                              <div className="d-flex align-items-center">
                                <div className="spinner-border spinner-border-sm me-2" role="status">
                                  <span className="visually-hidden">Enviando...</span>
                                </div>
                                <span>📧 Enviando notificación por email...</span>
                              </div>
                            </div>
                          )}
                          {emailSent && !emailSending && (
                            <div className="alert alert-success py-2 mb-0">
                              <span>✅ Notificación enviada por email a {winner.email}</span>
                            </div>
                          )}
                          {!emailSending && !emailSent && drawComplete && (
                             <div className="alert alert-warning py-2 mb-0">
                               <span>⏳ Preparando notificación por email...</span>
                             </div>
                           )}
                         </div>
                         
                         {/* Estado del envío de email al vendedor */}
                         <div className="vendor-emails-status mt-2">
                           {vendorEmailsSending && (
                             <div className="alert alert-info py-2 mb-0">
                               <div className="d-flex align-items-center">
                                 <div className="spinner-border spinner-border-sm me-2" role="status">
                                   <span className="visually-hidden">Enviando...</span>
                                 </div>
                                 <span>📧 Notificando al vendedor...</span>
                               </div>
                             </div>
                           )}
                           {vendorEmailsSent && !vendorEmailsSending && (
                             <div className="alert alert-success py-2 mb-0">
                               <span>✅ Notificación enviada al vendedor</span>
                             </div>
                           )}
                         </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mostrar todos los ganadores anteriores */}
                {winners.length > 1 && (
                  <div className="previous-winners mb-4">
                    <h6>Ganadores anteriores:</h6>
                    <div className="row">
                      {winners.slice(0, -1).map((result, index) => {
                        const winnerBuyer = allBuyers.find(buyer => buyer.id === result.buyerId);
                        return (
                          <div key={index} className="col-md-6 mb-2">
                            <div className="card border-secondary">
                              <div className="card-body p-2">
                                <div className="d-flex justify-content-between align-items-center">
                                  <small>
                                    <strong>{result.prizePosition}° {result.prizeName}</strong>
                                    <br />
                                    {winnerBuyer?.name} - #{result.winningNumber}
                                  </small>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Opciones para continuar o finalizar */}
                <div className="draw-options mt-4">
                  {hasMorePrizes() && hasEligibleNumbers() ? (
                    <div className="d-grid gap-2">
                      <button 
                        className="btn btn-primary btn-lg"
                        onClick={continueDrawing}
                      >
                        Sortear siguiente premio ({currentPrizeDrawing + 2}° - {raffle.prizes?.[currentPrizeDrawing + 1]?.name || `Premio ${currentPrizeDrawing + 2}`})
                      </button>
                      <button 
                        className="btn btn-outline-success"
                        onClick={finishAllDraws}
                      >
                        Finalizar sorteos y guardar resultados
                      </button>
                    </div>
                  ) : (
                    <div className="alert alert-info">
                      {!hasMorePrizes() ? (
                        <p className="mb-2">✅ Se han sorteado todos los premios disponibles.</p>
                      ) : (
                        <p className="mb-2">⚠️ No hay más compradores elegibles para sortear.</p>
                      )}
                      <button 
                        className="btn btn-success"
                        onClick={finishAllDraws}
                      >
                        Finalizar y guardar todos los resultados
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            {(drawComplete || allDrawsComplete) && (
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={() => {
                  // Opción para imprimir o guardar el resultado
                  window.print();
                }}
              >
                Imprimir Resultado
              </button>
            )}
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              {(drawComplete || allDrawsComplete) ? 'Cerrar' : 'Cancelar'}
            </button>
          </div>
        </div>
      </div>

      {/* Custom styles moved to CSS classes in index.css */}
    </div>
  );
};

export default DrawModal;