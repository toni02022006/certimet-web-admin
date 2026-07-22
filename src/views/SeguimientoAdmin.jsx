import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import Swal from 'sweetalert2';
import './SeguimientoAdmin.css';

// ==============================
// ICONOS (elegantes)
// ==============================
const IconUsers = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconClock = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconCheck = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const IconBar = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="18" rx="1" />
    <rect x="14" y="8" width="7" height="13" rx="1" />
  </svg>
);

const IconDownload = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const IconRefresh = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

// ==============================
// COMPONENTE PRINCIPAL
// ==============================
const SeguimientoAdmin = () => {
  const { usuario } = useContext(AuthContext);
  
  // ==============================
  // ESTADOS
  // ==============================
  const [equipo, setEquipo] = useState([]);          // Usuarios supervisados (para monitor)
  const [categorias, setCategorias] = useState([]);
  const [tareas, setTareas] = useState([]);          // Todas las tareas del sistema
  const [tareasAsignadas, setTareasAsignadas] = useState([]); // Filtradas por creador
  const [kpis, setKpis] = useState({
    usuariosActivos: 0,
    horasTotales: 0,
    tareasFinalizadas: 0,
    promedioTiempo: 0
  });
  const [loading, setLoading] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [usuariosDisponibles, setUsuariosDisponibles] = useState([]); // Para filtro de usuario

  // Filtros
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    usuarioId: '',
    categoriaId: ''
  });

  // ==============================
  // CARGAR DATOS INICIALES
  // ==============================
  useEffect(() => {
    // NUEVO: Si el usuario es null (ej. recargando página), detenemos la ejecución aquí
    if (!usuario || !usuario.id) return; 

    const fetchInitialData = async () => {
      try {
        // Obtener equipo del admin (para monitor en vivo)
        const resEquipo = await axios.get('/api/seguimiento/admin/equipo');
        setEquipo(resEquipo.data);

        // Obtener categorías
        const resCats = await axios.get('/api/seguimiento/categorias');
        setCategorias(resCats.data);

        // Obtener todos los usuarios no administradores (para filtro)
        const resUsuarios = await axios.get('/api/usuarios/practicantes');
        setUsuariosDisponibles(resUsuarios.data);

        // Obtener todas las tareas (sin filtro inicial)
        await cargarTareas();
      } catch (error) {
        console.error('Error cargando datos iniciales:', error);
        Swal.fire('Error', 'No se pudieron cargar los datos', 'error');
      }
    };
    fetchInitialData();
  }, [usuario]); // NUEVO: Agregar 'usuario' como dependencia

  // ==============================
  // CARGAR TAREAS Y FILTRAR POR CREADOR
  // ==============================
  const cargarTareas = async () => {
    setLoading(true);
    try {
      // Obtener TODAS las tareas (sin filtro de admin)
      const res = await axios.get('/api/seguimiento/todas-tareas');
      const todas = res.data;

      // Filtrar por creador_id (el admin actual)
      const misTareas = todas.filter(t => t.creador_id === usuario?.id);
      setTareas(misTareas);

      // Aplicar filtros adicionales (fechas, categoría, usuario)
      aplicarFiltros(misTareas);
    } catch (error) {
      console.error('Error cargando tareas:', error);
      Swal.fire('Error', 'No se pudieron cargar las tareas', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // APLICAR FILTROS (fechas, usuario, categoría)
  // ==============================
  const aplicarFiltros = (tareasBase) => {
    let filtradas = [...tareasBase];

    // Filtro por fecha de creación
    if (filtros.fechaInicio) {
      const inicio = new Date(filtros.fechaInicio);
      inicio.setHours(0,0,0,0);
      filtradas = filtradas.filter(t => new Date(t.fecha_creacion) >= inicio);
    }
    if (filtros.fechaFin) {
      const fin = new Date(filtros.fechaFin);
      fin.setHours(23,59,59,999);
      filtradas = filtradas.filter(t => new Date(t.fecha_creacion) <= fin);
    }

    // Filtro por usuario asignado
    if (filtros.usuarioId) {
      filtradas = filtradas.filter(t => t.asignado_id === parseInt(filtros.usuarioId));
    }

    // Filtro por categoría
    if (filtros.categoriaId) {
      filtradas = filtradas.filter(t => t.categoria_tarea_id === parseInt(filtros.categoriaId));
    }

    setTareasAsignadas(filtradas);
    calcularKPIs(filtradas);
  };

  // ==============================
  // CALCULAR KPIs
  // ==============================
  const calcularKPIs = (tareasFiltradas) => {
    // Usuarios activos (con tareas EN_PROCESO o PAUSADA)
    const usuariosActivosSet = new Set();
    tareasFiltradas.forEach(t => {
      if (t.estado === 'EN_PROCESO' || t.estado === 'PAUSADA') {
        usuariosActivosSet.add(t.asignado_id);
      }
    });

    // Calcular horas totales
    let totalSegundos = 0;
    tareasFiltradas.forEach(t => {
      if (t.intervalos) {
        t.intervalos.forEach(inter => {
          const inicio = new Date(inter.fecha_inicio).getTime();
          const fin = inter.fecha_fin ? new Date(inter.fecha_fin).getTime() : Date.now();
          totalSegundos += Math.floor((fin - inicio) / 1000);
        });
      }
    });

    const horasTotales = totalSegundos / 3600;

    // Tareas finalizadas
    const tareasFinalizadas = tareasFiltradas.filter(t => t.estado === 'FINALIZADA').length;

    // Promedio por tarea finalizada
    const promedio = tareasFinalizadas > 0 ? horasTotales / tareasFinalizadas : 0;

    setKpis({
      usuariosActivos: usuariosActivosSet.size,
      horasTotales: Math.round(horasTotales * 100) / 100,
      tareasFinalizadas,
      promedioTiempo: Math.round(promedio * 100) / 100
    });
  };

  // ==============================
  // MANEJADORES DE FILTROS
  // ==============================
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => {
      const nuevosFiltros = { ...prev, [name]: value };
      // Aplicar filtros inmediatamente
      aplicarFiltros(tareas);
      return nuevosFiltros;
    });
  };

  const handleResetFiltros = () => {
    setFiltros({
      fechaInicio: '',
      fechaFin: '',
      usuarioId: '',
      categoriaId: ''
    });
    // Aplicar sin filtros adicionales
    aplicarFiltros(tareas);
  };

  // ==============================
  // EXPORTAR A CSV (usando tareas filtradas)
  // ==============================
  const exportarCSV = () => {
    if (tareasAsignadas.length === 0) {
      Swal.fire('Sin datos', 'No hay tareas para exportar', 'info');
      return;
    }

    setExportando(true);
    try {
      const headers = ['Usuario', 'Título', 'Empresa', 'Categoría', 'Tiempo Total', 'Estado', 'Fecha Creación', 'Fecha Finalización'];
      const rows = tareasAsignadas.map(t => {
        let tiempoSeg = 0;
        if (t.intervalos) {
          t.intervalos.forEach(inter => {
            const inicio = new Date(inter.fecha_inicio).getTime();
            const fin = inter.fecha_fin ? new Date(inter.fecha_fin).getTime() : Date.now();
            tiempoSeg += Math.floor((fin - inicio) / 1000);
          });
        }
        const horas = Math.floor(tiempoSeg / 3600);
        const minutos = Math.floor((tiempoSeg % 3600) / 60);
        const segundos = tiempoSeg % 60;
        const tiempoStr = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;

        const estadoMap = {
          'PENDIENTE': 'Pendiente',
          'EN_PROCESO': 'En curso',
          'PAUSADA': 'Pausada',
          'FINALIZADA': 'Finalizada'
        };

        return [
          `${t.asignado?.nombre || ''} ${t.asignado?.apellidos || ''}`,
          t.titulo,
          t.empresa?.nombre || 'Sin empresa',
          t.categoria?.nombre || 'Sin categoría',
          tiempoStr,
          estadoMap[t.estado] || t.estado,
          new Date(t.fecha_creacion).toLocaleDateString(),
          t.fecha_finalizacion ? new Date(t.fecha_finalizacion).toLocaleDateString() : ''
        ];
      });

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `tareas_asignadas_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error exportando:', error);
      Swal.fire('Error', 'No se pudo exportar', 'error');
    } finally {
      setExportando(false);
    }
  };

  // ==============================
  // FORMATEAR TIEMPO
  // ==============================
  const formatearTiempo = (segundos) => {
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = segundos % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const calcularTiempoTotal = (tarea) => {
    if (!tarea.intervalos) return 0;
    let total = 0;
    tarea.intervalos.forEach(inter => {
      const inicio = new Date(inter.fecha_inicio).getTime();
      const fin = inter.fecha_fin ? new Date(inter.fecha_fin).getTime() : Date.now();
      total += Math.floor((fin - inicio) / 1000);
    });
    return total;
  };

  // ==============================
  // RENDERIZADO
  // ==============================

  return (
    <div className="admin-container">
      <h2 className="admin-title">📊 Panel de Seguimiento - Admin</h2>
      <p className="admin-subtitle">Tareas que has asignado a los usuarios</p>

      {/* ========== FILTROS ========== */}
      <div className="admin-filtros-card">
        <div className="admin-filtros-row">
          <div className="admin-filtro-group">
            <label>Desde</label>
            <input
              type="date"
              name="fechaInicio"
              value={filtros.fechaInicio}
              onChange={handleFiltroChange}
            />
          </div>
          <div className="admin-filtro-group">
            <label>Hasta</label>
            <input
              type="date"
              name="fechaFin"
              value={filtros.fechaFin}
              onChange={handleFiltroChange}
            />
          </div>
          <div className="admin-filtro-group">
            <label>Usuario</label>
            <select
              name="usuarioId"
              value={filtros.usuarioId}
              onChange={handleFiltroChange}
            >
              <option value="">Todos</option>
              {usuariosDisponibles.map(u => (
                <option key={u.id} value={u.id}>
                  {u.nombre} {u.apellidos}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-filtro-group">
            <label>Categoría</label>
            <select
              name="categoriaId"
              value={filtros.categoriaId}
              onChange={handleFiltroChange}
            >
              <option value="">Todas</option>
              {categorias.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <div className="admin-filtro-actions">
            <button className="btn-reset" onClick={handleResetFiltros}>
              <IconRefresh /> Reset
            </button>
            <button className="btn-export" onClick={exportarCSV} disabled={exportando}>
              <IconDownload /> {exportando ? 'Exportando...' : 'Exportar'}
            </button>
          </div>
        </div>
      </div>

      {/* ========== KPIs ========== */}
      <div className="admin-kpis-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon"><IconUsers /></div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-value">{kpis.usuariosActivos}</span>
            <span className="admin-kpi-label">Usuarios activos</span>
          </div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon"><IconClock /></div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-value">{kpis.horasTotales}h</span>
            <span className="admin-kpi-label">Horas totales</span>
          </div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon"><IconCheck /></div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-value">{kpis.tareasFinalizadas}</span>
            <span className="admin-kpi-label">Tareas finalizadas</span>
          </div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon"><IconBar /></div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-value">{kpis.promedioTiempo}h</span>
            <span className="admin-kpi-label">Promedio por tarea</span>
          </div>
        </div>
      </div>

      {/* ========== MONITOR EN VIVO (Usuarios con tareas activas) ========== */}
      <div className="admin-monitor-card">
        <h3>🟢 Monitor en Vivo</h3>
        {loading ? (
          <p className="admin-loading">Cargando...</p>
        ) : (
          <div className="admin-monitor-grid">
            {equipo.map(user => {
              // Buscar tarea activa del usuario (entre las asignadas por el admin)
              const tareaUsuario = tareasAsignadas.find(t => 
                t.asignado_id === user.id && 
                (t.estado === 'EN_PROCESO' || t.estado === 'PAUSADA')
              );
              const estaActivo = !!tareaUsuario;
              const estado = tareaUsuario?.estado || 'INACTIVO';
              const estadoClass = estado === 'EN_PROCESO' ? 'activo' : 
                                 estado === 'PAUSADA' ? 'pausa' : 'inactivo';
              const tiempo = tareaUsuario ? calcularTiempoTotal(tareaUsuario) : 0;

              return (
                <div key={user.id} className={`admin-monitor-item ${estadoClass}`}>
                  <div className="admin-monitor-avatar">
                    {user.nombre?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="admin-monitor-info">
                    <div className="admin-monitor-nombre">{user.nombre} {user.apellidos}</div>
                    <div className="admin-monitor-tarea">
                      {tareaUsuario ? tareaUsuario.titulo : 'Sin tarea activa'}
                    </div>
                    {tareaUsuario && (
                      <div className="admin-monitor-tiempo">
                        ⏱ {formatearTiempo(tiempo)}
                      </div>
                    )}
                  </div>
                  <div className={`admin-monitor-estado ${estadoClass}`}>
                    {estado === 'EN_PROCESO' ? 'En curso' : 
                     estado === 'PAUSADA' ? 'Pausa' : 'Inactivo'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========== TABLA DE TAREAS ASIGNADAS ========== */}
      <div className="admin-tabla-card">
        <h3>📋 Mis Asignaciones</h3>
        {loading ? (
          <p className="admin-loading">Cargando tareas...</p>
        ) : tareasAsignadas.length === 0 ? (
          <p className="admin-vacio">No has asignado tareas con los filtros seleccionados.</p>
        ) : (
          <div className="admin-tabla-wrapper">
            <table className="admin-tabla">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Título</th>
                  <th>Empresa</th>
                  <th>Categoría</th>
                  <th>Tiempo</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {tareasAsignadas.map(t => {
                  const tiempo = calcularTiempoTotal(t);
                  const estadoMap = {
                    'PENDIENTE': 'Pendiente',
                    'EN_PROCESO': 'En curso',
                    'PAUSADA': 'Pausada',
                    'FINALIZADA': 'Finalizada'
                  };
                  const estadoClass = t.estado?.toLowerCase() || 'pendiente';
                  return (
                    <tr key={t.id}>
                      <td>{t.asignado?.nombre || 'N/A'} {t.asignado?.apellidos || ''}</td>
                      <td>{t.titulo}</td>
                      <td>{t.empresa?.nombre || 'Sin empresa'}</td>
                      <td>{t.categoria?.nombre || 'Sin categoría'}</td>
                      <td>{formatearTiempo(tiempo)}</td>
                      <td>
                        <span className={`estado-badge estado-${estadoClass}`}>
                          {estadoMap[t.estado] || t.estado}
                        </span>
                      </td>
                      <td>{new Date(t.fecha_creacion).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeguimientoAdmin;