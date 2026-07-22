import React from 'react';

// Iconos
const IconClock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const EventosPasados = ({ eventos, onEventoClick }) => {
  const ahora = new Date();
  const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

  // Filtrar eventos pasados (fecha inicio < hoy)
  const pasados = eventos
    .filter(ev => {
      const fechaInicio = new Date(ev.fecha_inicio);
      return fechaInicio < hoy;
    })
    .sort((a, b) => new Date(b.fecha_inicio) - new Date(a.fecha_inicio));

  if (pasados.length === 0) {
    return (
      <div className="eventos-pasados">
        <div className="eventos-pasados-header">
          <h4><IconClock /> Eventos Pasados</h4>
        </div>
        <p className="eventos-pasados-vacio">No hay eventos pasados</p>
      </div>
    );
  }

  return (
    <div className="eventos-pasados">
      <div className="eventos-pasados-header">
        <h4><IconClock /> Eventos Pasados</h4>
        <span className="eventos-pasados-count">{pasados.length}</span>
      </div>
      <div className="eventos-pasados-lista">
        {pasados.map(ev => {
          const fecha = new Date(ev.fecha_inicio);
          const prioridad = ev.prioridad || 'Media';
          const estado = ev.estado || 'PENDIENTE';
          const estadoClass = estado.toLowerCase().replace('_', '-');

          return (
            <div
              key={ev.id}
              className="evento-pasado-item"
              onClick={() => onEventoClick(ev)}
            >
              <div className="evento-pasado-fecha">
                {fecha.getDate()}
              </div>
              <div className="evento-pasado-info">
                <div className="evento-pasado-titulo">{ev.titulo}</div>
                <div className="evento-pasado-detalles">
                  <span className="evento-pasado-categoria">
                    {ev.tipo_evento?.replace('_', ' ') || 'General'}
                  </span>
                  <span className={`evento-pasado-estado estado-${estadoClass}`}>
                    {estado.replace('_', ' ')}
                  </span>
                  <span className="evento-pasado-prioridad">{prioridad}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventosPasados;