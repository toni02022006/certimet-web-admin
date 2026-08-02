import React, { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom'; // 🔥 1. IMPORTAMOS CREATEPORTAL
import { AuthContext } from '../../context/AuthContext';
import api, {
  obtenerPracticantes,
  obtenerEmpresas,
  obtenerCategorias,
} from '../../services/api';

const IconClose = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const EventoModal = ({ visible, onClose, onGuardar, evento, fechaInicial }) => {
  const { usuario } = useContext(AuthContext);
  const rolUsuario = usuario?.rol?.toLowerCase() || usuario?.role?.toLowerCase() || '';
  const esAdmin = rolUsuario === 'admin' || rolUsuario === 'superadmin';

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    todo_el_dia: false,
    categoria: '',
    alcance: '',
    estado: 'PENDIENTE',
    prioridad: 'Media',
    color: '#4a6cf7',
    visibilidad: 'PUBLICO',
  });

  const [asignarTarea, setAsignarTarea] = useState(false);
  const [empresaId, setEmpresaId] = useState('');
  const [categoriaTareaId, setCategoriaTareaId] = useState('');
  const [asignadoTareaId, setAsignadoTareaId] = useState('');
  const [practicantes, setPracticantes] = useState([]);
  const [empresasTarea, setEmpresasTarea] = useState([]);
  const [categoriasTarea, setCategoriasTarea] = useState([]);
  const [cargandoAsignacion, setCargandoAsignacion] = useState(false);

  const [categorias, setCategorias] = useState([]);
  const [alcances, setAlcances] = useState([]);
  const [estados, setEstados] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [cargandoOpciones, setCargandoOpciones] = useState(false);

  useEffect(() => {
    const fetchOpciones = async () => {
      setCargandoOpciones(true);
      try {
        const [resCats, resAlc, resEst, resPri] = await Promise.all([
          api.get('/calendario/categorias').then(r => r.data),
          api.get('/calendario/alcances').then(r => r.data),
          api.get('/calendario/estados').then(r => r.data),
          api.get('/calendario/prioridades').then(r => r.data),
        ]);
        setCategorias(resCats);
        setAlcances(resAlc);
        setEstados(resEst);
        setPrioridades(resPri);
      } catch (error) {
        console.error('Error cargando opciones del modal:', error);
        setCategorias(['TAREA', 'ACTIVIDAD', 'REUNION', 'RECORDATORIO', 'CUMPLEANOS', 'VACACIONES', 'FERIADO', 'FECHA_IMPORTANTE', 'OTRO']);
        setAlcances(['Nacional', 'Internacional', 'Local', 'Regional']);
        setEstados(['PENDIENTE', 'EN_CURSO', 'COMPLETADO', 'CANCELADO']);
        setPrioridades(['Baja', 'Media', 'Alta', 'Muy Alta']);
      } finally {
        setCargandoOpciones(false);
      }
    };
    fetchOpciones();
  }, []);

  useEffect(() => {
    if (esAdmin && visible) {
      const fetchAsignacionData = async () => {
        setCargandoAsignacion(true);
        try {
          const [practicantesData, empresasData, categoriasData] = await Promise.all([
            obtenerPracticantes(),
            obtenerEmpresas(),
            obtenerCategorias(),
          ]);
          setPracticantes(practicantesData || []);
          setEmpresasTarea(empresasData || []);
          setCategoriasTarea(categoriasData || []);
        } catch (error) {
          console.error('Error cargando datos de asignación:', error);
        } finally {
          setCargandoAsignacion(false);
        }
      };
      fetchAsignacionData();
    }
  }, [esAdmin, visible]);

  useEffect(() => {
    if (!visible) return;
    if (evento) {
      setForm({
        titulo: evento.titulo || '',
        descripcion: evento.descripcion || '',
        fecha_inicio: evento.fecha_inicio ? evento.fecha_inicio.slice(0, 10) : '',
        fecha_fin: evento.fecha_fin ? evento.fecha_fin.slice(0, 10) : '',
        todo_el_dia: evento.es_todo_el_dia || evento.todo_el_dia || false,
        categoria: evento.tipo_evento || '',
        alcance: evento.alcance || '',
        estado: evento.estado || 'PENDIENTE',
        prioridad: evento.prioridad || 'Media',
        color: evento.color_etiqueta || '#4a6cf7',
        visibilidad: evento.visibilidad || 'PUBLICO',
      });
      setAsignarTarea(!!evento.tarea_id);
      setEmpresaId(evento.tarea?.empresa_id || '');
      setCategoriaTareaId(evento.tarea?.categoria_tarea_id || '');
      setAsignadoTareaId(evento.tarea?.asignado_id || '');
    } else {
      const fechaStr = fechaInicial ? fechaInicial.toISOString().slice(0, 10) : '';
      setForm({
        titulo: '',
        descripcion: '',
        fecha_inicio: fechaStr,
        fecha_fin: fechaStr,
        todo_el_dia: false,
        categoria: '',
        alcance: '',
        estado: 'PENDIENTE',
        prioridad: 'Media',
        color: '#4a6cf7',
        visibilidad: 'PUBLICO',
      });
      setAsignarTarea(false);
      setEmpresaId('');
      setCategoriaTareaId('');
      setAsignadoTareaId('');
    }
  }, [evento, fechaInicial, visible]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.titulo.trim()) {
      alert('El título es obligatorio');
      return;
    }
    if (!form.fecha_inicio) {
      alert('La fecha de inicio es obligatoria');
      return;
    }

    if (esAdmin && asignarTarea) {
      if (!empresaId || !categoriaTareaId || !asignadoTareaId) {
        alert('Completa todos los campos para asignar la tarea.');
        return;
      }
    }

    const fechaInicioConZona = form.fecha_inicio + 'T00:00:00-05:00';
    const fechaFinConZona = form.fecha_fin ? form.fecha_fin + 'T00:00:00-05:00' : null;
    const esPersonal = form.visibilidad === 'PRIVADO';

    const datosEnvio = {
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim(),
      fecha_inicio: fechaInicioConZona,
      fecha_fin: fechaFinConZona,
      es_todo_el_dia: form.todo_el_dia,
      tipo_evento: form.categoria || 'OTRO',
      alcance: form.alcance || null,
      estado: form.estado || 'PENDIENTE',
      prioridad: form.prioridad || 'Media',
      color_etiqueta: form.color || '#4a6cf7',
      es_personal: esPersonal,
      visibilidad: form.visibilidad,
    };

    if (esAdmin && asignarTarea) {
      datosEnvio.asignar_tarea = true;
      datosEnvio.es_personal = false;
      datosEnvio.empresa_id = empresaId;
      datosEnvio.categoria_tarea_id = categoriaTareaId;
      datosEnvio.asignado_tarea_id = asignadoTareaId;
      datosEnvio.asignado_a_id = asignadoTareaId;
    }

    onGuardar(datosEnvio);
  };

  if (!visible) return null;
  const esEdicion = !!evento;

  // 🔥 2. ENVUELTO EN createPortal PARA SALTAR CUALQUIER RESTRICCIÓN DE CSS DEL PADRE
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-titulo">{esEdicion ? '✏️ Editar Evento' : '📅 Nuevo Evento'}</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <IconClose />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-field">
            <label>Título *</label>
            <input type="text" name="titulo" value={form.titulo} onChange={handleChange} required />
          </div>
          <div className="modal-field">
            <label>Descripción</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows="3" />
          </div>
          <div className="modal-row">
            <div className="modal-field">
              <label>Fecha inicio *</label>
              <input type="date" name="fecha_inicio" value={form.fecha_inicio} onChange={handleChange} required />
            </div>
            <div className="modal-field">
              <label>Fecha fin</label>
              <input type="date" name="fecha_fin" value={form.fecha_fin} onChange={handleChange} />
            </div>
          </div>
          <div className="modal-field checkbox-field">
            <label><input type="checkbox" name="todo_el_dia" checked={form.todo_el_dia} onChange={handleChange} /> Todo el día</label>
          </div>

          <div className="modal-field">
            <label>Visibilidad</label>
            <select name="visibilidad" value={form.visibilidad} onChange={handleChange}>
              <option value="PUBLICO">👥 Público (Visible para todos)</option>
              <option value="PRIVADO">🔒 Privado (Solo visible para mí)</option>
            </select>
          </div>

          {esAdmin && (
            <div className="modal-field checkbox-field" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '15px', marginTop: '15px' }}>
              <label style={{ fontWeight: 'bold' }}>
                <input type="checkbox" checked={asignarTarea} onChange={(e) => setAsignarTarea(e.target.checked)} />
                Asignar tarea a un usuario
              </label>
            </div>
          )}

          {asignarTarea && esAdmin && (
            <div className="seccion-tarea-detalles" style={{ backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '16px', marginBottom: '15px' }}>
              {cargandoAsignacion ? (
                <p style={{ textAlign: 'center', color: '#64748b' }}>Cargando opciones...</p>
              ) : (
                <>
                  <div className="modal-row">
                    <div className="modal-field">
                      <label>Empresa *</label>
                      <select value={empresaId} onChange={(e) => setEmpresaId(e.target.value)} required>
                        <option value="">Seleccionar</option>
                        {empresasTarea.map(emp => <option key={emp.id} value={emp.id}>{emp.nombre}</option>)}
                      </select>
                    </div>
                    <div className="modal-field">
                      <label>Categoría Tarea *</label>
                      <select value={categoriaTareaId} onChange={(e) => setCategoriaTareaId(e.target.value)} required>
                        <option value="">Seleccionar</option>
                        {categoriasTarea.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="modal-field" style={{ marginTop: '10px' }}>
                    <label>Asignar a *</label>
                    <select value={asignadoTareaId} onChange={(e) => setAsignadoTareaId(e.target.value)} required>
                      <option value="">Seleccionar usuario</option>
                      {practicantes.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellidos}</option>)}
                    </select>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="modal-row">
            <div className="modal-field">
              <label>Categoría del Calendario</label>
              <select name="categoria" value={form.categoria} onChange={handleChange} disabled={cargandoOpciones}>
                <option value="">Seleccionar</option>
                {categorias.map(cat => <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="modal-field">
              <label>Alcance</label>
              <select name="alcance" value={form.alcance} onChange={handleChange} disabled={cargandoOpciones}>
                <option value="">Seleccionar</option>
                {alcances.map(alc => <option key={alc} value={alc}>{alc}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-row">
            <div className="modal-field">
              <label>Estado</label>
              <select name="estado" value={form.estado} onChange={handleChange} disabled={cargandoOpciones}>
                {estados.map(est => <option key={est} value={est}>{est.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="modal-field">
              <label>Prioridad</label>
              <select name="prioridad" value={form.prioridad} onChange={handleChange} disabled={cargandoOpciones}>
                {prioridades.map(pri => <option key={pri} value={pri}>{pri}</option>)}
              </select>
            </div>
          </div>

          <div className="modal-field color-field">
            <label>Color</label>
            <div className="color-picker-wrapper">
              <input type="color" name="color" value={form.color} onChange={handleChange} />
              <span className="color-hex">{form.color}</span>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancelar" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-guardar">{esEdicion ? 'Actualizar' : 'Crear'}</button>
          </div>
        </form>
      </div>
    </div>,
    document.body // 🔥 3. RENDERIZAMOS EL MODAL DIRECTAMENTE AL FINAL DEL BODY
  );
};

export default EventoModal;