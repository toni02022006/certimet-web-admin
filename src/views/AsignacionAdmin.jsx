import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  obtenerPracticantes,
  obtenerGrupos,
  crearGrupo,
  agregarUsuarioAGrupo,
  quitarUsuarioDeGrupo,
  obtenerCategorias,
  obtenerEmpresas,
  crearTareaPendiente,
} from '../services/api';
import './AsignacionAdmin.css';

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
const AsignacionAdmin = () => {
  const { usuario } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('equipos');
  const [practicantes, setPracticantes] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [practicantesData, gruposData, categoriasData, empresasData] = await Promise.all([
        obtenerPracticantes(),
        obtenerGrupos(),
        obtenerCategorias(),
        obtenerEmpresas(),
      ]);
      setPracticantes(practicantesData);
      setGrupos(gruposData);
      setCategorias(categoriasData);
      setEmpresas(empresasData);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Error al cargar datos. Recarga la página.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleActualizar = () => cargarDatos();

  if (loading) return <div className="asignacion-loading">Cargando...</div>;
  if (error) return <div className="asignacion-error">{error}</div>;

  return (
    <div className="asignacion-admin">
      <h2>Panel de Asignación</h2>
      <div className="asignacion-tabs">
        <button
          className={activeTab === 'equipos' ? 'active' : ''}
          onClick={() => setActiveTab('equipos')}
        >
          Gestión de Equipos
        </button>
        <button
          className={activeTab === 'asignar' ? 'active' : ''}
          onClick={() => setActiveTab('asignar')}
        >
          Asignar Tarea
        </button>
      </div>

      <div className="asignacion-content">
        {activeTab === 'equipos' && (
          <GestionEquipos
            practicantes={practicantes}
            grupos={grupos}
            onActualizar={handleActualizar}
            usuario={usuario}
          />
        )}
        {activeTab === 'asignar' && (
          <AsignarTarea
            practicantes={practicantes}
            grupos={grupos}
            categorias={categorias}
            empresas={empresas}
          />
        )}
      </div>
    </div>
  );
};

// ============================================================
// SUBCOMPONENTE: GESTIÓN DE EQUIPOS
// ============================================================
const GestionEquipos = ({ practicantes, grupos, onActualizar, usuario }) => {
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoColor, setNuevoColor] = useState('#e2e8f0');
  const [grupoSeleccionadoId, setGrupoSeleccionadoId] = useState('');
  const [usuariosSeleccionados, setUsuariosSeleccionados] = useState([]);

  const handleCrearGrupo = async (e) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) {
      alert('El nombre es obligatorio');
      return;
    }
    try {
      await crearGrupo({
        nombre: nuevoNombre,
        color: nuevoColor,
        creador_id: usuario.id,
        posicion: 0,
      });
      setNuevoNombre('');
      setNuevoColor('#e2e8f0');
      onActualizar();
    } catch (error) {
      console.error(error);
      alert('Error al crear grupo');
    }
  };

  const handleAgregarUsuarios = async () => {
    if (!grupoSeleccionadoId || usuariosSeleccionados.length === 0) {
      alert('Selecciona un grupo y al menos un usuario');
      return;
    }
    try {
      for (const usuarioId of usuariosSeleccionados) {
        await agregarUsuarioAGrupo({
          grupo_id: parseInt(grupoSeleccionadoId),
          usuario_id: parseInt(usuarioId),
        });
      }
      setUsuariosSeleccionados([]);
      onActualizar();
    } catch (error) {
      console.error(error);
      alert('Error al agregar usuarios');
    }
  };

  const handleQuitarUsuario = async (grupoId, usuarioId) => {
    if (!window.confirm('¿Quitar este usuario del grupo?')) return;
    try {
      await quitarUsuarioDeGrupo({
        grupo_id: grupoId,
        usuario_id: usuarioId,
      });
      onActualizar();
    } catch (error) {
      console.error(error);
      alert('Error al quitar usuario');
    }
  };

  const grupoActual = grupos.find(g => g.id === parseInt(grupoSeleccionadoId));

  return (
    <div className="gestion-equipos">
      <div className="ge-crear-grupo">
        <h3>Crear nuevo grupo</h3>
        <form onSubmit={handleCrearGrupo}>
          <input
            type="text"
            placeholder="Nombre del grupo"
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            required
          />
          <input
            type="color"
            value={nuevoColor}
            onChange={(e) => setNuevoColor(e.target.value)}
            title="Color del grupo"
          />
          <button type="submit">Crear Grupo</button>
        </form>
      </div>

      <div className="ge-gestion-miembros">
        <h3>Gestionar miembros de un grupo</h3>
        <div className="ge-selectors">
          <select
            value={grupoSeleccionadoId}
            onChange={(e) => setGrupoSeleccionadoId(e.target.value)}
          >
            <option value="">Selecciona un grupo</option>
            {grupos.map(g => (
              <option key={g.id} value={g.id}>{g.nombre}</option>
            ))}
          </select>

          <select
            multiple
            value={usuariosSeleccionados}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, opt => opt.value);
              setUsuariosSeleccionados(selected);
            }}
            size={4}
          >
            {practicantes.length === 0 ? (
              <option disabled>No hay usuarios disponibles</option>
            ) : (
              practicantes.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nombre} {p.apellidos} ({p.rol?.nombre || 'Sin rol'})
                </option>
              ))
            )}
          </select>
          <button onClick={handleAgregarUsuarios}>Agregar al grupo</button>
        </div>

        {grupoActual && (
          <div className="ge-miembros-lista">
            <h4>Miembros de {grupoActual.nombre}</h4>
            {grupoActual.usuarios?.length === 0 ? (
              <p>No hay miembros en este grupo.</p>
            ) : (
              <ul>
                {grupoActual.usuarios?.map(({ usuario }) => (
                  <li key={usuario.id}>
                    {usuario.nombre} {usuario.apellidos}
                    <button
                      onClick={() => handleQuitarUsuario(grupoActual.id, usuario.id)}
                      className="btn-quitar"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="ge-lista-grupos">
        <h3>Todos los grupos</h3>
        {grupos.length === 0 ? (
          <p>No hay grupos creados.</p>
        ) : (
          <ul>
            {grupos.map(g => (
              <li key={g.id} style={{ borderLeftColor: g.color }}>
                <span className="ge-grupo-nombre">{g.nombre}</span>
                <span className="ge-grupo-miembros">
                  {g.usuarios?.length || 0} miembros
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

// ============================================================
// SUBCOMPONENTE: ASIGNAR TAREA
// ============================================================
const AsignarTarea = ({ practicantes, grupos, categorias, empresas }) => {
  const [filtroGrupo, setFiltroGrupo] = useState('');
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    categoria_tarea_id: '',
    empresa_id: '',
    asignado_id: '',
  });
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const usuariosFiltrados = filtroGrupo
    ? practicantes.filter(p => {
        const grupo = grupos.find(g => g.id === parseInt(filtroGrupo));
        return grupo?.usuarios?.some(u => u.usuario.id === p.id);
      })
    : practicantes;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titulo.trim()) {
      setMensaje('El título es obligatorio');
      return;
    }
    if (!form.asignado_id) {
      setMensaje('Selecciona un usuario');
      return;
    }
    setEnviando(true);
    setMensaje('');
    try {
      await crearTareaPendiente({
        titulo: form.titulo,
        descripcion: form.descripcion,
        empresa_id: parseInt(form.empresa_id),
        categoria_tarea_id: parseInt(form.categoria_tarea_id),
        asignado_id: parseInt(form.asignado_id),
      });
      setMensaje('✅ Tarea asignada correctamente');
      setForm({
        titulo: '',
        descripcion: '',
        categoria_tarea_id: '',
        empresa_id: '',
        asignado_id: '',
      });
    } catch (error) {
      console.error(error);
      setMensaje('❌ Error al asignar tarea');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="asignar-tarea">
      <form onSubmit={handleSubmit}>
        <div className="at-campo">
          <label>Título *</label>
          <input
            type="text"
            name="titulo"
            value={form.titulo}
            onChange={handleChange}
            required
          />
        </div>

        <div className="at-campo">
          <label>Descripción</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <div className="at-campo">
          <label>Categoría *</label>
          <select
            name="categoria_tarea_id"
            value={form.categoria_tarea_id}
            onChange={handleChange}
            required
          >
            <option value="">Seleccionar categoría</option>
            {categorias.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>

        <div className="at-campo">
          <label>Empresa *</label>
          <select
            name="empresa_id"
            value={form.empresa_id}
            onChange={handleChange}
            required
          >
            <option value="">Seleccionar empresa</option>
            {empresas.map(e => (
              <option key={e.id} value={e.id}>{e.nombre}</option>
            ))}
          </select>
        </div>

        <div className="at-campo">
          <label>Filtrar por grupo</label>
          <select
            value={filtroGrupo}
            onChange={(e) => setFiltroGrupo(e.target.value)}
          >
            <option value="">Todos los grupos</option>
            {grupos.map(g => (
              <option key={g.id} value={g.id}>{g.nombre}</option>
            ))}
          </select>
        </div>

        <div className="at-campo">
          <label>Asignado a *</label>
          <select
            name="asignado_id"
            value={form.asignado_id}
            onChange={handleChange}
            required
          >
            <option value="">Seleccionar usuario</option>
            {usuariosFiltrados.map(u => (
              <option key={u.id} value={u.id}>
                {u.nombre} {u.apellidos} ({u.rol?.nombre || 'Sin rol'})
              </option>
            ))}
          </select>
          {filtroGrupo && (
            <small>Mostrando solo usuarios del grupo seleccionado</small>
          )}
        </div>

        <button type="submit" disabled={enviando}>
          {enviando ? 'Asignando...' : 'Asignar Tarea'}
        </button>
        {mensaje && <p className="at-mensaje">{mensaje}</p>}
      </form>
    </div>
  );
};

export default AsignacionAdmin;