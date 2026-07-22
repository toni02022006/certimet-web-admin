import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const RutaSegura = ({ roles }) => {
  const { usuario } = useContext(AuthContext);
  if (!usuario) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to="/inicio" replace />;
  }
  return <Outlet />;
};

export default RutaSegura;