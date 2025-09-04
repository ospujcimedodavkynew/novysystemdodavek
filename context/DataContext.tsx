import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { Vehicle, Customer, Rental, ToastMessage } from '../types';

interface DataContextType {
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  rentals: Rental[];
  setRentals: React.Dispatch<React.SetStateAction<Rental[]>>;
  bankAccountNumber: string;
  setBankAccountNumber: React.Dispatch<React.SetStateAction<string>>;
  toasts: ToastMessage[];
  addToast: (message: string, type: ToastMessage['type']) => void;
  removeToast: (id: number) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // FIX: Initialize state with empty arrays to fix module loading error from mockData.ts
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [bankAccountNumber, setBankAccountNumber] = useState('CZ5808000000000123456789'); // Default for demonstration
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

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

  return (
    <DataContext.Provider value={{ vehicles, setVehicles, customers, setCustomers, rentals, setRentals, bankAccountNumber, setBankAccountNumber, toasts, addToast, removeToast }}>
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
