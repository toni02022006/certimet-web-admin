import { createContext, useState, useEffect } from 'react';

// Creamos el contexto
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  // Efecto para mantener la sesión si recargamos la página
  useEffect(() => {
    if (token) {
      // Aquí más adelante podemos hacer un fetch al backend para validar si el token sigue vivo,
      // por ahora, si hay token en el localStorage, asumimos que está logueado.
      const storedUser = localStorage.getItem('usuario');
      if (storedUser) {
        setUsuario(JSON.parse(storedUser));
      }
    }
  }, [token]);

  // Función para iniciar sesión
  const login = (userData, userToken) => {
    setUsuario(userData);
    setToken(userToken);
    localStorage.setItem('token', userToken);
    localStorage.setItem('usuario', JSON.stringify(userData));
  };

  // Función para cerrar sesión
  const logout = () => {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  };

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};