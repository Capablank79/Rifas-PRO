// Tipos para la aplicación EasyRif

export interface Prize {
  id: string;
  name: string;
  description: string;
  image: string;
}

export interface BankingData {
  accountHolder: string;
  bankName: string;
  accountType: string;
  accountNumber: string;
  rut: string;
  email: string;
}

export interface Raffle {
  id: string;
  name: string;
  pricePerNumber: number;
  vendorsCount: number;
  numbersPerVendor: number;
  raffleDate: string;
  images: string[];
  prizes?: Prize[];
  createdAt: string;
  status: 'active' | 'completed';
  prizeValue: number;
  description?: string;
  bankingData?: BankingData;
}

export interface Vendor {
  id: string;
  raffleId: string;
  name: string;
  email: string;
  phone: string;
  salesCount: number;
  link: string;
}

export interface Buyer {
  id: string;
  vendorId: string;
  raffleId: string;
  name: string;
  email: string;
  phone: string;
  numbers: number[];
  purchaseDate: string;
}

export interface NumberStatus {
  number: number;
  status: 'available' | 'reserved' | 'sold';
  buyerId?: string;
}

export interface RaffleResult {
  raffleId: string;
  winningNumber: number;
  vendorId: string;
  buyerId: string;
  buyerName: string;
  buyerContact: string;
  drawDate: string;
  prizeId?: string;
  prizeName?: string;
  prizePosition?: number; // 1er lugar, 2do lugar, etc.
}

export interface MultipleDrawResult {
  raffleId: string;
  drawDate: string;
  winners: RaffleResult[];
  totalPrizes: number;
}