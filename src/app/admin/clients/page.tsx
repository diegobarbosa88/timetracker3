'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getClients, deactivateClient } from '@/lib/client-management';

// Definir la interfaz para el cliente
interface Client {
  id: string;
  name: string;
  customTag?: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

const ClientsPage = () => {
  // Definir el tipo correcto para el estado clients
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);
  
  useEffect(() => {
    loadClients();
  }, []);
  
  const loadClients = () => {
    setIsLoading(true);
    const clientsList = getClients();
    // Ahora TypeScript sabe que clientsList es compatible con Client[]
    setClients(clientsList);
    setIsLoading(false);
  };
  
  const handleDeactivateClient = (clientId) => {
    if (window.confirm('¿Estás seguro de que deseas desactivar este cliente?')) {
      deactivateClient(clientId);
      loadClients();
    }
  };
  
  const filteredClients = showInactive 
    ? clients 
    : clients.filter(client => client.active);
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Clientes</h1>
        <Link href="/admin/clients/add-client" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Añadir Cliente
        </Link>
      </div>
      
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="showInactive"
            checked={showInactive}
            onChange={() => setShowInactive(!showInactive)}
            className="mr-2"
          />
          <label htmlFor="showInactive" className="text-gray-700">
            Mostrar clientes inactivos
          </label>
        </div>
        
        <div className="text-gray-600">
          Total: {filteredClients.length} cliente(s)
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando clientes...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600 mb-4">No hay clientes {!showInactive && "activos"} para mostrar.</p>
          <Link href="/admin/clients/add-client" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Añadir Primer Cliente
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Etiqueta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de Creación
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.map((client) => (
                <tr key={client.id} className={!client.active ? 'bg-gray-100' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{client.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {client.customTag ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {client.customTag}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {client.active ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Activo
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(client.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/admin/clients/edit-client?id=${client.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                      Editar
                    </Link>
                    {client.active && (
                      <button
                        onClick={() => handleDeactivateClient(client.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Desactivar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClientsPage;
