import React from 'react';

// ==============================
// ICONOS SVG (internos)
// ==============================
const IconChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const IconChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ListaMeses = ({ 
  eventos = [], 
  mesActual, 
  anioActual, 
  onCambiarMes, 
  onDiaClick, 
  onEventoClick 
}) => {
  // ==============================
  // CONSTANTES
  // ==============================
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const diasSemana = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  // ==============================
  // GENERAR LISTA DE MESES (6 meses a partir del actual)
  // ==============================
  const mesesLista = [];
  let mTemp = mesActual;
  let aTemp = anioActual;
  
  for (let i = 0; i < 6; i++) {
    mesesLista.push({ mes: mTemp, anio: aTemp });
    mTemp++;
    if (mTemp > 12) {
      mTemp = 1;
      aTemp++; // Salta al siguiente año si pasa diciembre
    }
  }

  // ==============================
  // AGRUPAR EVENTOS POR FECHA (YYYY-MM-DD)
  // ==============================
  const eventosPorFecha = {};
  eventos.forEach(ev => {
    const fecha = new Date(ev.fecha_inicio);
    const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
    if (!eventosPorFecha[key]) eventosPorFecha[key] = [];
    eventosPorFecha[key].push(ev);
  });

  // ==============================
  // FUNCIONES AUXILIARES
  // ==============================
  const tieneEvento = (fecha) => {
    const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
    return eventosPorFecha[key] && eventosPorFecha[key].length > 0;
  };

  const getEventosDia = (fecha) => {
    const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
    return eventosPorFecha[key] || [];
  };

  const contarEventosMes = (mes, anio) => {
    let count = 0;
    const diasEnMes = new Date(anio, mes, 0).getDate();
    for (let d = 1; d <= diasEnMes; d++) {
      const fecha = new Date(anio, mes - 1, d);
      const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
      if (eventosPorFecha[key]) {
        count += eventosPorFecha[key].length;
      }
    }
    return count;
  };

  // ==============================
  // RENDERIZAR MINI CALENDARIO
  // ==============================
  const renderMiniCalendario = (mes, anio) => {
    const primerDia = new Date(anio, mes - 1, 1).getDay();
    const diasEnMes = new Date(anio, mes, 0).getDate();
    const offset = (primerDia === 0) ? 6 : primerDia - 1;

    const dias = [];
    // Espacios vacíos al inicio
    for (let i = 0; i < offset; i++) {
      dias.push(null);
    }
    // Días del mes
    for (let i = 1; i <= diasEnMes; i++) {
      dias.push(i);
    }

    const semanas = [];
    for (let i = 0; i < dias.length; i += 7) {
      semanas.push(dias.slice(i, i + 7));
    }

    const totalEventos = contarEventosMes(mes, anio);

    return (
      <div key={`${anio}-${mes}`} className="mini-mes">
        <div className="mini-mes-header">
          <span className="mini-mes-nombre">{meses[mes - 1]} {anio}</span>
          <span className="mini-mes-count">{totalEventos} eventos</span>
        </div>
        <div className="mini-dias-semana">
          {diasSemana.map(d => (
            <span key={d} className="mini-dia-semana">{d}</span>
          ))}
        </div>
        <div className="mini-grid">
          {semanas.map((semana, idx) => (
            <div key={idx} className="mini-semana">
              {semana.map((dia, idx2) => {
                if (dia === null) {
                  return <div key={idx2} className="mini-dia vacio" />;
                }
                const fecha = new Date(anio, mes - 1, dia);
                const esHoy = fecha.toDateString() === new Date().toDateString();
                const tieneEventos = tieneEvento(fecha);
                const eventosDia = getEventosDia(fecha);

                return (
                  <div
                    key={idx2}
                    className={`mini-dia ${esHoy ? 'hoy' : ''} ${tieneEventos ? 'con-evento' : ''}`}
                    onClick={() => onDiaClick(fecha)}
                    title={`${dia} de ${meses[mes - 1]}`}
                  >
                    {dia}
                    {tieneEventos && (
                      <div className="mini-dia-puntos">
                        {eventosDia.slice(0, 2).map((ev, i) => (
                          <span
                            key={i}
                            className="mini-punto"
                            style={{ backgroundColor: ev.color_etiqueta || '#4a6cf7' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventoClick(ev);
                            }}
                            title={ev.titulo}
                          />
                        ))}
                        {eventosDia.length > 2 && (
                          <span className="mini-mas">+{eventosDia.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ==============================
  // RENDERIZADO PRINCIPAL
  // ==============================
  return (
    <div className="lista-meses">
      <div className="lista-meses-header">
        <span className="lista-meses-titulo">Meses</span>
        <span className="lista-meses-count">{mesesLista.length} meses</span>
      </div>
      <div className="lista-meses-grid">
        {mesesLista.map(({ mes, anio }) => renderMiniCalendario(mes, anio))}
      </div>
    </div>
  );
};

export default ListaMeses;