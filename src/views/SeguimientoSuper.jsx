import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
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
  Filler // <--- 1. ASEGÚRATE DE AGREGARLO AQUÍ EN EL IMPORT
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import Swal from 'sweetalert2';
import './SeguimientoSuper.css';

// Registrar componentes de Chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Filler // <--- 2. Y TAMBIÉN AGREGARLO AQUÍ EN EL REGISTER
);

// ==============================
// ICONOS (SVG elegantes)
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
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const IconTrendingUp = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const IconFilter = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 13.46 10 19 14 21 14 13.46 22 3" />
  </svg>
);

const IconDownload = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const SeguimientoSuper = () => {
  // ==============================
  // ESTADOS
  // ==============================
  const [loading, setLoading] = useState(true);
  const [usuariosActivos, setUsuariosActivos] = useState([]);
  const [todasTareas, setTodasTareas] = useState([]);
  const [resumenHoras, setResumenHoras] = useState([]);

  // Filtros
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [empresaFiltro, setEmpresaFiltro] = useState('');
  const [usuarioFiltro, setUsuarioFiltro] = useState('');
  const [listaEmpresas, setListaEmpresas] = useState([]);
  const [listaUsuarios, setListaUsuarios] = useState([]);

  // KPIs
  const [kpis, setKpis] = useState({
    activos: 0,
    totalHoras: 0,
    tareasFinalizadas: 0,
    promedioTiempo: 0,
  });

  // ==============================
  // CARGAR DATOS
  // ==============================
  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Estado en vivo de practicantes
      const resActivos = await api.get('/seguimiento/estado-practicantes');
      setUsuariosActivos(Array.isArray(resActivos.data) ? resActivos.data : []);

      // 2. Todas las tareas (para historial y gráficos)
      const resTareas = await api.get('/seguimiento/todas-tareas');
      const tareasData = Array.isArray(resTareas.data) ? resTareas.data : [];
      setTodasTareas(tareasData);

      // 3. Resumen de horas por usuario (para gráfico de barras)
      const resResumen = await api.get('/seguimiento/resumen');
      setResumenHoras(Array.isArray(resResumen.data) ? resResumen.data : []);

      // 4. Extraer lista de empresas y usuarios para filtros
      const empresasSet = new Set();
      const usuariosSet = new Set();
      tareasData.forEach(t => {
        if (t.empresa?.nombre) empresasSet.add(t.empresa.nombre);
        if (t.asignado?.nombre) usuariosSet.add(t.asignado.nombre + ' ' + (t.asignado.apellidos || ''));
      });
      setListaEmpresas([...empresasSet]);
      setListaUsuarios([...usuariosSet]);

      // Calcular KPIs
      calcularKPIs(tareasData, resActivos.data);

    } catch (error) {
      console.error('Error cargando datos:', error);
      Swal.fire('Error', 'No se pudieron cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // ==============================
  // CÁLCULO DE KPIs
  // ==============================
  const calcularKPIs = (tareas, activos) => {
    // Usuarios activos (con tarea EN_PROCESO o PAUSADA)
    const activosAhora = activos.filter(u => u.tareaActiva !== null).length;

    // Total de horas (suma de todas las tareas finalizadas + en curso)
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

    // Tareas finalizadas
    const finalizadas = tareas.filter(t => t.estado === 'FINALIZADA').length;

    // Promedio de tiempo por tarea (solo finalizadas)
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
      promedio = totalTiempoFinalizadas / (tareasFinalizadas.length * 1000 * 60); // en minutos
    }

    setKpis({
      activos: activosAhora,
      totalHoras: Math.round(totalHoras * 100) / 100,
      tareasFinalizadas: finalizadas,
      promedioTiempo: Math.round(promedio * 100) / 100,
    });
  };

  // ==============================
  // FILTRADO DE DATOS
  // ==============================
  const filtrarTareas = (tareas) => {
    let filtradas = [...tareas];
    if (fechaInicio) {
      filtradas = filtradas.filter(t => new Date(t.fecha_creacion) >= new Date(fechaInicio));
    }
    if (fechaFin) {
      filtradas = filtradas.filter(t => new Date(t.fecha_creacion) <= new Date(fechaFin));
    }
    if (empresaFiltro) {
      filtradas = filtradas.filter(t => t.empresa?.nombre === empresaFiltro);
    }
    if (usuarioFiltro) {
      filtradas = filtradas.filter(t => {
        const nombreCompleto = (t.asignado?.nombre || '') + ' ' + (t.asignado?.apellidos || '');
        return nombreCompleto === usuarioFiltro;
      });
    }
    return filtradas;
  };

  // ==============================
  // DATOS PARA GRÁFICOS (usando todas las tareas filtradas)
  // ==============================
  const tareasFiltradas = filtrarTareas(todasTareas);

  // Gráfico de pastel: distribución por categoría
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
    const labels = Object.keys(categorias);
    const data = Object.values(categorias).map(ms => ms / (1000 * 60 * 60)); // horas
    return { labels, data };
  };

  const distribucion = getDistribucionCategoria();

  const pieData = {
    labels: distribucion.labels,
    datasets: [
      {
        label: 'Horas por categoría',
        data: distribucion.data,
        backgroundColor: [
          '#1a5276', '#2e86c1', '#85c1e9', '#f39c12', '#e74c3c', '#27ae60', '#8e44ad', '#f1c40f'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Gráfico de barras: Top 5 usuarios con más horas
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
    const labels = sorted.map(([name]) => name);
    const data = sorted.map(([, ms]) => ms / (1000 * 60 * 60)); // horas
    return { labels, data };
  };

  const topUsuarios = getTopUsuarios();

  const barData = {
    labels: topUsuarios.labels,
    datasets: [
      {
        label: 'Horas trabajadas',
        data: topUsuarios.data,
        backgroundColor: '#1a5276',
        borderRadius: 6,
      },
    ],
  };

  // Gráfico de líneas: tendencia diaria (últimos 7 días)
  const getTendenciaDiaria = () => {
    const dias = {};
    const hoy = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(hoy);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dias[key] = 0;
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
    const labels = Object.keys(dias);
    const data = Object.values(dias).map(ms => ms / (1000 * 60 * 60)); // horas
    return { labels, data };
  };

  const tendencia = getTendenciaDiaria();

  const lineData = {
    labels: tendencia.labels.map(d => {
      const parts = d.split('-');
      return `${parts[2]}/${parts[1]}`;
    }),
    datasets: [
      {
        label: 'Horas diarias',
        data: tendencia.data,
        borderColor: '#1a5276',
        backgroundColor: 'rgba(26, 82, 118, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#2e86c1',
        pointBorderColor: '#fff',
      },
    ],
  };

  // ==============================
  // EXPORTAR A EXCEL
  // ==============================
  const exportarExcel = () => {
    const data = tareasFiltradas.map(t => ({
      Usuario: t.asignado ? (t.asignado.nombre + ' ' + (t.asignado.apellidos || '')) : 'Sin asignar',
      Tarea: t.titulo,
      Empresa: t.empresa?.nombre || 'Sin empresa',
      Categoría: t.categoria?.nombre || 'Sin categoría',
      Estado: t.estado,
      'Fecha creación': new Date(t.fecha_creacion).toLocaleDateString(),
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

  // ==============================
  // RENDERIZADO
  // ==============================

  if (loading) {
    return <div className="ss-loading">Cargando datos...</div>;
  }

  return (
    <div className="ss-container">
      <h1 className="ss-title">Panel de Seguimiento - Superadmin</h1>

      {/* ========== FILTROS GLOBALES ========== */}
      <div className="ss-filtros">
        <div className="ss-filtros-row">
          <div className="ss-filtro-group">
            <label>Desde</label>
            <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
          </div>
          <div className="ss-filtro-group">
            <label>Hasta</label>
            <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
          </div>
          <div className="ss-filtro-group">
            <label>Empresa</label>
            <select value={empresaFiltro} onChange={(e) => setEmpresaFiltro(e.target.value)}>
              <option value="">Todas</option>
              {listaEmpresas.map(emp => (
                <option key={emp} value={emp}>{emp}</option>
              ))}
            </select>
          </div>
          <div className="ss-filtro-group">
            <label>Usuario</label>
            <select value={usuarioFiltro} onChange={(e) => setUsuarioFiltro(e.target.value)}>
              <option value="">Todos</option>
              {listaUsuarios.map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
          </div>
          <button className="ss-btn-export" onClick={exportarExcel}>
            <IconDownload /> Exportar Excel
          </button>
        </div>
      </div>

      {/* ========== KPIs ========== */}
      <div className="ss-kpis">
        <div className="ss-kpi-card">
          <div className="ss-kpi-icon"><IconUsers /></div>
          <div className="ss-kpi-info">
            <span className="ss-kpi-value">{kpis.activos}</span>
            <span className="ss-kpi-label">Usuarios activos ahora</span>
          </div>
        </div>
        <div className="ss-kpi-card">
          <div className="ss-kpi-icon"><IconClock /></div>
          <div className="ss-kpi-info">
            <span className="ss-kpi-value">{kpis.totalHoras.toFixed(1)}h</span>
            <span className="ss-kpi-label">Horas totales registradas</span>
          </div>
        </div>
        <div className="ss-kpi-card">
          <div className="ss-kpi-icon"><IconCheck /></div>
          <div className="ss-kpi-info">
            <span className="ss-kpi-value">{kpis.tareasFinalizadas}</span>
            <span className="ss-kpi-label">Tareas finalizadas</span>
          </div>
        </div>
        <div className="ss-kpi-card">
          <div className="ss-kpi-icon"><IconTrendingUp /></div>
          <div className="ss-kpi-info">
            <span className="ss-kpi-value">{kpis.promedioTiempo.toFixed(1)} min</span>
            <span className="ss-kpi-label">Promedio por tarea</span>
          </div>
        </div>
      </div>

      {/* ========== MONITOR EN VIVO Y GRÁFICO PASTEL ========== */}
      <div className="ss-row-two-cols">
        <div className="ss-col-monitor">
          <h3>Monitor en Vivo</h3>
          {usuariosActivos.filter(u => u.tareaActiva).length === 0 ? (
            <p className="ss-empty">No hay usuarios con tareas activas</p>
          ) : (
            <table className="ss-monitor-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Tarea actual</th>
                  <th>Empresa</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {usuariosActivos.map((u, idx) => {
                  if (!u.tareaActiva) return null;
                  const t = u.tareaActiva;
                  const estado = t.intervaloActual ? 'EN_PROCESO' : 'PAUSADA';
                  const estadoClass = estado === 'EN_PROCESO' ? 'estado-verde' : 'estado-amarillo';
                  return (
                    <tr key={idx}>
                      <td>{u.nombre} {u.apellidos}</td>
                      <td>{t.titulo}</td>
                      <td>{t.empresa?.nombre || 'Sin empresa'}</td>
                      <td>
                        <span className={`ss-estado-badge ${estadoClass}`}>
                          {estado === 'EN_PROCESO' ? '▶ En curso' : '⏸ Pausa'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="ss-col-pie">
          <h3>Distribución del tiempo</h3>
          {distribucion.labels.length === 0 ? (
            <p className="ss-empty">No hay datos</p>
          ) : (
            <div className="ss-pie-wrapper">
              <Pie data={pieData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
            </div>
          )}
        </div>
      </div>

      {/* ========== GRÁFICOS DE BARRAS Y LÍNEAS (Filas separadas) ========== */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px' }}>
        
        {/* Fila 1: Gráfico de Barras */}
        <div className="ss-col-bar" style={{ width: '100%' }}>
          <h3>Top 5 usuarios más productivos</h3>
          {topUsuarios.labels.length === 0 ? (
            <p className="ss-empty">No hay datos</p>
          ) : (
            <Bar data={barData} options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true } }
            }} />
          )}
        </div>

        {/* Fila 2: Gráfico de Líneas */}
        <div className="ss-col-line" style={{ width: '100%' }}>
          <h3>Tendencia diaria (últimos 7 días)</h3>
          {tendencia.labels.length === 0 ? (
            <p className="ss-empty">No hay datos</p>
          ) : (
            <Line data={lineData} options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true } }
            }} />
          )}
        </div>
        
      </div>

      {/* ========== HISTORIAL GLOBAL ========== */}
      <div className="ss-historial">
        <h3>Historial Global de Tareas</h3>
        {tareasFiltradas.length === 0 ? (
          <p className="ss-empty">No hay tareas que coincidan con los filtros</p>
        ) : (
          <div className="ss-table-wrapper">
            <table className="ss-historial-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Tarea</th>
                  <th>Empresa</th>
                  <th>Categoría</th>
                  <th>Tiempo total</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {tareasFiltradas.slice(0, 50).map(t => {
                  let tiempoMs = 0;
                  if (t.intervalos) {
                    t.intervalos.forEach(inter => {
                      const inicio = new Date(inter.fecha_inicio).getTime();
                      const fin = inter.fecha_fin ? new Date(inter.fecha_fin).getTime() : Date.now();
                      tiempoMs += fin - inicio;
                    });
                  }
                  const horas = Math.floor(tiempoMs / (1000 * 60 * 60));
                  const minutos = Math.floor((tiempoMs % (1000 * 60 * 60)) / (1000 * 60));
                  const segundos = Math.floor((tiempoMs % (1000 * 60)) / 1000);
                  const tiempoStr = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
                  const estado = t.estado || 'PENDIENTE';
                  const estadoClass = estado === 'EN_PROCESO' ? 'estado-verde' : estado === 'PAUSADA' ? 'estado-amarillo' : 'estado-gris';
                  return (
                    <tr key={t.id}>
                      <td>{t.asignado ? (t.asignado.nombre + ' ' + (t.asignado.apellidos || '')) : 'Sin asignar'}</td>
                      <td>{t.titulo}</td>
                      <td>{t.empresa?.nombre || 'Sin empresa'}</td>
                      <td>{t.categoria?.nombre || 'Sin categoría'}</td>
                      <td>{tiempoStr}</td>
                      <td>
                        <span className={`ss-estado-badge ${estadoClass}`}>
                          {estado === 'EN_PROCESO' ? 'En curso' : estado === 'PAUSADA' ? 'Pausa' : 'Finalizada'}
                        </span>
                      </td>
                      <td>{new Date(t.fecha_creacion).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {tareasFiltradas.length > 50 && (
              <p className="ss-table-note">Mostrando 50 de {tareasFiltradas.length} tareas. Usa los filtros para acotar.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SeguimientoSuper;