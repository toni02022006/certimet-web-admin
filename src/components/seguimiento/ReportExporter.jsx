import React from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import axios from 'axios';

const ReportExporter = () => {
  const exportarExcel = async () => {
    const res = await axios.get('/api/seguimiento/todas-tareas'); // Endpoint para todas las tareas
    const data = res.data.map(t => ({
      Título: t.titulo,
      Usuario: t.asignado.nombre + ' ' + t.asignado.apellidos,
      Empresa: t.empresa.nombre,
      Categoría: t.categoria.nombre,
      Estado: t.estado,
      'Tiempo (horas)': calcularHoras(t.intervalos),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
    XLSX.writeFile(wb, 'reporte_tiempos.xlsx');
  };

  const exportarPDF = async () => {
    const res = await axios.get('/api/seguimiento/todas-tareas');
    const doc = new jsPDF();
    doc.text('Reporte de Tiempos', 14, 16);
    // Usar autotable para mostrar datos
    const tableData = res.data.map(t => [
      t.titulo,
      t.asignado.nombre + ' ' + t.asignado.apellidos,
      t.empresa.nombre,
      t.estado,
      calcularHoras(t.intervalos)
    ]);
    doc.autoTable({
      head: [['Título', 'Usuario', 'Empresa', 'Estado', 'Horas']],
      body: tableData,
    });
    doc.save('reporte_tiempos.pdf');
  };

  // Función auxiliar para calcular horas
  const calcularHoras = (intervalos) => {
    let total = 0;
    intervalos.forEach(i => {
      if (i.fecha_fin) {
        total += (new Date(i.fecha_fin) - new Date(i.fecha_inicio));
      }
    });
    return (total / 3600000).toFixed(2);
  };

  return (
    <div>
      <button onClick={exportarExcel}>Exportar a Excel</button>
      <button onClick={exportarPDF}>Exportar a PDF</button>
    </div>
  );
};

export default ReportExporter;