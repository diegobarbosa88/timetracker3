'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from './auth';
import { useRouter } from 'next/navigation';

// Este componente envuelve las páginas que requieren autenticación
// y evita el problema de prerenderizado en Vercel
export default function ClientAuthWrapper({ children, requiredRole = 'any' }) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Marcar que el componente está montado en el cliente
    setMounted(true);
    
    // Verificar autorización solo después de que la autenticación se haya cargado
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else if (requiredRole !== 'any' && user?.role !== requiredRole) {
        router.push('/dashboard');
      } else {
        setAuthorized(true);
      }
    }
  }, [isAuthenticated, loading, requiredRole, router, user]);

  // Mostrar nada hasta que el componente esté montado en el cliente
  // Esto evita el error de prerenderizado en Vercel
  if (!mounted) {
    return null;
  }

  // Mostrar un indicador de carga mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Mostrar el contenido solo si el usuario está autorizado
  return authorized ? children : null;
}
