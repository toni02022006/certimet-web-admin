import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import ModalNuevoModulo from '../components/ModalNuevoModulo'; // <-- Asegúrate de que la ruta sea correcta

const Usuarios = () => {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalModuloAbierto, setModalModuloAbierto] = useState(false); // NUEVO: Estado para el modal de módulos
  
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [modulosDisponibles, setModulosDisponibles] = useState([]);
  
  // Estados para Buscar y Editar
  const [busqueda, setBusqueda] = useState('');
  const [editandoId, setEditandoId] = useState(null); // null = Crear, número = Editar

  const [formData, setFormData] = useState({ nombre: '', apellidos: '', correo: '', password: '', rol_id: '' });
  const [modulosSeleccionados, setModulosSeleccionados] = useState([]);

  const fetchUsuarios = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/usuarios');
      if (response.ok) setUsuarios(await response.json());
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/roles');
      if (response.ok) setRoles(await response.json());
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchModulos = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/modulos');
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

  // Filtrado dinámico para la tabla
  const usuariosFiltrados = usuarios.filter(u => 
    u.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    u.apellidos.toLowerCase().includes(busqueda.toLowerCase()) || 
    u.correo.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Abrir modal para Editar
  const handleEditar = (user) => {
    setEditandoId(user.id);
    setFormData({
      nombre: user.nombre,
      apellidos: user.apellidos,
      correo: user.correo,
      password: '', // Lo dejamos vacío por seguridad
      rol_id: user.rol_id
    });
    setModulosSeleccionados(user.modulos_ids || []);
    setModalAbierto(true);
  };

  // Eliminar Usuario
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
        const response = await fetch(`http://localhost:3000/api/usuarios/${id}`, { method: 'DELETE' });
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

  // GUARDAR (Sirve para Crear o Editar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.rol_id) return Swal.fire({ icon: 'warning', text: 'Selecciona un rol.' });
    if (modulosSeleccionados.length === 0) return Swal.fire({ icon: 'warning', text: 'Selecciona al menos un módulo.' });

    const payload = { ...formData, modulos_ids: modulosSeleccionados };
    const url = editandoId 
      ? `http://localhost:3000/api/usuarios/${editandoId}` 
      : 'http://localhost:3000/api/usuarios';
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

  const styles = {
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    searchContainer: { display: 'flex', alignItems: 'center', gap: '10px' },
    searchInput: { padding: '10px 15px', borderRadius: '20px', border: '1px solid #ccc', width: '250px', outline: 'none' },
    btnNuevo: { padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
    btnModulo: { padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }, // NUEVO ESTILO
    table: { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    th: { backgroundColor: '#f8f9fa', padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' },
    td: { padding: '12px', borderBottom: '1px solid #dee2e6' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 },
    modalContent: { backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '450px', maxHeight: '90vh', overflowY: 'auto' },
    formGroup: { display: 'flex', flexDirection: 'column', marginBottom: '15px' },
    input: { padding: '10px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '4px' },
    checkboxGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #e2e8f0' },
    checkboxItem: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' },
    btnGroup: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
    btnCancelar: { padding: '10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    btnGuardar: { padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }
  };

  return (
    <div>
      <div style={styles.topBar}>
        <h2>Gestión de Usuarios</h2>
        
        <div style={styles.searchContainer}>
          <input 
            type="text" 
            placeholder="🔍 Buscar por nombre o correo..." 
            value={busqueda} 
            onChange={(e) => setBusqueda(e.target.value)} 
            style={styles.searchInput}
          />
          
          {/* NUEVO: Botón para abrir el Modal de Módulos */}
          <button style={styles.btnModulo} onClick={() => setModalModuloAbierto(true)}>
            + Nuevo Módulo
          </button>

          <button style={styles.btnNuevo} onClick={() => { cerrarModal(); setModalAbierto(true); }}>
            + Nuevo Usuario
          </button>
        </div>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Nombres</th>
            <th style={styles.th}>Apellidos</th>
            <th style={styles.th}>Correo</th>
            <th style={styles.th}>Rol</th>
            <th style={styles.th}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuariosFiltrados.length > 0 ? (
            usuariosFiltrados.map((user) => (
              <tr key={user.id}>
                <td style={styles.td}>{user.id}</td>
                <td style={styles.td}>{user.nombre}</td>
                <td style={styles.td}>{user.apellidos}</td>
                <td style={styles.td}>{user.correo}</td>
                <td style={styles.td}><strong>{user.rol}</strong></td>
                <td style={styles.td}>
                  <button onClick={() => handleEditar(user)} style={{marginRight: '10px', color: '#007bff', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold'}}>Editar</button>
                  <button onClick={() => handleEliminar(user.id)} style={{color: '#dc3545', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold'}}>Eliminar</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{...styles.td, textAlign: 'center'}}>No se encontraron resultados...</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* MODAL DE USUARIOS */}
      {modalAbierto && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3>{editandoId ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{...styles.formGroup, flex: 1}}>
                  <label>Nombres</label>
                  <input style={styles.input} type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required />
                </div>
                <div style={{...styles.formGroup, flex: 1}}>
                  <label>Apellidos</label>
                  <input style={styles.input} type="text" name="apellidos" value={formData.apellidos} onChange={handleInputChange} required />
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <label>Correo Electrónico</label>
                <input style={styles.input} type="email" name="correo" value={formData.correo} onChange={handleInputChange} required />
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{...styles.formGroup, flex: 1}}>
                  <label>Contraseña {editandoId && '(Opcional)'}</label>
                  <input 
                    style={styles.input} 
                    type="password" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleInputChange} 
                    required={!editandoId} // Solo es obligatoria al crear
                    placeholder={editandoId ? 'Dejar en blanco para no cambiar' : ''}
                  />
                </div>
                <div style={{...styles.formGroup, flex: 1}}>
                  <label>Rol Principal</label>
                  <select style={styles.input} name="rol_id" value={formData.rol_id} onChange={handleInputChange} required>
                    <option value="" disabled>Seleccione...</option>
                    {roles.map((rol) => (
                      <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label>Permisos de Módulos (¿A dónde puede entrar?)</label>
                <div style={styles.checkboxGrid}>
                  {modulosDisponibles.length > 0 ? (
                    modulosDisponibles.map(modulo => (
                      <label key={modulo.id} style={styles.checkboxItem}>
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
                    <span style={{ fontSize: '13px', color: '#666' }}>Cargando módulos...</span>
                  )}
                </div>
              </div>

              <div style={styles.btnGroup}>
                <button type="button" style={styles.btnCancelar} onClick={cerrarModal}>Cancelar</button>
                <button type="submit" style={styles.btnGuardar}>{editandoId ? 'Guardar Cambios' : 'Crear Usuario'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NUEVO: MODAL DE MÓDULOS INYECTADO AQUÍ */}
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
            // Recargamos la lista de módulos para que aparezca al instante en los checkboxes
            fetchModulos();
          }}
        />
      )}

    </div>
  );
};

export default Usuarios;