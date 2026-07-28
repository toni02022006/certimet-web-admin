import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import api from '../../services/api';

const PerformanceCharts = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get('/seguimiento/resumen')
      .then(res => {
        // Transformar datos para el gráfico
        const chartData = res.data.map(item => ({
          nombre: item.nombre + ' ' + item.apellidos,
          horas: (item.segundos_trabajados / 3600).toFixed(2),
        }));
        setData(chartData);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h3>Horas trabajadas por usuario</h3>
      <BarChart width={600} height={300} data={data}>
        <XAxis dataKey="nombre" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="horas" fill="#8884d8" />
      </BarChart>
    </div>
  );
};

export default PerformanceCharts;