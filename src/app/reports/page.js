'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ClientAuthWrapper from '../../../lib/client-auth-wrapper';

const ReportsPage = () => {
  const [reportType, setReportType] = useState('attendance');
  const [dateRange, setDateRange] = useState('month');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [employees, setEmployees] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [exportLoading, setExportLoading] = useState({
    pdf: false,
    excel: false,
    csv: false
  });

  // Cargar empleados al montar el componente
  useEffect(() => {
    const loadEmployees = () => {
      try {
        const storedEmployees = localStorage.getItem('timetracker_employees');
        if (storedEmployees) {
          const parsedEmployees = JSON.parse(storedEmployees);
          setEmployees(parsedEmployees);
        }
      } catch (error) {
        console.error('Error al cargar empleados:', error);
      }
    };

    loadEmployees();
  }, []);

  // Generar datos de muestra de registros de tiempo
  const generateSampleTimeRecords = () => {
    const records = [];
    // Solo generamos datos simulados para los empleados predefinidos (EMP001-EMP005)
    const predefinedEmployeeIds = ['EMP001', 'EMP002', 'EMP003', 'EMP004', 'EMP005'];
    const clients = ['Cliente A', 'Cliente B', 'Cliente C', 'Cliente D'];
    
    // Generar registros para el último mes
    const today = new Date();
    const startDate = new Date();
    startDate.setMonth(today.getMonth() - 1);
    
    // Iterar por cada día del último mes
    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      // Saltar fines de semana
      const dayOfWeek = d.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;
      
      // Generar registros solo para empleados predefinidos
      predefinedEmployeeIds.forEach(empId => {
        // 80% de probabilidad de asistencia
        if (Math.random() < 0.8) {
          // Hora de entrada entre 8:00 y 9:30
          const entryHour = 8 + Math.floor(Math.random() * 2);
          const entryMinute = Math.floor(Math.random() * 60);
          const entryTime = `${entryHour.toString().padStart(2, '0')}:${entryMinute.toString().padStart(2, '0')}`;
          
          // Hora de salida entre 17:00 y 19:00
          const exitHour = 17 + Math.floor(Math.random() * 3);
          const exitMinute = Math.floor(Math.random() * 60);
          const exitTime = `${exitHour.toString().padStart(2, '0')}:${exitMinute.toString().padStart(2, '0')}`;
          
          // Calcular tiempo total en minutos
          const entryDate = new Date(`2000-01-01T${entryTime}`);
          const exitDate = new Date(`2000-01-01T${exitTime}`);
          const diffMs = exitDate.getTime() - entryDate.getTime();
          const totalMinutes = Math.floor(diffMs / 60000);
          
          // Seleccionar cliente aleatorio
          const client = clients[Math.floor(Math.random() * clients.length)];
          
          // Crear registro
          records.push({
            id: `TR${Date.now().toString().slice(-6)}-${empId}`,
            userId: empId,
            date: d.toISOString().split('T')[0],
            entryTime,
            exitTime,
            client,
            totalWorkTime: totalMinutes,
            usedEntryTolerance: Math.random() < 0.2,
            manualEntry: Math.random() < 0.3
          });
        }
      });
    }
    
    return records;
  };

  // Cargar registros de tiempo
  const loadTimeRecords = () => {
    try {
      let records = [];
      const storedRecords = localStorage.getItem('timetracker_records');
      
      if (storedRecords) {
        records = JSON.parse(storedRecords);
      } else {
        // Si no hay registros, generar datos de muestra
        records = generateSampleTimeRecords();
        localStorage.setItem('timetracker_records', JSON.stringify(records));
      }
      
      return records;
    } catch (error) {
      console.error('Error al cargar registros de tiempo:', error);
      return [];
    }
  };

  // Filtrar registros por fecha
  const filterRecordsByDate = (records) => {
    const today = new Date();
    let startDate;
    
    switch (dateRange) {
      case 'week':
        startDate = new Date();
        startDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(today.getMonth() - 1);
        break;
      case 'quarter':
        startDate = new Date();
        startDate.setMonth(today.getMonth() - 3);
        break;
      case 'year':
        startDate = new Date();
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        startDate = new Date();
        startDate.setMonth(today.getMonth() - 1);
    }
    
    return records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= startDate && recordDate <= today;
    });
  };

  // Filtrar registros por empleado
  const filterRecordsByEmployee = (records) => {
    if (selectedEmployee === 'all') {
      return records;
    }
    
    return records.filter(record => record.userId === selectedEmployee);
  };

  // Generar informe de asistencia
  const generateAttendanceReport = (records) => {
    // Agrupar registros por empleado
    const employeeRecords = {};
    
    records.forEach(record => {
      if (!employeeRecords[record.userId]) {
        employeeRecords[record.userId] = [];
      }
      
      employeeRecords[record.userId].push(record);
    });
    
    // Calcular estadísticas por empleado
    const report = Object.keys(employeeRecords).map(userId => {
      const userRecords = employeeRecords[userId];
      const employee = employees.find(emp => emp.id === userId) || { name: `Empleado ${userId}` };
      
      // Calcular días trabajados
      const daysWorked = userRecords.length;
      
      // Calcular días con llegada tardía
      const lateArrivals = userRecords.filter(record => record.usedEntryTolerance).length;
      
      // Calcular promedio de horas trabajadas
      const totalMinutes = userRecords.reduce((sum, record) => sum + record.totalWorkTime, 0);
      const avgHoursPerDay = (totalMinutes / daysWorked / 60).toFixed(1);
      
      return {
        id: userId,
        name: employee.name,
        daysWorked,
        lateArrivals,
        avgHoursPerDay,
        attendanceRate: ((daysWorked / 20) * 100).toFixed(0) + '%' // Asumiendo 20 días laborables
      };
    });
    
    return report;
  };

  // Generar informe de horas trabajadas
  const generateHoursReport = (records) => {
    // Agrupar registros por empleado y fecha
    const employeeDayRecords = {};
    
    records.forEach(record => {
      const key = `${record.userId}-${record.date}`;
      
      if (!employeeDayRecords[key]) {
        employeeDayRecords[key] = {
          userId: record.userId,
          date: record.date,
          totalMinutes: 0,
          records: []
        };
      }
      
      employeeDayRecords[key].totalMinutes += record.totalWorkTime;
      employeeDayRecords[key].records.push(record);
    });
    
    // Convertir a array y ordenar por fecha
    const dailyRecords = Object.values(employeeDayRecords).sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });
    
    // Formatear para el informe
    const report = dailyRecords.map(day => {
      const employee = employees.find(emp => emp.id === day.userId) || { name: `Empleado ${day.userId}` };
      const hours = Math.floor(day.totalMinutes / 60);
      const minutes = day.totalMinutes % 60;
      
      return {
        id: `${day.userId}-${day.date}`,
        name: employee.name,
        date: day.date,
        hoursWorked: `${hours}h ${minutes}m`,
        totalMinutes: day.totalMinutes,
        client: day.records[0].client, // Mostrar el primer cliente si hay varios
        manualEntry: day.records.some(r => r.manualEntry) ? 'Sí' : 'No'
      };
    });
    
    return report;
  };

  // Generar informe de rendimiento
  const generatePerformanceReport = (records) => {
    // Agrupar registros por empleado
    const employeeRecords = {};
    
    records.forEach(record => {
      if (!employeeRecords[record.userId]) {
        employeeRecords[record.userId] = {
          userId: record.userId,
          totalMinutes: 0,
          daysWorked: new Set(),
          lateArrivals: 0,
          manualEntries: 0,
          clients: new Set()
        };
      }
      
      employeeRecords[record.userId].totalMinutes += record.totalWorkTime;
      employeeRecords[record.userId].daysWorked.add(record.date);
      
      if (record.usedEntryTolerance) {
        employeeRecords[record.userId].lateArrivals += 1;
      }
      
      if (record.manualEntry) {
        employeeRecords[record.userId].manualEntries += 1;
      }
      
      employeeRecords[record.userId].clients.add(record.client);
    });
    
    // Calcular estadísticas de rendimiento
    const report = Object.values(employeeRecords).map(data => {
      const employee = employees.find(emp => emp.id === data.userId) || { name: `Empleado ${data.userId}` };
      const daysWorked = data.daysWorked.size;
      const avgHoursPerDay = (data.totalMinutes / daysWorked / 60).toFixed(1);
      const totalHours = (data.totalMinutes / 60).toFixed(1);
      
      // Calcular puntuación de rendimiento (ejemplo simple)
      let performanceScore = 100;
      
      // Restar puntos por llegadas tardías
      performanceScore -= (data.lateArrivals / daysWorked) * 20;
      
      // Ajustar por horas trabajadas (asumiendo que 8 horas es el objetivo)
      const hoursDiff = Math.abs(avgHoursPerDay - 8);
      performanceScore -= hoursDiff * 5;
      
      // Asegurar que la puntuación esté entre 0 y 100
      performanceScore = Math.max(0, Math.min(100, performanceScore));
      
      return {
        id: data.userId,
        name: employee.name,
        daysWorked,
        totalHours,
        avgHoursPerDay,
        lateArrivals: data.lateArrivals,
        manualEntries: data.manualEntries,
        clientCount: data.clients.size,
        performanceScore: performanceScore.toFixed(0) + '%'
      };
    });
    
    return report.sort((a, b) => parseInt(b.performanceScore) - parseInt(a.performanceScore));
  };

  // Generar informe
  const generateReport = () => {
    setLoading(true);
    
    setTimeout(() => {
      try {
        // Cargar registros de tiempo
        const allRecords = loadTimeRecords();
        
        // Filtrar por fecha
        const dateFiltered = filterRecordsByDate(allRecords);
        
        // Filtrar por empleado
        const filtered = filterRecordsByEmployee(dateFiltered);
        
        // Generar informe según el tipo seleccionado
        let report = [];
        
        switch (reportType) {
          case 'attendance':
            report = generateAttendanceReport(filtered);
            break;
          case 'hours':
            report = generateHoursReport(filtered);
            break;
          case 'performance':
            report = generatePerformanceReport(filtered);
            break;
          default:
            report = generateAttendanceReport(filtered);
        }
        
        setReportData(report);
        setReportGenerated(true);
      } catch (error) {
        console.error('Error al generar informe:', error);
      } finally {
        setLoading(false);
      }
    }, 1000); // Simular tiempo de procesamiento
  };

  // Exportar a PDF
  const exportToPDF = () => {
    setExportLoading({ ...exportLoading, pdf: true });
    
    setTimeout(() => {
      alert('Informe exportado a PDF correctamente');
      setExportLoading({ ...exportLoading, pdf: false });
    }, 1500);
  };

  // Exportar a Excel
  const exportToExcel = () => {
    setExportLoading({ ...exportLoading, excel: true });
    
    setTimeout(() => {
      alert('Informe exportado a Excel correctamente');
      setExportLoading({ ...exportLoading, excel: false });
    }, 1500);
  };

  // Exportar a CSV
  const exportToCSV = () => {
    setExportLoading({ ...exportLoading, csv: true });
    
    setTimeout(() => {
      alert('Informe exportado a CSV correctamente');
      setExportLoading({ ...exportLoading, csv: false });
    }, 1500);
  };

  // Renderizar tabla de informe de asistencia
  const renderAttendanceTable = () => {
    return (
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Empleado
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Días Trabajados
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Llegadas Tardías
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Promedio Horas/Día
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tasa de Asistencia
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {reportData.map((row) => (
            <tr key={row.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {row.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {row.daysWorked}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {row.lateArrivals}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {row.avgHoursPerDay}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {row.attendanceRate}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // Renderizar tabla de informe de horas
  const renderHoursTable = () => {
    return (
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Empleado
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Horas Trabajadas
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cliente
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Entrada Manual
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {reportData.map((row) => (
            <tr key={row.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {row.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {row.date}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {row.hoursWorked}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {row.client}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {row.manualEntry}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // Renderizar tabla de informe de rendimiento
  const renderPerformanceTable = () => {
    return (
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Empleado
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Días Trabajados
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Horas
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Promedio Horas/Día
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Llegadas Tardías
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Clientes Atendidos
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Puntuación
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {reportData.map((row) => (
            <tr key={row.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {row.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {row.daysWorked}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {row.totalHours}h
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {row.avgHoursPerDay}h
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {row.lateArrivals}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {row.clientCount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        parseInt(row.performanceScore) > 80 ? 'bg-green-500' : 
                        parseInt(row.performanceScore) > 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`} 
                      style={{ width: row.performanceScore }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm text-gray-500">{row.performanceScore}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // Renderizar tabla según el tipo de informe
  const renderReportTable = () => {
    switch (reportType) {
      case 'attendance':
        return renderAttendanceTable();
      case 'hours':
        return renderHoursTable();
      case 'performance':
        return renderPerformanceTable();
      default:
        return renderAttendanceTable();
    }
  };

  // Contenido principal
  const content = (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Informes</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Generar Informe</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label htmlFor="reportType" className="block text-gray-700 mb-2">Tipo de Informe</label>
            <select
              id="reportType"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="attendance">Asistencia</option>
              <option value="hours">Horas Trabajadas</option>
              <option value="performance">Rendimiento</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="dateRange" className="block text-gray-700 mb-2">Rango de Fechas</label>
            <select
              id="dateRange"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">Última Semana</option>
              <option value="month">Último Mes</option>
              <option value="quarter">Último Trimestre</option>
              <option value="year">Último Año</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="employee" className="block text-gray-700 mb-2">Empleado</label>
            <select
              id="employee"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los Empleados</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={generateReport}
            disabled={loading}
            className={`flex items-center justify-center px-4 py-2 rounded-md text-white font-medium ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generando...
              </>
            ) : (
              'Generar Informe'
            )}
          </button>
        </div>
      </div>
      
      {reportGenerated && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                {reportType === 'attendance' && 'Informe de Asistencia'}
                {reportType === 'hours' && 'Informe de Horas Trabajadas'}
                {reportType === 'performance' && 'Informe de Rendimiento'}
              </h2>
              
              <div className="flex space-x-2">
                <button
                  onClick={exportToPDF}
                  disabled={exportLoading.pdf}
                  className={`flex items-center px-3 py-1 text-sm rounded ${
                    exportLoading.pdf ? 'bg-gray-300 text-gray-500' : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  {exportLoading.pdf ? 'Exportando...' : 'PDF'}
                </button>
                
                <button
                  onClick={exportToExcel}
                  disabled={exportLoading.excel}
                  className={`flex items-center px-3 py-1 text-sm rounded ${
                    exportLoading.excel ? 'bg-gray-300 text-gray-500' : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {exportLoading.excel ? 'Exportando...' : 'Excel'}
                </button>
                
                <button
                  onClick={exportToCSV}
                  disabled={exportLoading.csv}
                  className={`flex items-center px-3 py-1 text-sm rounded ${
                    exportLoading.csv ? 'bg-gray-300 text-gray-500' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {exportLoading.csv ? 'Exportando...' : 'CSV'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {renderReportTable()}
          </div>
        </div>
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

export default ReportsPage;
