
export interface Vehicle {
  id: string;
  brand: 'Renault Master' | 'Opel Movano' | 'Fiat Ducato' | 'Peugeot Boxer' | 'Mercedes Sprinter';
  licensePlate: string;
  vin: string;
  year: number;
  lastServiceDate: string;
  lastServiceCost: number;
  stkDate: string;
  insuranceInfo: string;
  vignetteUntil: string;
  pricing: {
    '4h': number;
    '6h': number;
    '12h': number;
    '24h': number;
    daily: number; // for > 24h
  };
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idCardNumber: string;
  driversLicenseNumber: string;
}

export interface Rental {
  id: string;
  vehicleId: string;
  customerId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'active' | 'completed' | 'upcoming';
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}
