import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import './DashboardCalendario.css';

// --- Subcomponente Icon ---
const Icon = ({ path, size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

const iconosDashboard = {
  eventos: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  tareas: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  reuniones: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
  vacaciones: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
};

// Colores para el gráfico de dona (Tipos de evento)
const COLORES_TIPO = {
  'TAREA': '#3498db',
  'REUNION': '#9b59b6',
  'ACTIVIDAD': '#2ecc71',
  'FERIADO': '#e74c3c',
  'OTRO': '#95a5a6'
};

export default function DashboardCalendario() {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  
  const [kpis, setKpis] = useState([]);
  const [datosEventosSemana, setDatosEventosSemana] = useState([]);
  const [datosDistribucion, setDatosDistribucion] = useState([]);
  const [eventosProximos, setEventosProximos] = useState([]);
  const [vacacionesRecientes, setVacacionesRecientes] = useState([]);

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  
  // 🔥 CORRECCIÓN PARA PRODUCCIÓN: URL base apuntando al backend real
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    obtenerDatosReales();
  }, []);

  const obtenerDatosReales = async () => {
    try {
      setCargando(true);
      
      // Consultamos eventos y vacaciones al mismo tiempo
      const [resEventos, resVacaciones] = await Promise.all([
        axios.get(`${API_URL}/api/calendario/eventos`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/calendario/vacaciones`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      procesarMetricas(resEventos.data, resVacaciones.data);
      setError(null);
    } catch (err) {
      console.error('Error cargando métricas de productividad:', err);
      setError('No se pudieron cargar los datos de Productividad y Calendario.');
    } finally {
      setCargando(false);
    }
  };

  const procesarMetricas = (eventos, vacaciones) => {
    const hoy = new Date();
    // Normalizamos hoy a las 00:00:00 para comparaciones precisas
    const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const hace30Dias = new Date(inicioHoy.getTime() - (30 * 24 * 60 * 60 * 1000));
    const en30Dias = new Date(inicioHoy.getTime() + (30 * 24 * 60 * 60 * 1000));

    // 1. Filtrar Eventos (Próximos 30 días para carga de trabajo)
    const eventosProximoMes = eventos.filter(ev => {
      const fechaEv = new Date(ev.fecha_inicio);
      return fechaEv >= inicioHoy && fechaEv <= en30Dias;
    });

    const totalEventosProximos = eventosProximoMes.length;
    const totalTareas = eventosProximoMes.filter(e => e.tipo_evento === 'TAREA').length;
    const totalReuniones = eventosProximoMes.filter(e => e.tipo_evento === 'REUNION').length;

    // Vacaciones activas o pendientes
    const vacacionesActivas = vacaciones.filter(v => v.estado === 'PENDIENTE' || v.estado === 'APROBADO').length;

    // --- KPIs ---
    setKpis([
      { titulo: 'Eventos (Próx. 30 días)', valor: totalEventosProximos, icono: iconosDashboard.eventos, colorClass: 'cm-kpi-blue', tendencia: 'Próximos 30 días' },
      { titulo: 'Tareas Programadas', valor: totalTareas, icono: iconosDashboard.tareas, colorClass: 'cm-kpi-green', tendencia: 'Próximos 30 días' },
      { titulo: 'Reuniones Agendadas', valor: totalReuniones, icono: iconosDashboard.reuniones, colorClass: 'cm-kpi-purple', tendencia: 'Próximos 30 días' },
      { titulo: 'Permisos / Vacaciones', valor: vacacionesActivas, icono: iconosDashboard.vacaciones, colorClass: 'cm-kpi-orange', tendencia: 'Activos o Pendientes' }
    ]);

    // --- 2. Gráfico de Barras: Carga de trabajo próximos 7 días ---
    const proximos7Dias = [];
    for (let i = 0; i <= 6; i++) {
      const d = new Date(inicioHoy);
      d.setDate(d.getDate() + i);
      proximos7Dias.push({
        fechaPura: d.toISOString().split('T')[0],
        name: i === 0 ? 'Hoy' : d.toLocaleDateString('es-PE', { weekday: 'short' }),
        tareas: 0,
        reuniones: 0,
        otros: 0
      });
    }

    eventos.forEach(ev => {
      const fechaEvStr = new Date(ev.fecha_inicio).toISOString().split('T')[0];
      const diaEncontrado = proximos7Dias.find(d => d.fechaPura === fechaEvStr);
      
      if (diaEncontrado) {
        if (ev.tipo_evento === 'TAREA') diaEncontrado.tareas += 1;
        else if (ev.tipo_evento === 'REUNION') diaEncontrado.reuniones += 1;
        else diaEncontrado.otros += 1;
      }
    });
    setDatosEventosSemana(proximos7Dias);

    // --- 3. Gráfico de Dona: Distribución de Tipos de Eventos (Global) ---
    const conteoTipos = {};
    eventos.forEach(ev => {
      conteoTipos[ev.tipo_evento] = (conteoTipos[ev.tipo_evento] || 0) + 1;
    });
    
    const datosDona = Object.keys(conteoTipos).map(tipo => ({
      name: tipo.replace('_', ' '),
      value: conteoTipos[tipo],
      color: COLORES_TIPO[tipo] || '#95a5a6'
    }));
    setDatosDistribucion(datosDona);

    // --- 4. Próximos 5 eventos más cercanos a hoy ---
    const eventosFuturos = eventos
      .filter(ev => new Date(ev.fecha_inicio) >= inicioHoy)
      .sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio))
      .slice(0, 5);
    setEventosProximos(eventosFuturos);

    // --- 5. Lista de Vacaciones (Últimas 4 solicitudes) ---
    const vacacionesOrdenadas = vacaciones
      .sort((a, b) => new Date(b.fecha_solicitud) - new Date(a.fecha_solicitud))
      .slice(0, 4);
    setVacacionesRecientes(vacacionesOrdenadas);
  };

  // Helpers visuales
  const getBadgeClassEvento = (estado) => {
    switch (estado) {
      case 'COMPLETADO': return 'badge-success';
      case 'EN_CURSO': return 'badge-primary';
      case 'PENDIENTE': return 'badge-warning';
      case 'CANCELADO': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  const getBadgeClassVacacion = (estado) => {
    switch (estado) {
      case 'APROBADO': return 'badge-success';
      case 'PENDIENTE': return 'badge-warning';
      case 'RECHAZADO': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  if (cargando) return <div className="cm-loading-state">Cargando métricas de productividad...</div>;
  if (error) return <div className="cm-error-state">{error}</div>;

  return (
    <div className="cm-dash-container">
      <div className="cm-dash-header">
        <h2 className="cm-dash-title">Productividad y Agenda</h2>
        <p className="cm-dash-subtitle">Métricas en tiempo real de tareas, reuniones y carga laboral</p>
      </div>

      {/* --- SECCIÓN 1: KPIs --- */}
      <div className="cm-kpi-grid">
        {kpis.map((kpi, index) => (
          <div key={index} className={`cm-kpi-card ${kpi.colorClass}`}>
            <div className="cm-kpi-header">
              <div className="cm-kpi-icon-wrapper">
                <Icon path={kpi.icono} size={24} />
              </div>
              <span className="cm-kpi-trend trend-neutral">
                {kpi.tendencia}
              </span>
            </div>
            <div className="cm-kpi-body">
              <h3 className="cm-kpi-value">{kpi.valor}</h3>
              <p className="cm-kpi-label">{kpi.titulo}</p>
            </div>
          </div>
        ))}
      </div>

      {/* --- SECCIÓN 2: Gráficos --- */}
      <div className="cm-charts-grid">
        {/* Gráfico de Barras Apiladas (Carga de los próximos 7 días) */}
        <div className="cm-card">
          <div className="cm-card-header">
            <h3 className="cm-card-title">Carga de Trabajo (Próx. 7 días)</h3>
          </div>
          <div className="cm-card-body" style={{ minHeight: '320px' }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosEventosSemana} margin={{ top: 10, right: 30, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e6ed" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#7f8c8d', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7f8c8d', fontSize: 12 }} allowDecimals={false} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  cursor={{fill: 'rgba(0,0,0,0.02)'}}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                <Bar dataKey="tareas" name="Tareas" stackId="a" fill="#3498db" radius={[0,0,4,4]} barSize={30} />
                <Bar dataKey="reuniones" name="Reuniones" stackId="a" fill="#9b59b6" />
                <Bar dataKey="otros" name="Otros" stackId="a" fill="#95a5a6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Dona */}
        <div className="cm-card">
          <div className="cm-card-header">
            <h3 className="cm-card-title">Distribución de Actividades</h3>
          </div>
          <div className="cm-card-body" style={{ minHeight: '320px', display: 'flex', justifyContent: 'center' }}>
            {datosDistribucion.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={datosDistribucion}
                    cx="50%" cy="45%"
                    innerRadius={65} outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {datosDistribucion.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => [`${value} items`, 'Cantidad']} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ alignSelf: 'center', color: '#999' }}>No hay eventos registrados.</p>
            )}
          </div>
        </div>
      </div>

      {/* --- SECCIÓN 3: Tablas y Listas --- */}
      <div className="cm-tables-grid">
        
        {/* Tabla Próximos Eventos */}
        <div className="cm-card cm-card-table">
          <div className="cm-card-header">
            <h3 className="cm-card-title">Eventos Próximos</h3>
          </div>
          <div className="cm-table-responsive">
            <table className="cm-table">
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Tipo</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {eventosProximos.length === 0 && (
                  <tr><td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>No hay eventos próximos agendados.</td></tr>
                )}
                {eventosProximos.map((ev) => (
                  <tr key={ev.id}>
                    <td className="font-medium text-blue">{ev.titulo}</td>
                    <td>{ev.tipo_evento.replace('_', ' ')}</td>
                    <td className="text-muted">
                      {new Date(ev.fecha_inicio).toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' })}
                      {!ev.es_todo_el_dia && ` - ${new Date(ev.fecha_inicio).toLocaleTimeString('es-PE', {hour: '2-digit', minute:'2-digit'})}`}
                    </td>
                    <td>
                      <span className={`cm-badge ${getBadgeClassEvento(ev.estado)}`}>
                        {ev.estado.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lista de Permisos/Vacaciones */}
        <div className="cm-card">
          <div className="cm-card-header">
            <h3 className="cm-card-title">Solicitudes Recientes (Personal)</h3>
          </div>
          <div className="cm-list-group">
            {vacacionesRecientes.length === 0 ? (
              <p style={{ padding: '20px', textAlign: 'center', color: '#999' }}>No hay solicitudes de vacaciones recientes.</p>
            ) : (
              vacacionesRecientes.map((vac) => (
                <div key={vac.id} className="cm-list-item">
                  <div className="cm-item-info">
                    <div className="cm-item-avatar" style={{background: 'rgba(243, 156, 18, 0.15)', color: '#f39c12'}}>
                      <Icon path={iconosDashboard.vacaciones} size={18} />
                    </div>
                    <div>
                      <h4 className="cm-item-title">{vac.usuario?.nombre} {vac.usuario?.apellidos}</h4>
                      <span className="cm-item-stock text-muted">
                        Del {new Date(vac.fecha_inicio).toLocaleDateString('es-PE')} al {new Date(vac.fecha_fin).toLocaleDateString('es-PE')}
                      </span>
                    </div>
                  </div>
                  <div className="cm-item-action">
                    <span className={`cm-badge ${getBadgeClassVacacion(vac.estado)}`}>
                      {vac.estado}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}