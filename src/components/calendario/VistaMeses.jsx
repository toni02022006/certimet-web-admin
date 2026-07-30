import React from 'react';

const VistaMeses = ({ eventos, mesActual, anioActual, onCambiarMes, onEventoClick }) => {
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  // Agrupar eventos por mes (solo los del año actual)
  const eventosPorMes = {};
  eventos.forEach(ev => {
    const fecha = parsearFechaLocal(ev.fecha_inicio);
    const mes = fecha.getMonth() + 1;
    const anio = fecha.getFullYear();
    // Se eliminó el filtro que solo permitía el año actual
    const key = `${anio}-${String(mes).padStart(2, '0')}`;
    if (!eventosPorMes[key]) eventosPorMes[key] = [];
    eventosPorMes[key].push(ev);
  });

  // Ordenar meses
  const mesesKeys = Object.keys(eventosPorMes).sort();

  // Formatear fecha para mostrar
  const formatearFecha = (fecha) => {
    const f = new Date(fecha);
    const opciones = { weekday: 'long', day: 'numeric', month: 'short' };
    return f.toLocaleDateString('es', opciones).toUpperCase();
  };

  // Formatear rango de fechas
  const formatearRango = (fechaInicio, fechaFin) => {
    const ini = parsearFechaLocal(fechaInicio);
    if (!fechaFin) return ini.toLocaleDateString('es');
    const fin = parsearFechaLocal(fechaFin);
    if (ini.toDateString() === fin.toDateString()) return ini.toLocaleDateString('es');
    return `${ini.toLocaleDateString('es')} - ${fin.toLocaleDateString('es')}`;
  };

  // Renderizar cada evento
  const renderEvento = (ev) => {
    const prioridad = ev.prioridad || 'Media';
    const estado = ev.estado || 'PENDIENTE';
    const estadoClass = estado.toLowerCase().replace('_', '-');
    const categoria = ev.tipo_evento?.replace('_', ' ') || 'General';

    return (
      <div key={ev.id} className="vista-meses-evento" onClick={() => onEventoClick(ev)}>
        <div className="vista-meses-evento-header">
          <span className="vista-meses-evento-titulo">{ev.titulo}</span>
          <span className={`vista-meses-evento-estado estado-${estadoClass}`}>
            {estado.replace('_', ' ')}
          </span>
        </div>
        <div className="vista-meses-evento-detalles">
          <span className="vista-meses-evento-categoria">{categoria}</span>
          <span className="vista-meses-evento-prioridad">{prioridad}</span>
          <span className="vista-meses-evento-fecha">{formatearRango(ev.fecha_inicio, ev.fecha_fin)}</span>
        </div>
        {ev.descripcion && (
          <div className="vista-meses-evento-descripcion">
            {ev.descripcion.length > 120 ? `${ev.descripcion.substring(0, 120)}...` : ev.descripcion}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="vista-meses-container">
      {mesesKeys.length === 0 ? (
        <p className="vista-meses-vacio">No hay eventos para este año.</p>
      ) : (
        mesesKeys.map(key => {
          const [anio, mesStr] = key.split('-');
          const mes = parseInt(mesStr);
          const eventosMes = eventosPorMes[key];
          const totalEventos = eventosMes.length;
          const esMesActual = (mes === mesActual && parseInt(anio) === anioActual);

          return (
            <div key={key} className={`vista-meses-grupo ${esMesActual ? 'mes-actual' : ''}`}>
              <div className="vista-meses-grupo-header">
                <h3 className="vista-meses-grupo-titulo">
                  {meses[mes - 1]} {anio}
                </h3>
                <span className="vista-meses-grupo-count">{totalEventos} eventos</span>
              </div>
              <div className="vista-meses-grupo-eventos">
                {eventosMes.map(renderEvento)}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default VistaMeses;