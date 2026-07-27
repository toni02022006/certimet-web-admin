import React, { useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import Swal from 'sweetalert2'; 
import logoCertimet from '../image/Isotipo.png'; 

const NotificacionGlobal = () => {
  const { usuario } = useContext(AuthContext);
  const usuarioId = usuario?.id;

  useEffect(() => {
    if (!usuarioId) return;

    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }

    const socket = io(import.meta.env.VITE_API_URL); 

    socket.on('connect', () => {
      socket.emit('conectar_usuario', usuarioId);
    });

    socket.on('nueva_tarea', (datosTarea) => {
      const mensaje = `${datosTarea.creador || 'Administración'} te ha asignado: ${datosTarea.titulo}`;

      // ==========================================
      // NOTIFICACIÓN INTERNA (SWEETALERT2 MODERNO)
      // ==========================================
      Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 6000,
        timerProgressBar: true,
        background: '#043A6A', // Azul oscuro de Certimet
        color: '#FFFFFF',      // Texto blanco
        width: '360px',        // Ancho fijo y esbelto
        padding: '0.5rem',     // Reducimos el padding general
        customClass: {
          popup: 'swal-certimet-toast',
          timerProgressBar: 'swal-barra-verde'
        },
        // Usamos HTML personalizado para un diseño horizontal (Flexbox)
        html: `
          <div style="display: flex; align-items: center; gap: 15px; text-align: left; padding: 5px;">
            <div style="background-color: #FFFFFF; padding: 8px; border-radius: 8px; display: flex; align-items: center; justify-content: center; min-width: 45px; height: 45px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <img src="${logoCertimet}" style="width: 100%; max-width: 35px; height: auto; object-fit: contain;" alt="Certimet Logo" />
            </div>
            <div style="flex: 1;">
              <h4 style="margin: 0; font-size: 15px; font-weight: 700; color: #00FF00;">¡Nueva Tarea!</h4>
              <p style="margin: 4px 0 0 0; font-size: 13.5px; line-height: 1.4; opacity: 0.95;">${mensaje}</p>
            </div>
          </div>
        `,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      });

      // ==========================================
      // NOTIFICACIÓN NATIVA (WINDOWS/CHROME)
      // ==========================================
      if (Notification.permission === 'granted') {
        try {
          const notificacion = new Notification('¡Nueva Tarea Asignada!', {
            body: mensaje,
            icon: logoCertimet, 
            requireInteraction: true 
          });
          
          notificacion.onclick = () => {
            window.focus(); 
          };
        } catch (error) {
          console.error("❌ Error al mostrar notificación de Windows:", error);
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [usuarioId]);

  return null; 
};

export default NotificacionGlobal;