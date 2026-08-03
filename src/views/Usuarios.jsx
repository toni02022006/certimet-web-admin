import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // <-- Importado igual que en Plantillas
import Swal from 'sweetalert2';
import ModalNuevoModulo from '../components/ModalNuevoModulo';
import './Usuarios.css';

const Usuarios = () => {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalModuloAbierto, setModalModuloAbierto] = useState(false);
  
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [modulosDisponibles, setModulosDisponibles] = useState([]);
  
  const [busqueda, setBusqueda] = useState('');
  const [editandoId, setEditandoId] = useState(null);

  const [formData, setFormData] = useState({ nombre: '', apellidos: '', correo: '', password: '', rol_id: '' });
  const [modulosSeleccionados, setModulosSeleccionados] = useState([]);

  const fetchUsuarios = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/usuarios');
      if (response.ok) setUsuarios(await response.json());
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/roles');
      if (response.ok) setRoles(await response.json());
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchModulos = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/modulos');
      if (response.ok) setModulosDisponibles(await response.json());
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchUsuarios();
    fetchRoles();
    fetchModulos();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setModulosSeleccionados([...modulosSeleccionados, value]);
    } else {
      setModulosSeleccionados(modulosSeleccionados.filter(id => id !== value));
    }
  };

  const usuariosFiltrados = usuarios.filter(u => 
    u.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    u.apellidos.toLowerCase().includes(busqueda.toLowerCase()) || 
    u.correo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleEditar = (user) => {
    setEditandoId(user.id);
    setFormData({
      nombre: user.nombre,
      apellidos: user.apellidos,
      correo: user.correo,
      password: '',
      rol_id: user.rol_id
    });
    setModulosSeleccionados(user.modulos_ids || []);
    setModalAbierto(true);
  };

  const handleEliminar = async (id) => {
    const confirm = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (confirm.isConfirmed) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios/${id}`, { method: 'DELETE' });
        if (response.ok) {
          Swal.fire('Eliminado!', 'El usuario ha sido eliminado.', 'success');
          fetchUsuarios();
        } else {
          Swal.fire('Error', 'No se pudo eliminar el usuario.', 'error');
        }
      } catch (error) {
        Swal.fire('Error', 'Problema de conexión.', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.rol_id) return Swal.fire({ icon: 'warning', text: 'Selecciona un rol.' });
    if (modulosSeleccionados.length === 0) return Swal.fire({ icon: 'warning', text: 'Selecciona al menos un módulo.' });

    const payload = { ...formData, modulos_ids: modulosSeleccionados };
    const url = editandoId 
      ? `${import.meta.env.VITE_API_URL}/api/usuarios/${editandoId}` 
      : import.meta.env.VITE_API_URL + '/api/usuarios';
    const method = editandoId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resultado = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: editandoId ? '¡Actualizado!' : '¡Creado!',
          text: resultado.mensaje,
          confirmButtonColor: '#28a745'
        });
        cerrarModal();
        fetchUsuarios();
      } else {
        Swal.fire({ icon: 'error', text: resultado.error || 'Error' });
      }
    } catch (error) {
      Swal.fire({ icon: 'error', text: 'No se pudo conectar con el servidor' });
    }
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEditandoId(null);
    setFormData({ nombre: '', apellidos: '', correo: '', password: '', rol_id: '' });
    setModulosSeleccionados([]);
  };

  return (
    <div className="usuarios-container">
      <div className="top-bar">
        <h2>Gestión de Usuarios</h2>
        
        <div className="search-container">
          <input 
            type="text" 
            placeholder="🔍 Buscar por nombre o correo..." 
            value={busqueda} 
            onChange={(e) => setBusqueda(e.target.value)} 
            className="search-input"
          />
          
          <button className="btn-modulo" onClick={() => setModalModuloAbierto(true)}>
            + Nuevo Módulo
          </button>

          <button className="btn-nuevo" onClick={() => { cerrarModal(); setModalAbierto(true); }}>
            + Nuevo Usuario
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="usuarios-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombres</th>
              <th>Apellidos</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.length > 0 ? (
              usuariosFiltrados.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.nombre}</td>
                  <td>{user.apellidos}</td>
                  <td>{user.correo}</td>
                  <td><strong>{user.rol}</strong></td>
                  <td>
                    <button onClick={() => handleEditar(user)} className="btn-editar">Editar</button>
                    <button onClick={() => handleEliminar(user.id)} className="btn-eliminar">Eliminar</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-results">No se encontraron resultados...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL DE USUARIOS ENVUELTO EN CREATEPORTAL --- */}
      {modalAbierto && createPortal(
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editandoId ? '✏️ Editar Usuario' : 'Crear Nuevo Usuario'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombres</label>
                  <input className="form-input" type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Apellidos</label>
                  <input className="form-input" type="text" name="apellidos" value={formData.apellidos} onChange={handleInputChange} required />
                </div>
              </div>
              
              <div className="form-group">
                <label>Correo Electrónico</label>
                <input className="form-input" type="email" name="correo" value={formData.correo} onChange={handleInputChange} required />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Contraseña {editandoId && '(Opcional)'}</label>
                  <input 
                    className="form-input" 
                    type="password" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleInputChange} 
                    required={!editandoId}
                    placeholder={editandoId ? 'Dejar en blanco para no cambiar' : ''}
                  />
                </div>
                <div className="form-group">
                  <label>Rol Principal</label>
                  <select className="form-input" name="rol_id" value={formData.rol_id} onChange={handleInputChange} required>
                    <option value="" disabled>Seleccione...</option>
                    {roles.map((rol) => (
                      <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Permisos de Módulos (¿A dónde puede entrar?)</label>
                <div className="checkbox-grid">
                  {modulosDisponibles.length > 0 ? (
                    modulosDisponibles.map(modulo => (
                      <label key={modulo.id} className="checkbox-item">
                        <input 
                          type="checkbox" 
                          value={modulo.id} 
                          checked={modulosSeleccionados.includes(String(modulo.id))}
                          onChange={handleCheckboxChange}
                        />
                        {modulo.nombre}
                      </label>
                    ))
                  ) : (
                    <span className="loading-text">Cargando módulos...</span>
                  )}
                </div>
              </div>

              <div className="btn-group">
                <button type="button" className="btn-cancelar" onClick={cerrarModal}>Cancelar</button>
                <button type="submit" className="btn-guardar">{editandoId ? 'Guardar Cambios' : 'Crear Usuario'}</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL DE MÓDULOS */}
      {modalModuloAbierto && (
        <ModalNuevoModulo 
          onClose={() => setModalModuloAbierto(false)}
          onModuloCreado={(nuevoModulo) => {
            Swal.fire({
              icon: 'success',
              title: '¡Módulo Creado!',
              text: `El módulo "${nuevoModulo.nombre}" se guardó correctamente.`,
              confirmButtonColor: '#28a745'
            });
            fetchModulos();
          }}
        />
      )}
    </div>
  );
};

export default Usuarios;