import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Layout y vistas
import Layout from './components/Layout';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Usuarios from './views/Usuarios';
import Blog from './views/Blog';
import Productos from './views/Productos';
import ProductoFormPage from './views/ProductoFormPage';
import Inicio from './views/Inicio';
import SeguimientoAdmin from './views/SeguimientoAdmin';
import SeguimientoSuper from './views/SeguimientoSuper';
import AsignacionAdmin from './views/AsignacionAdmin';
import RutaSegura from './components/RutaSegura';
import Calendario from './views/Calendario';
import NotificacionGlobal from './utils/NotificacionGlobal';    
import GestionPedidos from './views/GestionPedidos';
import NuevoArticulo from './components/Blog/NuevoArticulo';
import MarketingView from './views/MarketingView';

// Guardián de rutas (requiere token)
const RutaProtegida = ({ children }) => {
  const { token } = useContext(AuthContext);
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

// Redirección según rol
const RootRedirect = () => {
  const { usuario } = useContext(AuthContext);
  const esAdmin = usuario?.rol === 'Superadmin' || usuario?.rol === 'Admin';
  return <Navigate to={esAdmin ? '/dashboard' : '/inicio'} replace />;
};

// ===============================================================
// Función que genera un mensaje según la hora del día
// ===============================================================
const mensajeSalida = () => {
  const hora = new Date().getHours();
  if (hora < 12) return "Buenos días, ¡sigue gestionando! ☀️";
  if (hora < 18) return "Buenas tardes, no abandones tu trabajo. 🌤️";
  return "Buenas noches, un último esfuerzo. 🌙";
};

function App() {
  // ==========================================================================
  // EFECTO: Cambio de título cuando el usuario cambia de pestaña
  // ==========================================================================
  useEffect(() => {
    const tituloOriginal = document.title;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Mensaje dinámico según la hora del día
        document.title = `${mensajeSalida()} | CERTIMET Admin`;
      } else {
        // Restaurar título original al volver
        document.title = tituloOriginal;
        // Opcional: pequeño saludo en consola (puedes eliminarlo)
        console.log("✅ Bienvenido de vuelta, administrador.");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <AuthProvider>
      <Router>
        <NotificacionGlobal />
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas con Layout */}
          <Route
            path="/"
            element={
              <RutaProtegida>
                <Layout />
              </RutaProtegida>
            }
          >
            <Route index element={<RootRedirect />} />

            {/* Todos pueden ver Inicio */}
            <Route path="inicio" element={<Inicio />} />
            <Route path="calendario" element={<Calendario />} /> 

            {/* Rutas con restricción de rol: Admin y Superadmin */}
            <Route element={<RutaSegura roles={['Admin', 'Superadmin']} />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="seguimiento-admin" element={<SeguimientoAdmin />} />
              <Route path="blog" element={<Blog />} />
              <Route path="/admin/blog/nuevo" element={<NuevoArticulo />} />
              <Route path="/admin/blog/editar/:id" element={<NuevoArticulo />} />
              <Route path="productos" element={<Productos />} />
              <Route path="productos/nuevo" element={<ProductoFormPage />} />
              <Route path="productos/editar/:id" element={<ProductoFormPage />} />
              <Route path="gestion-pedidos" element={<GestionPedidos />} />
              <Route path="asignacion" element={<AsignacionAdmin />} />
              <Route path="marketing" element={<MarketingView />} />              
            </Route>

            {/* Rutas solo Superadmin */}
            <Route element={<RutaSegura roles={['Superadmin']} />}>
              <Route path="seguimiento-super" element={<SeguimientoSuper />} />
              <Route path="usuarios" element={<Usuarios />} />
            </Route>
          </Route>

          {/* Cualquier otra ruta redirige */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;