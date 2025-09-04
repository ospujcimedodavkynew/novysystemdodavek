export interface Vehicle {
  id: string;
  created_at?: string;
  brand: 'Renault Master' | 'Opel Movano' | 'Fiat Ducato' | 'Peugeot Boxer' | 'Mercedes Sprinter';
  license_plate: string;
  vin: string;
  year: number;
  last_service_date: string | null;
  last_service_cost: number | null;
  stk_date: string | null;
  insurance_info: string | null;
  vignette_until: string | null;
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
  created_at?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  id_card_number: string | null;
  drivers_license_number: string | null;
}

export interface Rental {
  id: string;
  created_at?: string;
  vehicle_id: string;
  customer_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: 'active' | 'completed' | 'upcoming';
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}
