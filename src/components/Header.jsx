import React, { useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Header.css';

// Subcomponente Icon independiente para el Header
const Icon = ({ path, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

const Header = () => {
  const { usuario, logout } = useContext(AuthContext);
  const location = useLocation();
  const [fechaHora, setFechaHora] = useState(new Date());

  // Efecto para actualizar el reloj cada segundo
  useEffect(() => {
    const timer = setInterval(() => setFechaHora(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Formateo de fecha y hora
  const fechaFormateada = fechaHora.toLocaleDateString('es-PE', { 
    weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' 
  });
  const horaFormateada = fechaHora.toLocaleTimeString('es-PE', { 
    hour: '2-digit', minute: '2-digit' 
  });
  
  // Capitalizar la primera letra de la fecha
  const fechaCapitalizada = fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);

  // Utilidad para generar el nombre de la ruta actual
  const obtenerNombreRuta = (path) => {
    const rutas = {
      '/dashboard': 'Dashboard General',
      '/inicio': 'Mis Tareas',
      '/gestion-pedidos': 'Gestión de Pedidos',
      '/calendario': 'Calendario',
      '/seguimiento-admin': 'Seguimiento (Admin)',
      '/asignacion': 'Asignación de Tareas',
      '/seguimiento-super': 'Seguimiento (Super)',
      '/usuarios': 'Gestión de Usuarios',
      '/blog': 'Gestión de Blog',
      '/productos': 'Gestión de Productos',
      '/marketing': 'Marketing'
    };
    return rutas[path] || 'Panel Administrativo';
  };

  return (
    <header className="cm-header">
      {/* LADO IZQUIERDO: Breadcrumbs */}
      <div className="cm-header-left">
        <div className="cm-breadcrumbs">
          <Icon path="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" size={18} />
          <span className="cm-breadcrumb-separator">/</span>
          <span className="cm-breadcrumb-current">{obtenerNombreRuta(location.pathname)}</span>
        </div>
      </div>

      {/* CENTRO: Reloj */}
      <div className="cm-header-center">
        <div className="cm-widget-clock">
          <Icon path="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" size={16} />
          <span className="cm-date">{fechaCapitalizada}</span>
          <span className="cm-time-divider">|</span>
          <span className="cm-time">{horaFormateada}</span>
        </div>
      </div>

      {/* LADO DERECHO: Estado y Perfil */}
      <div className="cm-header-right">
        
        {/* Widget de estado del sistema */}
        <div className="cm-widget-status" title="Sistema operando con normalidad">
          <span className="cm-status-dot"></span>
        </div>

        {/* Botón Perfil / Salir */}
        <div className="cm-profile-dropdown">
          <div className="cm-header-userinfo">
            <span className="cm-greeting">Hola,</span> <strong>{usuario?.nombre}</strong>
            <span className="cm-role-badge">{usuario?.rol}</span>
          </div>
          <button onClick={logout} className="cm-logout-icon-btn" title="Cerrar Sesión">
            <Icon path="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" size={18} />
          </button>
        </div>
        
      </div>
    </header>
  );
};

export default Header;