import React, { ReactNode } from 'react';
import { useData } from '../context/DataContext';
import type { ToastMessage } from '../types';
import { CheckCircleIcon, AlertCircleIcon, InfoIcon, XIcon } from './Icons';

// --- Card ---
interface CardProps {
  children: ReactNode;
  className?: string;
}
export const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-surface rounded-lg shadow-lg p-6 ${className}`}>
    {children}
  </div>
);

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}
export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', ...props }) => {
  const baseClasses = "px-4 py-2 rounded-md font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:bg-gray-500 disabled:cursor-not-allowed";
  const variantClasses = {
    primary: "bg-primary hover:bg-primary-focus focus:ring-primary",
    secondary: "bg-secondary hover:bg-purple-700 focus:ring-secondary",
    danger: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
  };
  return (
    <button className={`${baseClasses} ${variantClasses[variant]}`} {...props}>
      {children}
    </button>
  );
};

// --- Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}
export const Input: React.FC<InputProps> = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
    <input
      className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-text-primary focus:ring-accent focus:border-accent"
      {...props}
    />
  </div>
);

// --- Select ---
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: ReactNode;
}
export const Select: React.FC<SelectProps> = ({ label, children, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
    <select
      className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-text-primary focus:ring-accent focus:border-accent"
      {...props}
    >
      {children}
    </select>
  </div>
);


// --- Modal ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-surface rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- Confirm Modal ---
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: ReactNode;
}
export const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-surface rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">{title}</h2>
          <div className="text-text-secondary">
            {children}
          </div>
        </div>
        <div className="flex justify-end gap-4 p-4 bg-gray-900 rounded-b-lg">
          <Button variant="secondary" onClick={onClose}>Zrušit</Button>
          <Button variant="danger" onClick={onConfirm}>Potvrdit</Button>
        </div>
      </div>
    </div>
  );
};

// --- Toast ---
const toastIcons = {
  success: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
  error: <AlertCircleIcon className="w-6 h-6 text-red-500" />,
  info: <InfoIcon className="w-6 h-6 text-blue-500" />,
};

const toastStyles = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
}

const Toast: React.FC<{ toast: ToastMessage; onRemove: (id: number) => void }> = ({ toast, onRemove }) => (
    <div className={`relative flex items-center w-full max-w-sm p-4 text-white bg-surface shadow-lg rounded-lg overflow-hidden`}>
        <div className={`absolute left-0 top-0 bottom-0 w-2 ${toastStyles[toast.type]}`}></div>
        <div className="pl-3 pr-8 flex items-center">
            {toastIcons[toast.type]}
            <p className="ml-3 font-medium">{toast.message}</p>
        </div>
        <button onClick={() => onRemove(toast.id)} className="absolute top-1/2 right-2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-600">
            <XIcon className="w-5 h-5" />
        </button>
    </div>
);


export const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useData();

    return (
        <div className="fixed top-5 right-5 z-50 space-y-3">
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onRemove={removeToast} />
            ))}
        </div>
    );
};
