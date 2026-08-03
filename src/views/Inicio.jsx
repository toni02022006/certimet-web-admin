import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import Swal from 'sweetalert2';
import './Inicio.css';
import ExportarReportes from '../components/seguimiento/ExportarReportes';

// ==============================
// ICONOS
// ==============================
const IconPlay = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
  </svg>
);

const IconPause = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);

const IconStop = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" fill="currentColor" />
  </svg>
);

const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconResume = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
  </svg>
);

const IconEdit = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const IconDelete = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconFilter = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </svg>
);

const Inicio = () => {
  const { usuario } = useContext(AuthContext);
  
  // ==============================
  // ESTADOS DEL FORMULARIO
  // ==============================
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [empresaId, setEmpresaId] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [empresas, setEmpresas] = useState([]);
  const [categorias, setCategorias] = useState([]);

  // ==============================
  // ESTADOS DEL CRONÓMETRO Y TAREA ACTIVA
  // ==============================
  const [segundos, setSegundos] = useState(0);
  const [activo, setActivo] = useState(false);
  const [pausado, setPausado] = useState(false);
  const [tareaActualId, setTareaActualId] = useState(null);
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const intervalRef = useRef(null);

  // ==============================
  // LISTA DE TAREAS (HISTORIAL) Y FILTROS
  // ==============================
  const [tareas, setTareas] = useState([]);
  const [tareasFiltradas, setTareasFiltradas] = useState([]);
  const [cargando, setCargando] = useState(false);
  
  // Filtros
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
  const [filtroFechaFin, setFiltroFechaFin] = useState('');

  // ==============================
  // CARGAR EMPRESAS Y CATEGORÍAS
  // ==============================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resEmpresas, resCategorias] = await Promise.all([
          api.get('/seguimiento/empresas'),
          api.get('/seguimiento/categorias')
        ]);
        setEmpresas(Array.isArray(resEmpresas.data) ? resEmpresas.data : []);
        setCategorias(Array.isArray(resCategorias.data) ? resCategorias.data : []);
      } catch (error) {
        console.error('Error cargando empresas/categorías:', error);
      }
    };
    fetchData();
  }, []);

  // ==============================
  // CARGAR TAREAS DEL USUARIO (HISTORIAL)
  // ==============================
  const cargarTareas = async () => {
    if (!usuario?.id) return;
    setCargando(true);
    try {
      const res = await api.get(`/seguimiento/usuario/${usuario.id}/tareas`);
      const lista = Array.isArray(res.data) ? res.data : [];
      setTareas(lista);
      aplicarFiltros(lista);
    } catch (error) {
      console.error('Error cargando tareas:', error);
    } finally {
      setCargando(false);
    }
  };

  // ==============================
  // APLICAR FILTROS A LA LISTA DE TAREAS
  // ==============================
  const aplicarFiltros = (listaTareas) => {
    let filtradas = [...listaTareas];

    // Filtro por texto (título)
    if (filtroTexto.trim()) {
      const texto = filtroTexto.trim().toLowerCase();
      filtradas = filtradas.filter(t => 
        t.titulo.toLowerCase().includes(texto) ||
        (t.descripcion && t.descripcion.toLowerCase().includes(texto))
      );
    }

    // Filtro por estado
    if (filtroEstado !== 'todos') {
      filtradas = filtradas.filter(t => t.estado === filtroEstado);
    }

    // Filtro por fecha de creación
    if (filtroFechaInicio) {
      const inicio = new Date(filtroFechaInicio);
      inicio.setHours(0,0,0,0);
      filtradas = filtradas.filter(t => new Date(t.fecha_creacion) >= inicio);
    }
    if (filtroFechaFin) {
      const fin = new Date(filtroFechaFin);
      fin.setHours(23,59,59,999);
      filtradas = filtradas.filter(t => new Date(t.fecha_creacion) <= fin);
    }

    setTareasFiltradas(filtradas);
  };

  // Ejecutar filtros cuando cambien los criterios
  useEffect(() => {
    aplicarFiltros(tareas);
  }, [filtroTexto, filtroEstado, filtroFechaInicio, filtroFechaFin, tareas]);

  // ==============================
  // CARGAR ESTADO ACTUAL (tarea activa)
  // ==============================
  const cargarEstado = async () => {
    if (!usuario?.id) return;
    try {
      const res = await api.get(`/seguimiento/estado?usuario_id=${usuario.id}`);
      const tareasActivas = Array.isArray(res.data) ? res.data : [];
      const enProceso = tareasActivas.find(t => t.estado === 'EN_PROCESO');
      const enPausa = tareasActivas.find(t => t.estado === 'PAUSADA');

      if (enProceso) {
        setTitulo(enProceso.titulo);
        setDescripcion(enProceso.descripcion || '');
        setEmpresaId(String(enProceso.empresa_id));
        setCategoriaId(String(enProceso.categoria_tarea_id));
        setTareaActualId(enProceso.id);
        setSegundos(Math.floor(enProceso.tiempoTotalMs / 1000) || 0);
        setActivo(true);
        setPausado(false);
        setMostrarNueva(false);
      } else if (enPausa) {
        setTitulo(enPausa.titulo);
        setDescripcion(enPausa.descripcion || '');
        setEmpresaId(String(enPausa.empresa_id));
        setCategoriaId(String(enPausa.categoria_tarea_id));
        setTareaActualId(enPausa.id);
        setSegundos(Math.floor(enPausa.tiempoTotalMs / 1000) || 0);
        setActivo(false);
        setPausado(true);
        setMostrarNueva(true);
      } else {
        // No hay tarea activa: mostrar formulario vacío (como "Nueva tarea")
        resetFormulario();
      }
    } catch (error) {
      console.error('Error cargando estado:', error);
    }
  };

  useEffect(() => {
    if (usuario?.id) {
      cargarEstado();
      cargarTareas();
    }
  }, [usuario]);

  // ==============================
  // CRONÓMETRO
  // ==============================
  useEffect(() => {
    if (activo && !pausado) {
      intervalRef.current = setInterval(() => {
        setSegundos(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [activo, pausado]);

  // ==============================
  // FORMATEAR TIEMPO
  // ==============================
  const formatearTiempo = (s) => {
    const h = String(Math.floor(s / 3600)).padStart(2, '0');
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const seg = String(s % 60).padStart(2, '0');
    return `${h}:${m}:${seg}`;
  };

  // ==============================
  // RESET FORMULARIO (vacío, como "Nueva tarea")
  // ==============================
  const resetFormulario = () => {
    setTitulo('');
    setDescripcion('');
    setEmpresaId('');
    setCategoriaId('');
    setSegundos(0);
    setActivo(false);
    setPausado(false);
    setTareaActualId(null);
    setMostrarNueva(false);
    clearInterval(intervalRef.current);
  };

  // ==============================
  // ACCIONES DESDE EL FORMULARIO
  // ==============================

  // Iniciar nueva tarea (crear y empezar)
  const handleIniciar = async () => {
    if (!titulo.trim() || !empresaId || !categoriaId) {
      Swal.fire('Atención', 'Completa todos los campos obligatorios', 'warning');
      return;
    }

    try {
      const payload = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        empresa_id: parseInt(empresaId),
        categoria_tarea_id: parseInt(categoriaId),
        asignado_id: usuario.id,
        creador_id: usuario.id,
      };
      const res = await api.post('/seguimiento/tarea/iniciar', payload);
      setTareaActualId(res.data.id);
      setActivo(true);
      setPausado(false);
      setMostrarNueva(false);
      cargarTareas();
    } catch (error) {
      console.error('Error al iniciar:', error);
      Swal.fire('Error', 'No se pudo iniciar la tarea', 'error');
    }
  };

  // Pausar tarea actual
  const handlePausar = async () => {
    if (!tareaActualId) return;
    try {
      await api.post('/seguimiento/tarea/pausar', {
        tareaId: tareaActualId,
        motivo: 'Pausa manual',
        usuario_id: usuario.id
      });
      setActivo(false);
      setPausado(true);
      setMostrarNueva(true);
      cargarTareas();
      cargarEstado();
    } catch (error) {
      console.error('Error al pausar:', error);
      Swal.fire('Error', 'No se pudo pausar la tarea', 'error');
    }
  };

  // Iniciar nueva tarea (después de pausar) - limpia el formulario
  const handleIniciarNueva = () => {
    resetFormulario();
    cargarTareas();
  };

  // Finalizar tarea actual
  const handleFinalizar = async () => {
    if (!tareaActualId) return;
    const confirm = await Swal.fire({
      title: '¿Finalizar tarea?',
      text: 'Esta acción no se puede deshacer',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#dc3545',
      confirmButtonText: 'Sí, finalizar',
    });
    if (!confirm.isConfirmed) return;

    try {
      await api.post('/seguimiento/tarea/finalizar', {
        tareaId: tareaActualId,
        usuario_id: usuario.id
      });
      resetFormulario();
      cargarTareas();
      cargarEstado();
      Swal.fire('Finalizada', 'La tarea ha sido finalizada', 'success');
    } catch (error) {
      console.error('Error al finalizar:', error);
      Swal.fire('Error', 'No se pudo finalizar la tarea', 'error');
    }
  };

  // ==============================
  // HELPER PARA FORMATEAR FECHAS (datetime-local)
  // ==============================
  const formatDateTimeLocal = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  // ==============================
  // ACCIONES DESDE LA TABLA
  // ==============================

  // Reanudar tarea desde la tabla
  const handleReanudar = async (tarea) => {
    try {
      await api.post('/seguimiento/tarea/reanudar', {
        tareaId: tarea.id,
        usuario_id: usuario.id
      });
      cargarEstado();
      cargarTareas();
      Swal.fire('Reanudada', 'La tarea se ha reanudado', 'success');
    } catch (error) {
      console.error('Error al reanudar:', error);
      Swal.fire('Error', 'No se pudo reanudar la tarea', 'error');
    }
  };

  // Iniciar tarea pendiente desde la tabla
  const handleIniciarPendiente = async (tareaId) => {
    if (activo || pausado) {
      Swal.fire('Atención', 'Ya tienes una tarea activa. Finaliza o pausa antes de iniciar otra.', 'warning');
      return;
    }

    try {
      await api.post('/kanban/tareas/iniciar', {
        tareaId: tareaId,
        usuario_id: usuario.id
      });
      await cargarEstado();
      await cargarTareas();
      Swal.fire('Iniciada', 'Tarea iniciada correctamente', 'success');
    } catch (error) {
      console.error('Error al iniciar tarea pendiente:', error);
      Swal.fire('Error', 'No se pudo iniciar la tarea', 'error');
    }
  };

  // ==============================
  // Editar tarea (NUEVA VERSIÓN)
  // ==============================
  const handleEditar = async (tarea) => {
    const rolUsuario = usuario?.rol?.toLowerCase() || '';
    const esAdmin = rolUsuario === 'admin' || rolUsuario === 'superadmin';

    // Generamos las opciones dinámicas
    const empresasOptions = empresas.map(emp => 
      `<option value="${emp.id}" ${emp.id === tarea.empresa_id ? 'selected' : ''}>${emp.nombre}</option>`
    ).join('');

    const categoriasOptions = categorias.map(cat => 
      `<option value="${cat.id}" ${cat.id === tarea.categoria_tarea_id ? 'selected' : ''}>${cat.nombre}</option>`
    ).join('');

    // HTML base (Campos comunes)
    let htmlForm = `
      <div style="display: flex; flex-direction: column; gap: 12px; text-align: left;">
        <div>
          <label style="font-size: 13px; font-weight: 600; color: #475569;">Título</label>
          <input id="swal-titulo" class="swal2-input" value="${tarea.titulo}" style="margin: 4px 0 0 0; width: 100%; height: 40px; font-size: 14px;">
        </div>
        
        <div>
          <label style="font-size: 13px; font-weight: 600; color: #475569;">Descripción</label>
          <input id="swal-desc" class="swal2-input" value="${tarea.descripcion || ''}" style="margin: 4px 0 0 0; width: 100%; height: 40px; font-size: 14px;">
        </div>

        <div>
          <label style="font-size: 13px; font-weight: 600; color: #475569;">Empresa</label>
          <select id="swal-empresa" class="swal2-select" style="margin: 4px 0 0 0; width: 100%; font-size: 14px; padding: 0 10px;">
            ${empresasOptions}
          </select>
        </div>

        <div>
          <label style="font-size: 13px; font-weight: 600; color: #475569;">Categoría</label>
          <select id="swal-categoria" class="swal2-select" style="margin: 4px 0 0 0; width: 100%; font-size: 14px; padding: 0 10px;">
            ${categoriasOptions}
          </select>
        </div>
    `;

    // Lógica exclusiva de Administradores
    if (esAdmin) {
      const estados = ['PENDIENTE', 'EN_PROCESO', 'PAUSADA', 'FINALIZADA'];
      const estadosOptions = estados.map(est => 
        `<option value="${est}" ${est === tarea.estado ? 'selected' : ''}>${est.replace('_', ' ')}</option>`
      ).join('');

      // Buscar la fecha de fin real analizando intervalos si es necesario
      let fechaFinStr = tarea.fecha_finalizacion;
      if (!fechaFinStr && tarea.estado === 'FINALIZADA' && tarea.intervalos?.length) {
        const intsFin = tarea.intervalos.filter(i => i.fecha_fin);
        if (intsFin.length > 0) fechaFinStr = intsFin[intsFin.length - 1].fecha_fin;
      }

      const inicioVal = formatDateTimeLocal(tarea.fecha_creacion);
      const finVal = formatDateTimeLocal(fechaFinStr);

      htmlForm += `
        <div style="margin-top: 8px; padding-top: 12px; border-top: 1px dashed #cbd5e0;">
          <label style="font-size: 13px; font-weight: 600; color: #0284c7;">Estado (Solo Admin)</label>
          <select id="swal-estado" class="swal2-select" style="margin: 4px 0 0 0; width: 100%; font-size: 14px; padding: 0 10px; border-color: #0284c7;">
            ${estadosOptions}
          </select>
        </div>
        <div style="display: flex; gap: 10px; margin-top: 8px;">
          <div style="flex: 1;">
            <label style="font-size: 13px; font-weight: 600; color: #0284c7;">Inicio (Admin)</label>
            <input id="swal-inicio" type="datetime-local" class="swal2-input" value="${inicioVal}" style="margin: 4px 0 0 0; width: 100%; height: 35px; font-size: 13px; padding: 0 5px; border-color: #0284c7;">
          </div>
          <div style="flex: 1;">
            <label style="font-size: 13px; font-weight: 600; color: #0284c7;">Fin (Admin)</label>
            <input id="swal-fin" type="datetime-local" class="swal2-input" value="${finVal}" style="margin: 4px 0 0 0; width: 100%; height: 35px; font-size: 13px; padding: 0 5px; border-color: #0284c7;">
          </div>
        </div>
      `;
    }

    htmlForm += `</div>`;

    // Lanzamos el modal
    const { value: formValues } = await Swal.fire({
      title: 'Editar Tarea',
      html: htmlForm,
      showCancelButton: true,
      confirmButtonText: 'Guardar Cambios',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#1a5276',
      focusConfirm: false,
      preConfirm: () => {
        const titulo = document.getElementById('swal-titulo').value.trim();
        const descripcion = document.getElementById('swal-desc').value.trim();
        const empresa_id = document.getElementById('swal-empresa').value;
        const categoria_id = document.getElementById('swal-categoria').value;
        
        let estado = tarea.estado;
        let fecha_inicio = null;
        let fecha_fin = null;
        
        if (esAdmin) {
          estado = document.getElementById('swal-estado').value;
          fecha_inicio = document.getElementById('swal-inicio').value;
          fecha_fin = document.getElementById('swal-fin').value;
        }

        if (!titulo) {
          Swal.showValidationMessage('El título es obligatorio');
          return false;
        }

        return { 
          titulo, 
          descripcion, 
          empresa_id: parseInt(empresa_id), 
          categoria_tarea_id: parseInt(categoria_id), 
          estado,
          fecha_inicio: fecha_inicio || undefined,
          fecha_fin: fecha_fin || undefined
        };
      }
    });

    if (!formValues) return; 

    // Petición al Backend
    try {
      await api.put(`/seguimiento/tarea/${tarea.id}`, formValues);
      cargarTareas();
      if (tareaActualId === tarea.id) {
        cargarEstado(); 
      }
      Swal.fire('Actualizada', 'Tarea actualizada correctamente', 'success');
    } catch (error) {
      console.error('Error al editar:', error);
      Swal.fire('Error', 'No se pudo editar la tarea', 'error');
    }
  };

  // Eliminar tarea (solo finalizada)
  const handleEliminar = async (id) => {
    const confirm = await Swal.fire({
      title: '¿Eliminar tarea?',
      text: 'Esta acción es permanente',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
    });
    if (!confirm.isConfirmed) return;

    try {
      await api.delete(`/seguimiento/tarea/${id}`);
      cargarTareas();
      Swal.fire('Eliminada', 'Tarea eliminada correctamente', 'success');
    } catch (error) {
      console.error('Error al eliminar:', error);
      Swal.fire('Error', 'No se pudo eliminar la tarea', 'error');
    }
  };

  // ==============================
  // RENDERIZADO
  // ==============================

  const bloqueado = activo && !pausado;
  const tieneTareaActiva = activo || pausado;

  return (
    <div className="inicio-container">
      <h2 className="inicio-title">Mis Tareas</h2>
      <p className="inicio-subtitle">Gestiona tu tarea activa o inicia una nueva</p>

      {/* ========== FORMULARIO EN UNA SOLA FILA ========== */}
      <div className="tareas-form-card">
        <div className="tareas-form-row">
          <div className="tareas-form-group">
            <label>Título</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              disabled={bloqueado}
              placeholder="Ej: Revisar cotización"
            />
          </div>
          <div className="tareas-form-group">
            <label>Descripción</label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              disabled={bloqueado}
              placeholder="Detalles opcionales"
            />
          </div>
          <div className="tareas-form-group">
            <label>Empresa</label>
            <select
              value={empresaId}
              onChange={(e) => setEmpresaId(e.target.value)}
              disabled={bloqueado}
            >
              <option value="">Seleccionar</option>
              {empresas.map(emp => (
                <option key={emp.id} value={String(emp.id)}>{emp.nombre}</option>
              ))}
            </select>
          </div>
          <div className="tareas-form-group">
            <label>Categoría</label>
            <select
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              disabled={bloqueado}
            >
              <option value="">Seleccionar</option>
              {categorias.map(cat => (
                <option key={cat.id} value={String(cat.id)}>{cat.nombre}</option>
              ))}
            </select>
          </div>

          <div className="tareas-cronometro">
            <span className="tareas-tiempo">{formatearTiempo(segundos)}</span>
          </div>

          <div className="tareas-botones">
            {!activo && !pausado && (
              <button className="btn-iniciar" onClick={handleIniciar}>
                <IconPlay /> Iniciar
              </button>
            )}
            {activo && !pausado && (
              <>
                <button className="btn-pausar" onClick={handlePausar}>
                  <IconPause /> Pausar
                </button>
                <button className="btn-finalizar" onClick={handleFinalizar}>
                  <IconStop /> Finalizar
                </button>
              </>
            )}
            {pausado && mostrarNueva && (
              <button className="btn-nueva" onClick={handleIniciarNueva}>
                <IconPlus /> Nueva tarea
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========== FILTROS DEL HISTORIAL ========== */}
      <div className="tareas-filtros-card">
        <div className="tareas-filtros-row">
          <div className="tareas-filtro-group">
            <label>Buscar</label>
            <div className="tareas-filtro-buscar">
              <IconSearch />
              <input
                type="text"
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
                placeholder="Buscar por título o descripción..."
              />
            </div>
          </div>
          <div className="tareas-filtro-group">
            <label>Estado</label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="EN_PROCESO">En curso</option>
              <option value="PAUSADA">Pausada</option>
              <option value="FINALIZADA">Finalizada</option>
            </select>
          </div>
          <div className="tareas-filtro-group">
            <label>Desde</label>
            <input
              type="date"
              value={filtroFechaInicio}
              onChange={(e) => setFiltroFechaInicio(e.target.value)}
            />
          </div>
          <div className="tareas-filtro-group">
            <label>Hasta</label>
            <input
              type="date"
              value={filtroFechaFin}
              onChange={(e) => setFiltroFechaFin(e.target.value)}
            />
          </div>
          <button className="btn-limpiar-filtros" onClick={() => {
            setFiltroTexto('');
            setFiltroEstado('todos');
            setFiltroFechaInicio('');
            setFiltroFechaFin('');
          }}>
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* ========== TABLA DE HISTORIAL ========== */}
      <div className="tareas-tabla-wrapper">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0 }}>Historial de Tareas</h3>
          
          {/* Aquí insertamos el componente de exportación */}
          <ExportarReportes tareas={tareas} usuario={usuario} />
        </div>
        {cargando ? (
          <p className="tareas-vacio">Cargando...</p>
        ) : tareasFiltradas.length === 0 ? (
          <p className="tareas-vacio">No hay tareas con los filtros seleccionados.</p>
        ) : (
          <table className="tareas-tabla">
            <thead>
              <tr>
                <th>Título</th>
                <th>Descripción</th>
                <th>Empresa</th>
                <th>Categoría</th>
                <th>Tiempo</th>
                <th>Estado</th>
                <th>Inicio</th>
                <th>Fin</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tareasFiltradas.map((t) => {
                let tiempoTotalSeg = 0;
                if (t.intervalos && t.intervalos.length > 0) {
                  t.intervalos.forEach(inter => {
                    const inicio = new Date(inter.fecha_inicio).getTime();
                    const fin = inter.fecha_fin ? new Date(inter.fecha_fin).getTime() : Date.now();
                    tiempoTotalSeg += Math.floor((fin - inicio) / 1000);
                  });
                }
                const tiempoFormateado = formatearTiempo(tiempoTotalSeg);
                const estado = t.estado || 'PENDIENTE';
                const estadoLower = estado.toLowerCase();
                const esPausa = estado === 'PAUSADA';
                const esFinalizada = estado === 'FINALIZADA';
                const esPendiente = estado === 'PENDIENTE';

                // Fecha de inicio (creación)
                const fechaInicio = new Date(t.fecha_creacion);
                const fechaInicioStr = fechaInicio.toLocaleString('es-ES', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                });

                // Fecha de finalización (si existe)
                let fechaFinStr = '-';
                if (t.fecha_finalizacion) {
                  const fechaFin = new Date(t.fecha_finalizacion);
                  fechaFinStr = fechaFin.toLocaleString('es-ES', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  });
                } else if (estado === 'FINALIZADA' && t.intervalos?.length) {
                  // Si no tiene fecha_finalizacion, buscar el último intervalo con fecha_fin
                  const intervalosConFin = t.intervalos.filter(i => i.fecha_fin);
                  if (intervalosConFin.length > 0) {
                    const ultimo = intervalosConFin[intervalosConFin.length - 1];
                    const fin = new Date(ultimo.fecha_fin);
                    fechaFinStr = fin.toLocaleString('es-ES', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    });
                  }
                }

                return (
                  <tr key={t.id}>
                    <td>{t.titulo}</td>
                    <td>{t.descripcion || '-'}</td>
                    <td>{t.empresa?.nombre || 'Sin empresa'}</td>
                    <td>{t.categoria?.nombre || 'Sin categoría'}</td>
                    <td>{tiempoFormateado}</td>
                    <td>
                      <span className={`estado-badge estado-${estadoLower}`}>
                        {estado === 'EN_PROCESO' ? 'En curso' : estadoLower}
                      </span>
                    </td>
                    <td>{fechaInicioStr}</td>
                    <td>{fechaFinStr}</td>
                    <td>
                      <div className="acciones-botones">
                        {esPendiente && !tieneTareaActiva && (
                          <button
                            className="btn-iniciar-pendiente"
                            onClick={() => handleIniciarPendiente(t.id)}
                            title="Iniciar tarea"
                          >
                            <IconPlay />
                          </button>
                        )}
                        {esPausa && (
                          <button
                            className="btn-reanudar"
                            onClick={() => handleReanudar(t)}
                            title="Reanudar"
                          >
                            <IconResume />
                          </button>
                        )}
                        {(esPausa || esFinalizada) && (
                          <button
                            className="btn-editar"
                            onClick={() => handleEditar(t)}
                            title="Editar"
                          >
                            <IconEdit />
                          </button>
                        )}
                        {esFinalizada && (
                          <button
                            className="btn-eliminar"
                            onClick={() => handleEliminar(t.id)}
                            title="Eliminar"
                          >
                            <IconDelete />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Inicio;