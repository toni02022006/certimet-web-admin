import axios from 'axios';

const API_ORIGIN = import.meta.env.VITE_API_URL || 'https://api.certimet.pe';

const api = axios.create({
  baseURL: import.meta.env.DEV ? '/api' : `${API_ORIGIN}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para añadir token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// AUTH
// ============================================================
export const login = (correo, password) => 
  api.post('/auth/login', { correo, password }).then(res => res.data);

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
};

// ============================================================
// USUARIOS
// ============================================================
export const obtenerUsuarios = () => api.get('/usuarios').then(res => res.data);
export const obtenerPracticantes = () => api.get('/usuarios/practicantes').then(res => res.data);

// ============================================================
// CATEGORÍAS Y EMPRESAS
// ============================================================
export const obtenerCategorias = () => api.get('/seguimiento/categorias').then(res => res.data);
export const obtenerEmpresas = () => api.get('/seguimiento/empresas').then(res => res.data);

// ============================================================
// TAREAS (seguimiento)
// ============================================================
export const iniciarTarea = (data) => api.post('/seguimiento/tarea/iniciar', data).then(res => res.data);
export const pausarTarea = (data) => api.post('/seguimiento/tarea/pausar', data).then(res => res.data);
export const reanudarTarea = (data) => api.post('/seguimiento/tarea/reanudar', data).then(res => res.data);
export const finalizarTarea = (data) => api.post('/seguimiento/tarea/finalizar', data).then(res => res.data);
export const obtenerEstadoActual = (usuarioId) => 
  api.get(`/seguimiento/estado?usuario_id=${usuarioId}`).then(res => res.data);
export const obtenerTareasUsuario = (usuarioId) => 
  api.get(`/seguimiento/usuario/${usuarioId}/tareas`).then(res => res.data);
export const actualizarTarea = (id, data) => api.put(`/seguimiento/tarea/${id}`, data).then(res => res.data);
export const eliminarTarea = (id) => api.delete(`/seguimiento/tarea/${id}`).then(res => res.data);

// Admin
export const obtenerEstadoPracticantes = () => api.get('/seguimiento/estado-practicantes').then(res => res.data);
export const obtenerTodasTareas = () => api.get('/seguimiento/todas-tareas').then(res => res.data);
export const obtenerEquipoAdmin = () => api.get('/seguimiento/admin/equipo').then(res => res.data);
export const obtenerTareasEquipo = (filtros) => 
  api.get('/seguimiento/admin/tareas', { params: filtros }).then(res => res.data);
export const obtenerKPIsEquipo = (filtros) => 
  api.get('/seguimiento/admin/kpis', { params: filtros }).then(res => res.data);

// ============================================================
// GRUPOS Y ASIGNACIÓN
// ============================================================
export const obtenerGrupos = () => api.get('/kanban/grupos').then(res => res.data);
export const crearGrupo = (data) => api.post('/kanban/grupos', data).then(res => res.data);
export const moverTarea = (id, grupo_id) => 
  api.put(`/kanban/tareas/${id}/mover`, { grupo_id }).then(res => res.data);

// 👇 Estas rutas ahora apuntan a /api/grupos (nuevo router)
export const agregarUsuarioAGrupo = (data) => api.post('/grupos/agregar-usuario', data).then(res => res.data);
export const quitarUsuarioDeGrupo = (data) => api.post('/grupos/quitar-usuario', data).then(res => res.data);

export const crearTareaPendiente = (data) => api.post('/seguimiento/tarea-pendiente', data).then(res => res.data);
export const obtenerTareasPendientes = (usuarioId) => 
  api.get(`/kanban/tareas-pendientes?usuario_id=${usuarioId}`).then(res => res.data);
export const iniciarTareaExistente = (data) => api.post('/kanban/tareas/iniciar', data).then(res => res.data);

// ============================================================
// PRODUCTOS, BLOG, etc.
// ============================================================
export const obtenerProductos = () => api.get('/productos').then(res => res.data);
export const crearProducto = (data) => api.post('/productos', data).then(res => res.data);
export const actualizarProducto = (id, data) => api.put(`/productos/${id}`, data).then(res => res.data);
export const eliminarProducto = (id) => api.delete(`/productos/${id}`).then(res => res.data);

export const obtenerBlogs = () => api.get('/blog').then(res => res.data);
export const crearBlog = (data) => api.post('/blog', data).then(res => res.data);
export const actualizarBlog = (id, data) => api.put(`/blog/${id}`, data).then(res => res.data);
export const eliminarBlog = (id) => api.delete(`/blog/${id}`).then(res => res.data);

export default api;