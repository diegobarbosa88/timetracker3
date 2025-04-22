'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

// Definir la interfaz para los errores
interface FormErrors {
  name?: string;
  customTag?: string;
  submit?: string;
  [key: string]: string | undefined;
}

const EditClientPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Corregir el error de TypeScript añadiendo una verificación de nulidad
  const clientId = searchParams?.get('id') || '';
  
  const [clientData, setClientData] = useState({
    id: '',
    name: '',
    customTag: '',
    active: true
  });
  
  // Usar la interfaz FormErrors para el estado de errores
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Cargar datos del cliente
  useEffect(() => {
    const loadClient = () => {
      try {
        if (!clientId) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        
        const storedClients = localStorage.getItem('timetracker_clients');
        if (!storedClients) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        
        const clients = JSON.parse(storedClients);
        const client = clients.find(c => c.id === clientId);
        
        if (!client) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        
        setClientData({
          id: client.id,
          name: client.name,
          customTag: client.customTag || '',
          active: client.active
        });
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar cliente:', error);
        setNotFound(true);
        setLoading(false);
      }
    };

    loadClient();
  }, [clientId]);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setClientData({
      ...clientData,
      [name]: value
    });
  };

  // Validar formulario
  const validateForm = () => {
    // Inicializar newErrors como un objeto que cumple con la interfaz FormErrors
    const newErrors: FormErrors = {};
    
    if (!clientData.name.trim()) {
      newErrors.name = 'El nombre del cliente es obligatorio';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Obtener clientes actuales
      const storedClients = localStorage.getItem('timetracker_clients');
      if (!storedClients) {
        throw new Error('No se encontraron clientes');
      }
      
      const clients = JSON.parse(storedClients);
      
      // Actualizar cliente
      const updatedClients = clients.map(client => {
        if (client.id === clientId) {
          return {
            ...client,
            name: clientData.name,
            customTag: clientData.customTag || null,
            updatedAt: new Date().toISOString()
          };
        }
        return client;
      });
      
      // Guardar en localStorage
      localStorage.setItem('timetracker_clients', JSON.stringify(updatedClients));
      
      // Redireccionar a la lista de clientes
      router.push('/admin/clients');
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      setErrors({ submit: 'Error al actualizar el cliente. Inténtalo de nuevo.' });
      setIsSubmitting(false);
    }
  };

  // Contenido para cliente no encontrado
  if (notFound) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Cliente no encontrado</h1>
          <p className="text-gray-600 mb-4">El cliente que intentas editar no existe o ha sido eliminado.</p>
          <Link href="/admin/clients" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Volver a la lista de clientes
          </Link>
        </div>
      </div>
    );
  }

  // Contenido para carga
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos del cliente...</p>
        </div>
      </div>
    );
  }

  // Contenido principal
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Editar Cliente</h1>
        <Link href="/admin/clients" className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
          Volver a la lista
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        {errors.submit && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {errors.submit}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 mb-2">Nombre del Cliente *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={clientData.name}
              onChange={handleChange}
              className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Ingresa el nombre del cliente"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>
          
          <div className="mb-6">
            <label htmlFor="customTag" className="block text-gray-700 mb-2">Etiqueta Personalizada (opcional)</label>
            <input
              type="text"
              id="customTag"
              name="customTag"
              value={clientData.customTag}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Etiqueta para identificar este cliente"
            />
            <p className="mt-1 text-sm text-gray-500">Puedes usar esta etiqueta para categorizar o agrupar clientes</p>
          </div>
          
          <div className="flex justify-end">
            <Link href="/admin/clients" className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 mr-2">
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 rounded text-white ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isSubmitting ? 'Guardando...' : 'Actualizar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditClientPage;
