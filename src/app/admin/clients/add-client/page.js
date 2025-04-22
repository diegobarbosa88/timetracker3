'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ClientAuthWrapper from '../../../../lib/client-auth-wrapper';

// Definir la interfaz para los errores
const AddClientPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    customTag: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
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
      // Obtener clientes actuales o inicializar array
      let clients = [];
      const storedClients = localStorage.getItem('timetracker_clients');
      
      if (storedClients) {
        clients = JSON.parse(storedClients);
      }
      
      // Crear nuevo cliente
      const newClient = {
        id: `CLI${Date.now().toString().slice(-6)}`,
        name: formData.name,
        active: true,
        customTag: formData.customTag || null,
        createdAt: new Date().toISOString()
      };
      
      // Añadir a la lista
      clients.push(newClient);
      
      // Guardar en localStorage
      localStorage.setItem('timetracker_clients', JSON.stringify(clients));
      
      // Redireccionar a la lista de clientes
      router.push('/admin/clients');
    } catch (error) {
      console.error('Error al añadir cliente:', error);
      setErrors({ submit: 'Error al añadir el cliente. Inténtalo de nuevo.' });
      setIsSubmitting(false);
    }
  };

  // Contenido principal
  const content = (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Añadir Nuevo Cliente</h1>
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
              value={formData.name}
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
              value={formData.customTag}
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
              {isSubmitting ? 'Guardando...' : 'Guardar Cliente'}
            </button>
          </div>
        </form>
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

export default AddClientPage;
