import { Navigate, Outlet } from 'react-router-dom';

export default function RutaSegura({ moduloRequerido }) {
  // 1. Verificamos si hay alguien logueado (si hay token/usuario)
  const usuarioInfo = localStorage.getItem('usuario'); 
  
  if (!usuarioInfo) {
    // Si no está logueado, lo mandamos al login sin preguntar
    return <Navigate to="/login" replace />;
  }

  const usuario = JSON.parse(usuarioInfo);

  // 2. Si es Superadmin, le damos pase VIP a todo, ignorando las reglas
  if (usuario.rol === 'Superadmin') {
    return <Outlet />;
  }

  // 3. Verificamos si tiene el módulo requerido para esta URL
  if (moduloRequerido && (!usuario.modulos || !usuario.modulos.includes(moduloRequerido))) {
    // Si intenta entrar a una URL prohibida, lo regresamos al dashboard
    console.warn(`Acceso denegado. Se requiere el módulo: ${moduloRequerido}`);
    return <Navigate to="/dashboard" replace />; 
  }

  // 4. Si pasa todas las pruebas, renderizamos la página que pidió
  return <Outlet />;
}