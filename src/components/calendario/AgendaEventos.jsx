import React from 'react';

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

const AgendaEventos = ({ eventos, cargando, onEditar, onEliminar }) => {
  const ahora = new Date();
  const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

  // Solo eventos próximos (fecha inicio >= hoy)
  const proximos = eventos
    .filter(ev => {
      const fechaInicio = new Date(ev.fecha_inicio);
      return fechaInicio >= hoy;
    })
    .sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio));

  const renderEvento = (ev) => {
    const fechaInicio = new Date(ev.fecha_inicio);
    const fechaFin = ev.fecha_fin ? new Date(ev.fecha_fin) : null;
    const estado = ev.estado || 'PENDIENTE';
    const estadoClass = estado.toLowerCase().replace('_', '-');
    const prioridad = ev.prioridad || 'Media';
    const categoria = ev.tipo_evento?.replace('_', ' ') || 'General';

    return (
      <div key={ev.id} className="agenda-item">
        <div className="agenda-item-fecha">
          <span className="agenda-item-dia">{fechaInicio.getDate()}</span>
          <span className="agenda-item-mes">
            {fechaInicio.toLocaleString('es', { month: 'short' })}
          </span>
        </div>
        <div className="agenda-item-info">
          <div className="agenda-item-titulo">{ev.titulo}</div>
          <div className="agenda-item-detalles">
            <span className="agenda-item-categoria">{categoria}</span>
            <span className={`agenda-item-estado estado-${estadoClass}`}>
              {estado.replace('_', ' ')}
            </span>
            <span className="agenda-item-prioridad">{prioridad}</span>
          </div>
          <div className="agenda-item-fechas">
            {fechaInicio.toLocaleDateString('es')}
            {fechaFin && ` - ${fechaFin.toLocaleDateString('es')}`}
          </div>
        </div>
        <div className="agenda-item-acciones">
          <button className="btn-accion-editar" onClick={() => onEditar(ev)} title="Editar">
            <IconEdit />
          </button>
          <button className="btn-accion-eliminar" onClick={() => onEliminar(ev.id)} title="Eliminar">
            <IconDelete />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="agenda-container">
      <h3 className="agenda-titulo">Agenda</h3>

      {cargando ? (
        <p className="agenda-vacio">Cargando eventos...</p>
      ) : eventos.length === 0 ? (
        <p className="agenda-vacio">No hay eventos con los filtros seleccionados.</p>
      ) : (
        <div className="agenda-listas">
          <div className="agenda-seccion">
            <h4 className="agenda-seccion-titulo">
              Próximos eventos ({proximos.length})
            </h4>
            {proximos.length === 0 ? (
              <p className="agenda-vacio">No hay eventos próximos</p>
            ) : (
              proximos.map(renderEvento)
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendaEventos;