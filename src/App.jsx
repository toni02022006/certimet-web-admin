import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
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
import AsignacionAdmin from './views/AsignacionAdmin'; // 👈 NUEVA
import RutaSegura from './components/RutaSegura';
import Calendario from './views/Calendario';
import NotificacionGlobal from './utils/NotificacionGlobal';    

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

function App() {
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
              <Route path="productos" element={<Productos />} />
              <Route path="productos/nuevo" element={<ProductoFormPage />} />
              <Route path="productos/editar/:id" element={<ProductoFormPage />} />
              
              {/* 👇 NUEVA RUTA PARA ASIGNACIÓN */}
              <Route path="asignacion" element={<AsignacionAdmin />} />
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