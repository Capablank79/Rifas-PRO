import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Raffle, Vendor, Buyer, RaffleResult, MultipleDrawResult } from '../types';

// Estado inicial
interface RaffleState {
  raffles: Raffle[];
  vendors: Vendor[];
  buyers: Buyer[];
  results: RaffleResult[];
  multipleResults: MultipleDrawResult[];
}


const loadStateFromLocalStorage = (): RaffleState => {
  try {
    const savedState = localStorage.getItem('raffleState');
    if (savedState) {
      return JSON.parse(savedState);
    }
  } catch (error) {
    console.error('Error loading state from localStorage:', error);
  }
  
  // Estado inicial por defecto si no hay datos guardados
  return {
    raffles: [],
    vendors: [],
    buyers: [],
    results: [],
    multipleResults: [],
  };
};

const initialState: RaffleState = loadStateFromLocalStorage();

// Tipos de acciones
type RaffleAction =
  | { type: 'CREATE_RAFFLE'; payload: Raffle }
  | { type: 'UPDATE_RAFFLE'; payload: Raffle }
  | { type: 'ADD_VENDOR'; payload: Vendor }
  | { type: 'UPDATE_VENDOR'; payload: Vendor }
  | { type: 'ADD_BUYER'; payload: Buyer }
  | { type: 'SET_RAFFLE_RESULT'; payload: RaffleResult }
  | { type: 'SET_MULTIPLE_RAFFLE_RESULTS'; payload: MultipleDrawResult }
  | { type: 'UPDATE_RAFFLE_STATUS'; payload: { raffleId: string; status: 'active' | 'completed' } }
  | { type: 'CLEAR_ALL_DATA' };

// Reducer
const raffleReducer = (state: RaffleState, action: RaffleAction): RaffleState => {
  switch (action.type) {
    case 'CREATE_RAFFLE':
      return {
        ...state,
        raffles: [...state.raffles, action.payload],
      };
    case 'UPDATE_RAFFLE':
      return {
        ...state,
        raffles: state.raffles.map(raffle =>
          raffle.id === action.payload.id ? action.payload : raffle
        ),
      };
    case 'ADD_VENDOR':
      return {
        ...state,
        vendors: [...state.vendors, action.payload],
      };
    case 'UPDATE_VENDOR':
      return {
        ...state,
        vendors: state.vendors.map(vendor =>
          vendor.id === action.payload.id ? action.payload : vendor
        ),
      };
    case 'ADD_BUYER':
      return {
        ...state,
        buyers: [...state.buyers, action.payload],
      };
    case 'SET_RAFFLE_RESULT':
      return {
        ...state,
        results: [...state.results, action.payload],
        raffles: state.raffles.map(raffle =>
          raffle.id === action.payload.raffleId
            ? { ...raffle, status: 'completed' as const }
            : raffle
        ),
      };
    case 'SET_MULTIPLE_RAFFLE_RESULTS':
      return {
        ...state,
        multipleResults: [...state.multipleResults, action.payload],
        results: [...state.results, ...action.payload.winners],
        raffles: state.raffles.map(raffle =>
          raffle.id === action.payload.raffleId
            ? { ...raffle, status: 'completed' as const }
            : raffle
        ),
      };

    case 'UPDATE_RAFFLE_STATUS':
      return {
        ...state,
        raffles: state.raffles.map(raffle =>
          raffle.id === action.payload.raffleId
            ? { ...raffle, status: action.payload.status }
            : raffle
        ),
      };
    case 'CLEAR_ALL_DATA':
      return {
        raffles: [],
        vendors: [],
        buyers: [],
        results: [],
        multipleResults: [],
      };
    default:
      return state;
  }
};

// Crear contexto
interface RaffleContextType extends RaffleState {
  createRaffle: (raffle: Raffle) => void;
  updateRaffle: (raffle: Raffle) => void;
  addVendor: (vendor: Vendor) => void;
  updateVendor: (vendor: Vendor) => void;
  addBuyer: (buyer: Buyer) => void;
  setRaffleResult: (result: RaffleResult) => void;
  setMultipleRaffleResults: (result: MultipleDrawResult) => void;
  updateRaffleStatus: (raffleId: string, status: 'active' | 'completed') => void;
  clearAllData: () => void;
  getRaffleById: (raffleId: string) => Raffle | undefined;
  getVendorsByRaffleId: (raffleId: string) => Vendor[];
  getBuyersByVendorId: (vendorId: string) => Buyer[];
  getBuyersByRaffleId: (raffleId: string) => Buyer[];
  getMultipleResultsByRaffleId: (raffleId: string) => MultipleDrawResult | undefined;
}

const RaffleContext = createContext<RaffleContextType | undefined>(undefined);

// Proveedor del contexto
export const RaffleProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(raffleReducer, initialState);
  
  // Guardar estado en localStorage cuando cambie
  useEffect(() => {
    try {
      localStorage.setItem('raffleState', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving state to localStorage:', error);
    }
  }, [state]);

  // Acciones
  const createRaffle = (raffle: Raffle) => {
    dispatch({ type: 'CREATE_RAFFLE', payload: raffle });
    // Forzar actualización inmediata del localStorage
    const newState = raffleReducer(state, { type: 'CREATE_RAFFLE', payload: raffle });
    try {
      localStorage.setItem('raffleState', JSON.stringify(newState));
    } catch (error) {
      console.error('Error saving state to localStorage:', error);
    }
  };

  const updateRaffle = (raffle: Raffle) => {
    dispatch({ type: 'UPDATE_RAFFLE', payload: raffle });
  };

  const addVendor = (vendor: Vendor) => {
    dispatch({ type: 'ADD_VENDOR', payload: vendor });
  };

  const updateVendor = (vendor: Vendor) => {
    dispatch({ type: 'UPDATE_VENDOR', payload: vendor });
  };

  const addBuyer = (buyer: Buyer) => {
    dispatch({ type: 'ADD_BUYER', payload: buyer });
  };

  const setRaffleResult = (result: RaffleResult) => {
    dispatch({ type: 'SET_RAFFLE_RESULT', payload: result });
  };

  const setMultipleRaffleResults = (result: MultipleDrawResult) => {
    dispatch({ type: 'SET_MULTIPLE_RAFFLE_RESULTS', payload: result });
  };

  const updateRaffleStatus = (raffleId: string, status: 'active' | 'completed') => {
    dispatch({
      type: 'UPDATE_RAFFLE_STATUS',
      payload: { raffleId, status },
    });
  };

  const clearAllData = () => {
    dispatch({ type: 'CLEAR_ALL_DATA' });
    // Forzar actualización inmediata del localStorage
    const newState = {
      raffles: [],
      vendors: [],
      buyers: [],
      results: [],
      multipleResults: [],
    };
    try {
      localStorage.setItem('raffleState', JSON.stringify(newState));
    } catch (error) {
      console.error('Error saving state to localStorage:', error);
    }
  };



  // Selectores
  const getRaffleById = (raffleId: string) => {
    return state.raffles.find(raffle => raffle.id === raffleId);
  };

  const getVendorsByRaffleId = (raffleId: string) => {
    return state.vendors.filter(vendor => vendor.raffleId === raffleId).map(vendor => {
      // Calcular salesCount dinámicamente
      const vendorBuyers = state.buyers.filter(buyer => buyer.vendorId === vendor.id);
      const totalSales = vendorBuyers.reduce((total, buyer) => total + buyer.numbers.length, 0);
      return {
        ...vendor,
        salesCount: totalSales
      };
    });
  };

  const getBuyersByVendorId = (vendorId: string) => {
    return state.buyers.filter(buyer => buyer.vendorId === vendorId);
  };

  const getBuyersByRaffleId = (raffleId: string) => {
    const vendorIds = state.vendors
      .filter(vendor => vendor.raffleId === raffleId)
      .map(vendor => vendor.id);
    return state.buyers.filter(buyer => vendorIds.includes(buyer.vendorId));
  };

  const getMultipleResultsByRaffleId = (raffleId: string) => {
    return state.multipleResults?.find(result => result.raffleId === raffleId);
  };

  return (
    <RaffleContext.Provider
      value={{
        ...state,
        createRaffle,
        updateRaffle,
        addVendor,
        updateVendor,
        addBuyer,
        setRaffleResult,
        setMultipleRaffleResults,
        updateRaffleStatus,
        clearAllData,
        getRaffleById,
        getVendorsByRaffleId,
        getBuyersByVendorId,
        getBuyersByRaffleId,
        getMultipleResultsByRaffleId,
      }}
    >
      {children}
    </RaffleContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useRaffle = () => {
  const context = useContext(RaffleContext);
  if (context === undefined) {
    throw new Error('useRaffle debe ser usado dentro de un RaffleProvider');
  }
  return context;
};