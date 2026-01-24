'use client';

import { createContext, useContext, useCallback, ReactNode } from 'react';
import { toast, ToastContainer, ToastOptions, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const DEFAULT_DURATION = 5000;

const defaultOptions: ToastOptions = {
  position: 'bottom-right',
  autoClose: DEFAULT_DURATION,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  transition: Slide,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = DEFAULT_DURATION) => {
    const options: ToastOptions = { ...defaultOptions, autoClose: duration };
    
    switch (type) {
      case 'success':
        toast.success(message, options);
        break;
      case 'error':
        toast.error(message, options);
        break;
      case 'warning':
        toast.warning(message, options);
        break;
      case 'info':
      default:
        toast.info(message, options);
        break;
    }
  }, []);

  const success = useCallback((message: string, duration?: number) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const error = useCallback((message: string, duration?: number) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  const warning = useCallback((message: string, duration?: number) => {
    showToast(message, 'warning', duration);
  }, [showToast]);

  const info = useCallback((message: string, duration?: number) => {
    showToast(message, 'info', duration);
  }, [showToast]);

  const value: ToastContextValue = {
    showToast,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer
        position="bottom-right"
        autoClose={DEFAULT_DURATION}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Slide}
      />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
