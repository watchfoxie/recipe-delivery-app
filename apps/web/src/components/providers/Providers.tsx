'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '../../lib/context/AuthContext';
import { ToastProvider } from '../../lib/context/ToastContext';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </AuthProvider>
  );
}
