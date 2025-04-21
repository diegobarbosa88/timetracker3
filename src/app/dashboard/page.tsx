'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, withAuth } from '../../../lib/auth';

// Componente protegido que solo pueden ver los administradores
function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      {/* Mensaje de bienvenida personalizado según el rol */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-2">
          Bienvenido, {user?.name}
        </h2>
        <p className="text-gray-600">
          {user?.role === 'admin' 
            ? 'Tienes acceso completo al sistema como administrador.' 
            : 'Bienvenido al sistema de seguimiento de tiempo.'}
        </p>
      </div>
      
      {/* Métricas clave */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Empleados</h2>
          <div className="flex justify-between">
            <div>
              <p className="metric-value">5</p>
              <p className="metric-label">Total de empleados</p>
            </div>
            <div>
              <p className="metric-value">4</p>
              <p className="metric-label">Activos hoy</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Horas Trabajadas</h2>
          <div className="flex justify-between">
            <div>
              <p className="metric-value">185</p>
              <p className="metric-label">Total de horas</p>
            </div>
            <div>
              <p className="metric-value">7.4</p>
              <p className="metric-label">Promedio diario</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Asistencia</h2>
          <div className="flex justify-between">
            <div>
              <p className="metric-value">80%</p>
              <p className="metric-label">Tasa de asistencia</p>
            </div>
            <div>
              <p className="metric-value">15%</p>
              <p className="metric-label">Llegadas tardías</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enlaces a otras secciones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {user?.role === 'admin' && (
          <a href="/admin/employees" className="card hover:shadow-lg transition-shadow duration-200">
            <h3 className="text-lg font-semibold mb-2">Gestión de Empleados</h3>
            <p className="text-gray-600">Administra la información de tus empleados</p>
          </a>
        )}
        
        <a href="/reports" className="card hover:shadow-lg transition-shadow duration-200">
          <h3 className="text-lg font-semibold mb-2">Informes</h3>
          <p className="text-gray-600">Genera informes detallados de tiempo y asistencia</p>
        </a>
        
        <div className="card hover:shadow-lg transition-shadow duration-200">
          <h3 className="text-lg font-semibold mb-2">Mi Perfil</h3>
          <p className="text-gray-600">Actualiza tu información personal y preferencias</p>
        </div>
      </div>
    </div>
  );
}

// Exportar el componente con protección de autenticación (cualquier rol puede acceder)
export default withAuth(DashboardPage, 'any');
