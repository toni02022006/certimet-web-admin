import React from 'react';

// ==============================
// ICONOS SVG (internos)
// ==============================
const IconChevronLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const IconChevronRight = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const CalendarioMensual = ({ 
  eventos = [], 
  mes, 
  anio, 
  onCambiarMes, 
  onDiaClick, 
  onEventoClick 
}) => {
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // Obtener primer día del mes (0=domingo, 1=lunes, ...)
  const primerDia = new Date(anio, mes - 1, 1).getDay();
  const diasEnMes = new Date(anio, mes, 0).getDate();
  const diasEnMesAnterior = new Date(anio, mes - 1, 0).getDate();

  // Ajuste para que la semana empiece en lunes
  const offset = (primerDia === 0) ? 6 : primerDia - 1;

  const handleMesAnterior = () => {
    const nuevoMes = mes === 1 ? 12 : mes - 1;
    const nuevoAnio = mes === 1 ? anio - 1 : anio;
    onCambiarMes(nuevoMes, nuevoAnio);
  };

  const handleMesSiguiente = () => {
    const nuevoMes = mes === 12 ? 1 : mes + 1;
    const nuevoAnio = mes === 12 ? anio + 1 : anio;
    onCambiarMes(nuevoMes, nuevoAnio);
  };

  // Agrupar eventos por día
  const eventosPorDia = {};
  eventos.forEach(ev => {
    const fecha = parsearFechaLocal(ev.fecha_inicio);
    const dia = fecha.getDate();
    if (!eventosPorDia[dia]) eventosPorDia[dia] = [];
    eventosPorDia[dia].push(ev);
  });

  // Construir grid de días
  const dias = [];
  // Días del mes anterior
  for (let i = offset - 1; i >= 0; i--) {
    const dia = diasEnMesAnterior - i;
    dias.push({ dia, mes: 'anterior', fecha: new Date(anio, mes - 2, dia) });
  }
  // Días del mes actual
  for (let i = 1; i <= diasEnMes; i++) {
    dias.push({ dia: i, mes: 'actual', fecha: new Date(anio, mes - 1, i) });
  }
  // Días del mes siguiente
  const totalDias = dias.length;
  const diasRestantes = 42 - totalDias; // 6 filas * 7 días
  for (let i = 1; i <= diasRestantes; i++) {
    dias.push({ dia: i, mes: 'siguiente', fecha: new Date(anio, mes, i - 1) });
  }

  // Dividir en semanas
  const semanas = [];
  for (let i = 0; i < dias.length; i += 7) {
    semanas.push(dias.slice(i, i + 7));
  }

  // Verificar si un día tiene eventos
  const tieneEventos = (diaObj) => {
    const dia = diaObj.dia;
    return eventosPorDia[dia] && eventosPorDia[dia].length > 0;
  };

  // Obtener eventos de un día
  const getEventosDia = (diaObj) => {
    const dia = diaObj.dia;
    return eventosPorDia[dia] || [];
  };

  return (
    <div className="calendario-mensual">
      <div className="calendario-mensual-header">
        <button onClick={handleMesAnterior} className="btn-mes" title="Mes anterior">
          <IconChevronLeft />
        </button>
        <span className="calendario-mes-titulo">{meses[mes - 1]} {anio}</span>
        <button onClick={handleMesSiguiente} className="btn-mes" title="Mes siguiente">
          <IconChevronRight />
        </button>
      </div>

      <div className="calendario-dias-semana">
        {diasSemana.map(d => (
          <span key={d} className="dia-semana">{d}</span>
        ))}
      </div>

      <div className="calendario-grid-dias">
        {semanas.map((semana, idx) => (
          <div key={idx} className="calendario-semana">
            {semana.map((diaObj, idx2) => {
              const esActual = diaObj.mes === 'actual';
              const esHoy = diaObj.fecha.toDateString() === new Date().toDateString();
              const tieneEventosDia = tieneEventos(diaObj);
              const eventosDia = getEventosDia(diaObj);

              return (
                <div
                  key={idx2}
                  className={`calendario-dia ${!esActual ? 'otro-mes' : ''} ${esHoy ? 'hoy' : ''} ${tieneEventosDia ? 'con-eventos' : ''}`}
                  onClick={() => esActual && onDiaClick(diaObj.fecha)}
                >
                  <span className="dia-numero">{diaObj.dia}</span>
                  {tieneEventosDia && (
                    <div className="dia-eventos">
                      {eventosDia.slice(0, 3).map((ev, i) => (
                        <div
                          key={i}
                          className="dia-evento"
                          style={{ backgroundColor: ev.color_etiqueta || '#4a6cf7' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventoClick(ev);
                          }}
                          title={ev.titulo}
                        />
                      ))}
                      {eventosDia.length > 3 && (
                        <span className="dia-eventos-mas">+{eventosDia.length - 3}</span>
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

export default CalendarioMensual;