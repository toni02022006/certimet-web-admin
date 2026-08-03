import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import Swal from 'sweetalert2';

// Importa aquí la imagen de fondo y el logo
import fondoAdmin from '../image/FONDO1.jpeg'; 
import logoCertimet from '../image/LOGO2026.webp';

import './Login.css';

const Login = () => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate(); 
  const { login } = useContext(AuthContext);

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora >= 0 && hora < 12) return 'Buenos días';
    if (hora >= 12 && hora < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/auth/login', {
        correo,
        password,
        origen: 'admin'
      });

      const { token, usuario } = response.data;
      const rolUsuario = usuario.rol.toLowerCase();
      if (rolUsuario === 'cliente') {
        throw new Error('Acceso denegado. Este panel es exclusivo para personal autorizado. Dirígete a la tienda.');
      }
      login(usuario, token);

      // LÓGICA DE REDIRECCIÓN
      let rutaDestino = '/'; 
      const modulos = usuario.modulos || [];
      const esSuperAdmin = usuario.rol === 'Superadmin' || usuario.rol === 'Admin';

      if (esSuperAdmin || modulos.includes('Dashboard')) {
        rutaDestino = '/dashboard';
      } else if (modulos.includes('Gestión de Usuarios')) {
        rutaDestino = '/usuarios';
      } else if (modulos.includes('Gestión de Blog')) {
        rutaDestino = '/blog';
      }

      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer);
          toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
      });

      const saludo = obtenerSaludo();
      const nombreCompleto = `${usuario.nombre} ${usuario.apellidos || ''}`.trim();

      Toast.fire({
        icon: 'success',
        title: `${saludo}, ${nombreCompleto}`,
        text: `El sistema te da la bienvenida al área de ${usuario.rol}.`
      });

      navigate(rutaDestino); 

    } catch (err) {
      const mensajeError = err.response && err.response.data.error 
        ? err.response.data.error 
        : 'Error al conectar con el servidor';
        
      setError(mensajeError);

      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: mensajeError,
        confirmButtonColor: '#002f6c'
      });
    }
  };

  return (
    <div className="login-master-container">
      
      {/* FONDO QUE CUBRE TODO */}
      <img src={fondoAdmin} alt="Fondo Certimet" className="login-bg-image" />
      <div className="login-bg-overlay"></div>

      {/* CONTENEDOR FLOTANTE DE ELEMENTOS */}
      <div className="login-content-wrapper">
        {/* TARJETA DE LOGIN (Izquierda) */}
        <div className="login-card">
          
          <div className="login-header">
            <img src={logoCertimet} alt="Certimet Logo" className="login-logo" />
            <h2>Acceso Administrativo</h2>
            <p>Ingresa tus credenciales para continuar</p>
          </div>
          
          {error && (
            <div className="login-error-box">
              <span>⚠️</span> {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label>Correo Electrónico</label>
              <input 
                type="email" 
                placeholder="ejemplo@certimet.pe" 
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required 
              />
            </div>

            <div className="input-group">
              <label>Contraseña</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>

            <button type="submit" className="login-btn">
              Ingresar al sistema &rarr;
            </button>
          </form>
          
          <div className="login-footer">
            <p>© {new Date().getFullYear()} CERTIMET. Todos los derechos reservados.</p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Login;