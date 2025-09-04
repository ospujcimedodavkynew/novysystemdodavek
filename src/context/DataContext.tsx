import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import type { Vehicle, Customer, Rental, ToastMessage } from '../types';

interface DataContextType {
  vehicles: Vehicle[];
  customers: Customer[];
  rentals: Rental[];
  bankAccountNumber: string;
  setBankAccountNumber: React.Dispatch<React.SetStateAction<string>>;
  toasts: ToastMessage[];
  addToast: (message: string, type: ToastMessage['type']) => void;
  removeToast: (id: number) => void;
  loading: boolean;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<void>;
  updateVehicle: (vehicle: Vehicle) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<Customer | null>;
  addRental: (rental: Omit<Rental, 'id'>) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [bankAccountNumber, setBankAccountNumber] = useState('CZ5808000000000123456789'); // Default for demonstration
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const addToast = (message: string, type: ToastMessage['type']) => {
    const id = new Date().getTime();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };
  
  const removeToast = (id: number) => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
  }

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
        const { data: vehiclesData, error: vehiclesError } = await supabase.from('vehicles').select('*');
        if (vehiclesError) throw vehiclesError;
        setVehicles(vehiclesData as Vehicle[]);

        const { data: customersData, error: customersError } = await supabase.from('customers').select('*');
        if (customersError) throw customersError;
        setCustomers(customersData as Customer[]);
        
        const { data: rentalsData, error: rentalsError } = await supabase.from('rentals').select('*');
        if (rentalsError) throw rentalsError;
        setRentals(rentalsData as Rental[]);

    } catch (error) {
        console.error("Error fetching data:", error);
        addToast('Nepodařilo se načíst data ze serveru.', 'error');
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addVehicle = async (vehicle: Omit<Vehicle, 'id'>) => {
    const { data, error } = await supabase.from('vehicles').insert([vehicle]).select();
    if (error) {
        addToast(`Chyba při přidávání vozidla: ${error.message}`, 'error');
        throw error;
    }
    if(data) {
        setVehicles(prev => [...prev, data[0] as Vehicle]);
    }
  };

  const updateVehicle = async (vehicle: Vehicle) => {
    const { data, error } = await supabase.from('vehicles').update(vehicle).eq('id', vehicle.id).select();
     if (error) {
        addToast(`Chyba při úpravě vozidla: ${error.message}`, 'error');
        throw error;
    }
    if (data) {
        setVehicles(prev => prev.map(v => v.id === vehicle.id ? data[0] as Vehicle : v));
    }
  };

  const deleteVehicle = async (id: string) => {
    const { error } = await supabase.from('vehicles').delete().eq('id', id);
    if (error) {
        addToast(`Chyba při mazání vozidla: ${error.message}`, 'error');
        throw error;
    }
    setVehicles(prev => prev.filter(v => v.id !== id));
  };
  
  const addCustomer = async (customer: Omit<Customer, 'id'>): Promise<Customer | null> => {
    const { data, error } = await supabase.from('customers').insert([customer]).select();
    if (error) {
        addToast(`Chyba při přidávání zákazníka: ${error.message}`, 'error');
        throw error;
    }
    if (data) {
        const newCustomer = data[0] as Customer;
        setCustomers(prev => [...prev, newCustomer]);
        return newCustomer;
    }
    return null;
  };
  
  const addRental = async (rental: Omit<Rental, 'id'>) => {
    const { data, error } = await supabase.from('rentals').insert([rental]).select();
    if (error) {
        addToast(`Chyba při vytváření pronájmu: ${error.message}`, 'error');
        throw error;
    }
    if (data) {
        setRentals(prev => [...prev, data[0] as Rental]);
    }
  };

  return (
    <DataContext.Provider value={{ 
        vehicles, customers, rentals, 
        bankAccountNumber, setBankAccountNumber, 
        toasts, addToast, removeToast, 
        loading, 
        addVehicle, updateVehicle, deleteVehicle,
        addCustomer, addRental
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
