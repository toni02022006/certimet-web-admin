import React, { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Filler
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import Swal from 'sweetalert2';
import { AuthContext } from '../../context/AuthContext'; // Ajusta la ruta si es necesario
import './DashboardSeguimiento.css';

// Registrar componentes de Chart.js
ChartJS.register(
  ArcElement, Tooltip, Legend, CategoryScale, LinearScale,
  BarElement, PointElement, LineElement, Title, Filler
);

// ==============================
// ICONOS (SVG elegantes)
// ==============================
const IconUsers = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>);
const IconClock = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>);
const IconCheck = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>);
const IconTrendingUp = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>);
const IconDownload = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>);

export default function DashboardSeguimiento() {
  const { usuario } = useContext(AuthContext);
  
  // 🔥 LÓGICA DE ROL: Solo true si es exactamente 'admin'
  const rolUsuario = usuario?.rol?.toLowerCase() || usuario?.role?.toLowerCase() || '';
  const esAdmin = rolUsuario === 'admin';

  // ==============================
  // ESTADOS
  // ==============================
  const [loading, setLoading] = useState(true);
  const [usuariosActivos, setUsuariosActivos] = useState([]);
  const [todasTareas, setTodasTareas] = useState([]);

  // Filtros
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [empresaFiltro, setEmpresaFiltro] = useState('');
  const [usuarioFiltro, setUsuarioFiltro] = useState('');
  const [listaEmpresas, setListaEmpresas] = useState([]);
  const [listaUsuarios, setListaUsuarios] = useState([]);

  // KPIs
  const [kpis, setKpis] = useState({
    activos: 0, totalHoras: 0, tareasFinalizadas: 0, promedioTiempo: 0,
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  // ==============================
  // CARGAR DATOS
  // ==============================
  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [resActivos, resTareas] = await Promise.all([
        axios.get(`${API_URL}/api/seguimiento/estado-practicantes`, config),
        axios.get(`${API_URL}/api/seguimiento/todas-tareas`, config)
      ]);

      setUsuariosActivos(resActivos.data);
      setTodasTareas(resTareas.data);

      const empresasSet = new Set();
      const usuariosSet = new Set();
      resTareas.data.forEach(t => {
        if (t.empresa?.nombre) empresasSet.add(t.empresa.nombre);
        if (t.asignado?.nombre) usuariosSet.add(t.asignado.nombre + ' ' + (t.asignado.apellidos || ''));
      });
      setListaEmpresas([...empresasSet]);
      setListaUsuarios([...usuariosSet]);

      calcularKPIs(resTareas.data, resActivos.data);
    } catch (error) {
      console.error('Error cargando datos de seguimiento:', error);
    } finally {
      setLoading(false);
    }
  }, [API_URL, token]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // ==============================
  // CÁLCULO DE KPIs
  // ==============================
  const calcularKPIs = (tareas, activos) => {
    const activosAhora = activos.filter(u => u.tareaActiva !== null).length;
    let totalMs = 0;
    tareas.forEach(t => {
      if (t.intervalos && t.intervalos.length > 0) {
        t.intervalos.forEach(inter => {
          const inicio = new Date(inter.fecha_inicio).getTime();
          const fin = inter.fecha_fin ? new Date(inter.fecha_fin).getTime() : Date.now();
          totalMs += fin - inicio;
        });
      }
    });
    const totalHoras = totalMs / (1000 * 60 * 60);
    const finalizadas = tareas.filter(t => t.estado === 'FINALIZADA').length;
    let promedio = 0;
    const tareasFinalizadas = tareas.filter(t => t.estado === 'FINALIZADA' && t.intervalos && t.intervalos.length > 0);
    if (tareasFinalizadas.length > 0) {
      let totalTiempoFinalizadas = 0;
      tareasFinalizadas.forEach(t => {
        t.intervalos.forEach(inter => {
          if (inter.fecha_fin) {
            totalTiempoFinalizadas += new Date(inter.fecha_fin) - new Date(inter.fecha_inicio);
          }
        });
      });
      promedio = totalTiempoFinalizadas / (tareasFinalizadas.length * 1000 * 60);
    }
    setKpis({
      activos: activosAhora, totalHoras: Math.round(totalHoras * 100) / 100,
      tareasFinalizadas: finalizadas, promedioTiempo: Math.round(promedio * 100) / 100,
    });
  };

  const filtrarTareas = (tareas) => {
    let filtradas = [...tareas];
    if (fechaInicio) filtradas = filtradas.filter(t => new Date(t.fecha_creacion) >= new Date(fechaInicio));
    if (fechaFin) filtradas = filtradas.filter(t => new Date(t.fecha_creacion) <= new Date(fechaFin));
    if (empresaFiltro) filtradas = filtradas.filter(t => t.empresa?.nombre === empresaFiltro);
    if (usuarioFiltro) {
      filtradas = filtradas.filter(t => {
        const nombreCompleto = (t.asignado?.nombre || '') + ' ' + (t.asignado?.apellidos || '');
        return nombreCompleto === usuarioFiltro;
      });
    }
    return filtradas;
  };

  const tareasFiltradas = filtrarTareas(todasTareas);

  // Gráficos
  const getDistribucionCategoria = () => {
    const categorias = {};
    tareasFiltradas.forEach(t => {
      const cat = t.categoria?.nombre || 'Sin categoría';
      let tiempo = 0;
      if (t.intervalos) {
        t.intervalos.forEach(inter => {
          const inicio = new Date(inter.fecha_inicio).getTime();
          const fin = inter.fecha_fin ? new Date(inter.fecha_fin).getTime() : Date.now();
          tiempo += fin - inicio;
        });
      }
      categorias[cat] = (categorias[cat] || 0) + tiempo;
    });
    return { labels: Object.keys(categorias), data: Object.values(categorias).map(ms => ms / (1000 * 60 * 60)) };
  };

  const distribucion = getDistribucionCategoria();
  const pieData = {
    labels: distribucion.labels,
    datasets: [{
      data: distribucion.data,
      backgroundColor: ['#1a5276', '#2e86c1', '#85c1e9', '#f39c12', '#e74c3c', '#27ae60', '#8e44ad', '#f1c40f'],
      borderWidth: 1,
    }],
  };

  const getTopUsuarios = () => {
    const usuarios = {};
    tareasFiltradas.forEach(t => {
      const nombre = t.asignado ? (t.asignado.nombre + ' ' + (t.asignado.apellidos || '')) : 'Sin asignar';
      let tiempo = 0;
      if (t.intervalos) {
        t.intervalos.forEach(inter => {
          const inicio = new Date(inter.fecha_inicio).getTime();
          const fin = inter.fecha_fin ? new Date(inter.fecha_fin).getTime() : Date.now();
          tiempo += fin - inicio;
        });
      }
      usuarios[nombre] = (usuarios[nombre] || 0) + tiempo;
    });
    const sorted = Object.entries(usuarios).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return { labels: sorted.map(([name]) => name), data: sorted.map(([, ms]) => ms / (1000 * 60 * 60)) };
  };

  const topUsuarios = getTopUsuarios();
  const barData = {
    labels: topUsuarios.labels,
    datasets: [{ label: 'Horas trabajadas', data: topUsuarios.data, backgroundColor: '#1a5276', borderRadius: 6 }],
  };

  const getTendenciaDiaria = () => {
    const dias = {};
    const hoy = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(hoy);
      d.setDate(d.getDate() - i);
      dias[d.toISOString().split('T')[0]] = 0;
    }
    tareasFiltradas.forEach(t => {
      if (t.intervalos) {
        t.intervalos.forEach(inter => {
          const fecha = new Date(inter.fecha_inicio);
          const key = fecha.toISOString().split('T')[0];
          if (dias[key] !== undefined) {
            const inicio = new Date(inter.fecha_inicio).getTime();
            const fin = inter.fecha_fin ? new Date(inter.fecha_fin).getTime() : Date.now();
            dias[key] += fin - inicio;
          }
        });
      }
    });
    return { labels: Object.keys(dias), data: Object.values(dias).map(ms => ms / (1000 * 60 * 60)) };
  };

  const tendencia = getTendenciaDiaria();
  const lineData = {
    labels: tendencia.labels.map(d => { const parts = d.split('-'); return `${parts[2]}/${parts[1]}`; }),
    datasets: [{
      label: 'Horas diarias', data: tendencia.data, borderColor: '#1a5276',
      backgroundColor: 'rgba(26, 82, 118, 0.1)', fill: true, tension: 0.4,
      pointBackgroundColor: '#2e86c1', pointBorderColor: '#fff',
    }],
  };

  // Exportar Excel (Solo Admin)
  const exportarExcel = () => {
    if (!esAdmin) return;
    const data = tareasFiltradas.map(t => ({
      Usuario: t.asignado ? (t.asignado.nombre + ' ' + (t.asignado.apellidos || '')) : 'Sin asignar',
      Tarea: t.titulo, Empresa: t.empresa?.nombre || 'Sin empresa', Categoría: t.categoria?.nombre || 'Sin categoría',
      Estado: t.estado, 'Fecha creación': new Date(t.fecha_creacion).toLocaleDateString(),
      'Tiempo total (horas)': (() => {
        let ms = 0;
        if (t.intervalos) {
          t.intervalos.forEach(inter => {
            const inicio = new Date(inter.fecha_inicio).getTime();
            const fin = inter.fecha_fin ? new Date(inter.fecha_fin).getTime() : Date.now();
            ms += fin - inicio;
          });
        }
        return (ms / (1000 * 60 * 60)).toFixed(2);
      })(),
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Tareas');
    XLSX.writeFile(wb, `reporte_seguimiento_${new Date().toISOString().split('T')[0]}.xlsx`);
    Swal.fire('Exportado', 'Reporte generado correctamente', 'success');
  };

  if (loading) return <div className="cm-loading-state">Cargando métricas de seguimiento...</div>;

  return (
    <div className="cm-dash-container">
      <div className="cm-dash-header">
        <h2 className="cm-dash-title">Rendimiento y Seguimiento</h2>
        <p className="cm-dash-subtitle">Visión general del desempeño y tareas del equipo</p>
      </div>

      {/* ========== FILTROS GLOBALES ========== */}
      <div className="ss-filtros">
        <div className="ss-filtros-row">
          <div className="ss-filtro-group"><label>Desde</label><input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} /></div>
          <div className="ss-filtro-group"><label>Hasta</label><input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} /></div>
          <div className="ss-filtro-group">
            <label>Empresa</label>
            <select value={empresaFiltro} onChange={(e) => setEmpresaFiltro(e.target.value)}>
              <option value="">Todas</option>
              {listaEmpresas.map(emp => <option key={emp} value={emp}>{emp}</option>)}
            </select>
          </div>
          <div className="ss-filtro-group">
            <label>Usuario</label>
            <select value={usuarioFiltro} onChange={(e) => setUsuarioFiltro(e.target.value)}>
              <option value="">Todos</option>
              {listaUsuarios.map(user => <option key={user} value={user}>{user}</option>)}
            </select>
          </div>
          
          {/* 🔥 BOTÓN EXPORTAR EXCEL - RESTRINGIDO A ADMIN */}
          {esAdmin && (
            <button className="ss-btn-export" onClick={exportarExcel}>
              <IconDownload /> Exportar Excel
            </button>
          )}
        </div>
      </div>

      {/* ========== KPIs ========== */}
      <div className="cm-kpi-grid">
        <div className="cm-kpi-card cm-kpi-blue">
          <div className="cm-kpi-header"><div className="cm-kpi-icon-wrapper"><IconUsers /></div></div>
          <div className="cm-kpi-body"><h3 className="cm-kpi-value">{kpis.activos}</h3><p className="cm-kpi-label">Usuarios activos ahora</p></div>
        </div>
        <div className="cm-kpi-card cm-kpi-green">
          <div className="cm-kpi-header"><div className="cm-kpi-icon-wrapper"><IconClock /></div></div>
          <div className="cm-kpi-body"><h3 className="cm-kpi-value">{kpis.totalHoras.toFixed(1)}h</h3><p className="cm-kpi-label">Horas totales registradas</p></div>
        </div>
        <div className="cm-kpi-card cm-kpi-purple">
          <div className="cm-kpi-header"><div className="cm-kpi-icon-wrapper"><IconCheck /></div></div>
          <div className="cm-kpi-body"><h3 className="cm-kpi-value">{kpis.tareasFinalizadas}</h3><p className="cm-kpi-label">Tareas finalizadas</p></div>
        </div>
        <div className="cm-kpi-card cm-kpi-orange">
          <div className="cm-kpi-header"><div className="cm-kpi-icon-wrapper"><IconTrendingUp /></div></div>
          <div className="cm-kpi-body"><h3 className="cm-kpi-value">{kpis.promedioTiempo.toFixed(1)} min</h3><p className="cm-kpi-label">Promedio por tarea</p></div>
        </div>
      </div>

      {/* ========== MONITOR Y PASTEL ========== */}
      <div className="ss-row-two-cols">
        <div className="cm-card ss-col-monitor">
          <div className="cm-card-header"><h3 className="cm-card-title">Monitor en Vivo</h3></div>
          <div className="cm-card-body" style={{ padding: '0' }}>
            {usuariosActivos.filter(u => u.tareaActiva).length === 0 ? (
              <p style={{ padding: '20px', textAlign: 'center', color: '#999' }}>No hay usuarios con tareas activas</p>
            ) : (
              <table className="cm-table">
                <thead><tr><th>Usuario</th><th>Tarea actual</th><th>Estado</th></tr></thead>
                <tbody>
                  {usuariosActivos.map((u, idx) => {
                    if (!u.tareaActiva) return null;
                    const estado = u.tareaActiva.intervaloActual ? 'EN_PROCESO' : 'PAUSADA';
                    const badgeClass = estado === 'EN_PROCESO' ? 'badge-success' : 'badge-warning';
                    return (
                      <tr key={idx}>
                        <td className="font-medium text-blue">{u.nombre} {u.apellidos}</td>
                        <td>{u.tareaActiva.titulo}</td>
                        <td><span className={`cm-badge ${badgeClass}`}>{estado === 'EN_PROCESO' ? 'En curso' : 'Pausa'}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="cm-card ss-col-pie">
          <div className="cm-card-header"><h3 className="cm-card-title">Distribución del tiempo</h3></div>
          <div className="cm-card-body" style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: '300px' }}>
              <Pie data={pieData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
            </div>
          </div>
        </div>
      </div>

      {/* ========== GRÁFICOS ========== */}
      <div className="cm-charts-grid">
        <div className="cm-card">
          {/* 🔥 TEXTO CAMBIADO COMO PEDISTE */}
          <div className="cm-card-header"><h3 className="cm-card-title">Productividad de usuarios</h3></div>
          <div className="cm-card-body" style={{ height: '100px' }}>
            <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>
      </div>
      <div className="cm-charts-grid">
        <div className="cm-card">
          <div className="cm-card-header"><h3 className="cm-card-title">Tendencia diaria (últimos 7 días)</h3></div>
          <div className="cm-card-body" style={{ height: '300px' }}>
            <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>
      </div>

      {/* 🔥 HISTORIAL GLOBAL - RESTRINGIDO A ADMIN */}
      {esAdmin && (
        <div className="cm-card cm-card-table mt-4">
          <div className="cm-card-header"><h3 className="cm-card-title">Historial Global de Tareas</h3></div>
          <div className="cm-table-responsive">
            <table className="cm-table">
              <thead>
                <tr><th>Usuario</th><th>Tarea</th><th>Empresa</th><th>Categoría</th><th>Estado</th><th>Fecha</th></tr>
              </thead>
              <tbody>
                {tareasFiltradas.slice(0, 30).map(t => {
                  const estadoClass = t.estado === 'EN_PROCESO' ? 'badge-primary' : t.estado === 'PAUSADA' ? 'badge-warning' : 'badge-success';
                  return (
                    <tr key={t.id}>
                      <td className="font-medium text-blue">{t.asignado ? `${t.asignado.nombre} ${t.asignado.apellidos || ''}` : 'Sin asignar'}</td>
                      <td>{t.titulo}</td><td>{t.empresa?.nombre || 'Sin empresa'}</td><td>{t.categoria?.nombre || '-'}</td>
                      <td><span className={`cm-badge ${estadoClass}`}>{t.estado || 'FINALIZADA'}</span></td>
                      <td className="text-muted">{new Date(t.fecha_creacion).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}