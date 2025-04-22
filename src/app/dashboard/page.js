'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ClientAuthWrapper from '../../../lib/client-auth-wrapper';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    totalClients: 0,
    activeClients: 0,
    totalRecords: 0,
    todayRecords: 0
  });
  const [loading, setLoading] = useState(true);

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    const loadStats = () => {
      try {
        // Obtener empleados
        const storedEmployees = localStorage.getItem('timetracker_employees');
        const employees = storedEmployees ? JSON.parse(storedEmployees) : [];
        
        // Obtener clientes
        const storedClients = localStorage.getItem('timetracker_clients');
        const clients = storedClients ? JSON.parse(storedClients) : [];
        
        // Obtener registros de tiempo
        const storedRecords = localStorage.getItem('timetracker_records');
        const records = storedRecords ? JSON.parse(storedRecords) : [];
        
        // Calcular estadísticas
        const today = new Date().toISOString().split('T')[0];
        const todayRecords = records.filter(record => record.date === today);
        
        setStats({
          totalEmployees: employees.length,
          activeEmployees: employees.filter(emp => emp.active).length,
          totalClients: clients.length,
          activeClients: clients.filter(client => client.active).length,
          totalRecords: records.length,
          todayRecords: todayRecords.length
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  // Contenido principal
  const content = (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Panel de Control</h1>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Empleados</p>
                  <p className="text-xl font-semibold">{stats.activeEmployees} / {stats.totalEmployees}</p>
                </div>
              </div>
              <div className="mt-4">
                <Link href="/admin/employees" className="text-sm text-blue-600 hover:text-blue-800">
                  Ver todos los empleados →
                </Link>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Clientes</p>
                  <p className="text-xl font-semibold">{stats.activeClients} / {stats.totalClients}</p>
                </div>
              </div>
              <div className="mt-4">
                <Link href="/admin/clients" className="text-sm text-blue-600 hover:text-blue-800">
                  Ver todos los clientes →
                </Link>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Registros de Tiempo</p>
                  <p className="text-xl font-semibold">{stats.todayRecords} hoy / {stats.totalRecords} total</p>
                </div>
              </div>
              <div className="mt-4">
                <Link href="/reports" className="text-sm text-blue-600 hover:text-blue-800">
                  Ver informes →
                </Link>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Acciones Rápidas</h2>
              <div className="space-y-2">
                <Link href="/cronometro" className="block p-3 bg-blue-50 hover:bg-blue-100 rounded-md">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>Iniciar Cronómetro</span>
                  </div>
                </Link>
                
                <Link href="/registro-manual" className="block p-3 bg-green-50 hover:bg-green-100 rounded-md">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                    <span>Registro Manual de Horas</span>
                  </div>
                </Link>
                
                <Link href="/reports" className="block p-3 bg-purple-50 hover:bg-purple-100 rounded-md">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <span>Generar Informes</span>
                  </div>
                </Link>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Administración</h2>
              <div className="space-y-2">
                <Link href="/admin/employees" className="block p-3 bg-yellow-50 hover:bg-yellow-100 rounded-md">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                    <span>Gestionar Empleados</span>
                  </div>
                </Link>
                
                <Link href="/admin/clients" className="block p-3 bg-red-50 hover:bg-red-100 rounded-md">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                    <span>Gestionar Clientes</span>
                  </div>
                </Link>
                
                <Link href="/reports" className="block p-3 bg-indigo-50 hover:bg-indigo-100 rounded-md">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                    <span>Informes Avanzados</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  // Envolver el contenido con el wrapper de autenticación
  return (
    <ClientAuthWrapper>
      {content}
    </ClientAuthWrapper>
  );
};

export default DashboardPage;
