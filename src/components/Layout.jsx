import { useContext, useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Layout.css';

const Icon = ({ path, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

const icons = {
  dashboard: 'M3 3h7v9H3V3zm0 13h7v5H3v-5zm11-13h7v5h-7V3zm0 9h7v10h-7V12z',
  seguimientoAdmin: 'M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11',
  seguimientoSuper: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z',
  inicio: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M9 22V12h6v10',
  usuarios: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  blog: 'M4 19.5A2.5 2.5 0 016.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z',
  productos: 'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12',
  logout: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9',
  chevronLeft: 'M15 18l-6-6 6-6',
  asignacion: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
  calendario: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  pedidos: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2m-6 9l2 2 4-4',
};

// 💡 Configuración con los nombres exactos de tus módulos en la Base de Datos
const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: icons.dashboard, roles: ['Superadmin', 'Admin'], modulo: 'Dashboard' },
  { to: '/inicio', label: 'Inicio (Mis Tareas)', icon: icons.inicio, roles: ['*'], modulo: 'Inicio' },
  { to: '/gestion-pedidos', label: 'Gestión de Pedidos', icon: icons.pedidos, roles: ['Superadmin', 'Admin'], modulo: 'Gestión de Pedidos' },
  { to: '/calendario', label: 'Calendario', icon: icons.calendario, roles: ['*'], modulo: 'Calendario' }, // NUEVO
  { to: '/seguimiento-admin', label: 'Seguimiento (Admin)', icon: icons.seguimientoAdmin, roles: ['Superadmin', 'Admin'], modulo: 'Seguimiento (Admin)' },
  { to: '/asignacion', label: 'Asignación de Tareas', icon: icons.asignacion, roles: ['Superadmin', 'Admin'], modulo: 'Asignación de Tareas' },
  { to: '/seguimiento-super', label: 'Seguimiento (Super)', icon: icons.seguimientoSuper, roles: ['Superadmin'], modulo: 'Seguimiento (Super)' },
  { to: '/usuarios', label: 'Gestión de Usuarios', icon: icons.usuarios, roles: ['Superadmin'], modulo: 'Gestión de Usuarios' },
  { to: '/blog', label: 'Gestión de Blog', icon: icons.blog, roles: ['Superadmin', 'Admin'], modulo: 'Gestión de Blog' },
  { to: '/productos', label: 'Gestión de Productos', icon: icons.productos, roles: ['Superadmin', 'Admin'], modulo: 'Gestión de Productos' },
];

const Layout = () => {
  const { usuario, logout } = useContext(AuthContext);
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('certimet_sidebar_collapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('certimet_sidebar_collapsed', collapsed);
  }, [collapsed]);

  const esAdmin = usuario?.rol === 'Superadmin' || usuario?.rol === 'Admin';
  const esSuper = usuario?.rol === 'Superadmin';

  // 💡 Lógica que evalúa el rol de administración O los módulos asignados de la BD
  const canSee = (item) => {
    if (item.roles.includes('*')) return true;
    if (item.roles.includes('Superadmin') && esSuper) return true;
    if (item.roles.includes('Admin') && esAdmin) return true;
    
    // Si no es admin pero tiene el módulo habilitado individualmente en sus permisos de BD:
    if (usuario?.modulos && usuario.modulos.includes(item.modulo)) {
      return true;
    }

    return false;
  };

  return (
    <div className="cm-container">
      <aside className={`cm-sidebar ${collapsed ? 'cm-collapsed' : ''}`}>
        <button
          className="cm-toggle"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expandir menú' : 'Contraer menú'}
        >
          <Icon path={icons.chevronLeft} size={16} />
        </button>

        <div className="cm-logo-area">
          {collapsed ? (
            <span className="cm-logo-mini">C</span>
          ) : (
            <>
              <span className="cm-logo-accent">CERTIMET</span>&nbsp;ADMIN
            </>
          )}
        </div>

        <nav className="cm-nav">
          {NAV_ITEMS.filter((item) => canSee(item)).map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`cm-navlink ${isActive ? 'active' : ''}`}
                title={collapsed ? item.label : ''}
              >
                <Icon path={item.icon} size={19} />
                <span className="cm-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="cm-userbox">
          <div className="cm-userbox-row">
            <div className="cm-avatar">
              {usuario?.nombre?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            {!collapsed && (
              <div className="cm-userbox-info">
                <div className="cm-userbox-name">{usuario?.nombre}</div>
                <div className="cm-userbox-role">{usuario?.rol}</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className="cm-main">
        <header className="cm-header">
          <div className="cm-header-left">
            <span className="cm-header-icon">
              <Icon path={icons.dashboard} size={20} />
            </span>
            <div className="cm-header-userinfo">
              Bienvenido, <strong>{usuario?.nombre}</strong>
              <span className="cm-role-badge">{usuario?.rol}</span>
            </div>
          </div>

          <div className="cm-header-right">
            <div className="cm-header-actions">
              <button className="cm-notif-btn" title="Notificaciones">
                <Icon path="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" size={20} />
                <span className="cm-notif-badge">3</span>
              </button>
            </div>
            <button onClick={logout} className="cm-logout-btn">
              <Icon path={icons.logout} size={16} />
              Salir
            </button>
          </div>
        </header>
        <main className="cm-content">
          <div className="cm-fade-in" key={location.pathname}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;