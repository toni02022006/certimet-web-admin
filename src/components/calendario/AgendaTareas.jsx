import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import Swal from 'sweetalert2';

const IconEdit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const IconDelete = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const IconPlay = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const AgendaTareas = ({ tareas, cargando, onTareaIniciada, onTareaEditada, onTareaEliminada }) => {
  const { usuario } = useContext(AuthContext);

  const formatearTiempo = (ms) => {
    if (!ms) return '00:00:00';
    const totalSegundos = Math.floor(ms / 1000);
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
  };

  const calcularTiempoTotal = (tarea) => {
    if (!tarea.intervalos || tarea.intervalos.length === 0) return 0;
    let total = 0;
    tarea.intervalos.forEach(inter => {
      const inicio = new Date(inter.fecha_inicio).getTime();
      const fin = inter.fecha_fin ? new Date(inter.fecha_fin).getTime() : Date.now();
      total += fin - inicio;
    });
    return total;
  };

  const handleIniciar = async (tareaId) => {
    try {
      await api.post('/seguimiento/tarea/iniciar', { 
        tareaId,
        asignado_id: usuario.id,
        creador_id: usuario.id
      });
      Swal.fire('Iniciada', 'La tarea ha comenzado', 'success');
      if (onTareaIniciada) onTareaIniciada();
    } catch (error) {
      console.error('Error al iniciar tarea:', error);
      Swal.fire('Error', 'No se pudo iniciar la tarea', 'error');
    }
  };

  const renderTarea = (tarea) => {
    const tiempo = calcularTiempoTotal(tarea);
    const estado = tarea.estado || 'PENDIENTE';
    const estadoClass = estado.toLowerCase().replace('_', '-');
    const esPendiente = estado === 'PENDIENTE';

    return (
      <div key={tarea.id} className="agenda-item">
        <div className="agenda-item-fecha">
          <span className="agenda-item-dia">{new Date(tarea.fecha_creacion).getDate()}</span>
          <span className="agenda-item-mes">{new Date(tarea.fecha_creacion).toLocaleString('es', { month: 'short' })}</span>
        </div>
        <div className="agenda-item-info">
          <div className="agenda-item-titulo">{tarea.titulo}</div>
          <div className="agenda-item-detalles">
            <span className="agenda-item-categoria">{tarea.categoria?.nombre || 'Sin categoría'}</span>
            <span className={`agenda-item-estado estado-${estadoClass}`}>{estado.replace('_', ' ')}</span>
            <span className="agenda-item-prioridad">{tarea.empresa?.nombre || 'Sin empresa'}</span>
          </div>
          <div className="agenda-item-fechas">Tiempo: {formatearTiempo(tiempo)}</div>
        </div>
        <div className="agenda-item-acciones">
          {esPendiente && (
            <button className="btn-accion-iniciar" onClick={() => handleIniciar(tarea.id)} title="Iniciar">
              <IconPlay />
            </button>
          )}
          <button className="btn-accion-editar" onClick={() => onTareaEditada(tarea)} title="Editar">
            <IconEdit />
          </button>
          <button className="btn-accion-eliminar" onClick={() => onTareaEliminada(tarea.id)} title="Eliminar">
            <IconDelete />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="agenda-container">
      <h3 className="agenda-titulo">📋 Mis Tareas</h3>
      {cargando ? (
        <p className="agenda-vacio">Cargando tareas...</p>
      ) : tareas.length === 0 ? (
        <p className="agenda-vacio">No tienes tareas asignadas.</p>
      ) : (
        <div className="agenda-listas">{tareas.map(renderTarea)}</div>
      )}
    </div>
  );
};

export default AgendaTareas;