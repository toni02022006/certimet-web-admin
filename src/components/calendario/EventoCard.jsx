import React from 'react';

// ==============================
// ICONOS SVG (internos)
// ==============================
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

/**
 * EventoCard - Muestra un evento en formato tarjeta con sus datos principales
 * @param {Object} evento - Datos del evento
 * @param {Function} onEditar - Callback al hacer clic en editar
 * @param {Function} onEliminar - Callback al hacer clic en eliminar
 */
const EventoCard = ({ evento, onEditar, onEliminar }) => {
  if (!evento) return null;

  const fechaInicio = new Date(evento.fecha_inicio);
  const fechaFin = evento.fecha_fin ? new Date(evento.fecha_fin) : null;
  const estado = evento.estado || 'PENDIENTE';
  const estadoClass = estado.toLowerCase().replace('_', '-');
  const prioridad = evento.prioridad || 'Media';
  const categoria = evento.tipo_evento?.replace('_', ' ') || 'General';

  return (
    <div className="evento-card">
      {/* Bloque de fecha */}
      <div className="evento-card-fecha">
        <span className="evento-card-dia">{fechaInicio.getDate()}</span>
        <span className="evento-card-mes">
          {fechaInicio.toLocaleString('es', { month: 'short' })}
        </span>
      </div>

      {/* Bloque de información */}
      <div className="evento-card-info">
        <div className="evento-card-titulo">{evento.titulo}</div>
        <div className="evento-card-detalles">
          <span className="evento-card-categoria">{categoria}</span>
          <span className={`evento-card-estado estado-${estadoClass}`}>
            {estado.replace('_', ' ')}
          </span>
          <span className="evento-card-prioridad">{prioridad}</span>
        </div>
        <div className="evento-card-fechas">
          {fechaInicio.toLocaleDateString('es')}
          {fechaFin && ` - ${fechaFin.toLocaleDateString('es')}`}
        </div>
        {evento.descripcion && (
          <div className="evento-card-descripcion">
            {evento.descripcion.length > 80 
              ? `${evento.descripcion.substring(0, 80)}...` 
              : evento.descripcion}
          </div>
        )}
      </div>

      {/* Bloque de acciones */}
      <div className="evento-card-acciones">
        <button
          className="btn-accion-editar"
          onClick={() => onEditar(evento)}
          title="Editar evento"
        >
          <IconEdit />
        </button>
        <button
          className="btn-accion-eliminar"
          onClick={() => onEliminar(evento.id)}
          title="Eliminar evento"
        >
          <IconDelete />
        </button>
      </div>
    </div>
  );
};

export default EventoCard;