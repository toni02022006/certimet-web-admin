import React, { useState, useEffect } from 'react';

const TimerClock = ({ fechaInicio, tiempoAcumulado = 0 }) => {
  const [tiempo, setTiempo] = useState(tiempoAcumulado);

  useEffect(() => {
    if (!fechaInicio) return;
    const inicio = new Date(fechaInicio).getTime();
    const intervalo = setInterval(() => {
      const ahora = Date.now();
      const diff = ahora - inicio + tiempoAcumulado;
      setTiempo(diff);
    }, 1000);

    return () => clearInterval(intervalo);
  }, [fechaInicio, tiempoAcumulado]);

  const formatear = (ms) => {
    const totalSegundos = Math.floor(ms / 1000);
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
  };

  return <span>{formatear(tiempo)}</span>;
};

export default TimerClock;