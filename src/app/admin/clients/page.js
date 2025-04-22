'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ClientAuthWrapper from '../../../lib/client-auth-wrapper';

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar clientes al montar el componente
  useEffect(() => {
    const loadClients = () => {
      try {
        const storedClients = localStorage.getItem('timetracker_clients');
        if (storedClients) {
          const parsedClients = JSON.parse(storedClients);
          setClients(parsedClients);
        }
      } catch (error) {
        console.error('Error al cargar clientes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadClients();
  }, []);

  // Manejar activación/desactivación de cliente
  const handleToggleActive = (clientId) => {
    try {
      // Encontrar y actualizar el cliente
      const updatedClients = clients.map(client => {
        if (client.id === clientId) {
          return { ...client, active: !client.active };
        }
        return client;
      });
      
      // Actualizar estado
      setClients(updatedClients);
      
      // Guardar en localStorage
      localStorage.setItem('timetracker_clients', JSON.stringify(updatedClients));
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
    }
  };

  // Contenido principal
  const content = (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Clientes</h1>
        <Link href="/admin/clients/add-client" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Añadir Cliente
        </Link>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando clientes...</p>
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 mb-4">No hay clientes registrados.</p>
          <Link href="/admin/clients/add-client" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Añadir Primer Cliente
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Etiqueta
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.map((client) => (
                <tr key={client.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{client.name}</div>
                    <div className="text-sm text-gray-500">ID: {client.id}</div>
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
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${client.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {client.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link href={`/admin/clients/edit-client?id=${client.id}`} className="text-indigo-600 hover:text-indigo-900">
                        Editar
                      </Link>
                      <button
                        onClick={() => handleToggleActive(client.id)}
                        className={`${client.active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                      >
                        {client.active ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-8 bg-blue-50 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">Información</h2>
        <ul className="list-disc pl-5 text-blue-700 space-y-1">
          <li>Los clientes activos pueden ser asignados a empleados</li>
          <li>Los clientes inactivos no aparecerán en las listas de selección</li>
          <li>Puedes usar etiquetas personalizadas para categorizar clientes</li>
          <li>Para asignar clientes a empleados, ve a la sección de empleados</li>
        </ul>
      </div>
    </div>
  );

  // Envolver el contenido con el wrapper de autenticación
  return (
    <ClientAuthWrapper requiredRole="admin">
      {content}
    </ClientAuthWrapper>
  );
};

export default ClientsPage;
