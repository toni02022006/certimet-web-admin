import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TimerClock from './TimerClock';

const AdminLiveMonitor = () => {
  const [practicantes, setPracticantes] = useState([]);

  const fetchPracticantes = async () => {
    try {
      // Endpoint que devuelva lista de practicantes con su tarea activa (si la tienen)
      const res = await axios.get('/api/seguimiento/estado-practicantes'); // Crear este endpoint
      setPracticantes(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPracticantes();
    const interval = setInterval(fetchPracticantes, 5000); // Actualizar cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="admin-monitor">
      <h2>Monitoreo en Vivo</h2>
      <div className="practicantes-grid">
        {practicantes.map(p => (
          <div key={p.id} className="practicante-card">
            <h3>{p.nombre} {p.apellidos}</h3>
            {p.tareaActiva ? (
              <>
                <p><strong>Tarea:</strong> {p.tareaActiva.titulo}</p>
                <p><strong>Empresa:</strong> {p.tareaActiva.empresa.nombre}</p>
                <p><strong>Tiempo:</strong> <TimerClock fechaInicio={p.tareaActiva.intervaloActual.fecha_inicio} tiempoAcumulado={p.tareaActiva.tiempoAcumulado} /></p>
                <button onClick={() => pausarTarea(p.tareaActiva.id)}>Pausar</button>
              </>
            ) : (
              <p>Sin tarea activa</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminLiveMonitor;