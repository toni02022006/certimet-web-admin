import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

// 👇 AQUÍ ESTÁ LA CORRECCIÓN DE LA RUTA 👇
import DashboardCalendario from '../components/dashboard/DashboardCalendario'; 
import DashboardSeguimiento from '../components/dashboard/DashboardSeguimiento';
import './Dashboard.css';

// --- Subcomponente Icon ---
const Icon = ({ path, size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

const iconosDashboard = {
  ventas: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  pedidos: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
  clientes: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
  ticket: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
};

const COLORES_ESTADO = {
  'ENTREGADO': '#2ecc71',
  'PAGADO': '#3498db',
  'EN_PREPARACION': '#9b59b6',
  'ENVIADO': '#8e44ad',
  'EN_TRANSITO': '#f1c40f',
  'PENDIENTE': '#f39c12',
  'CANCELADO': '#e74c3c'
};

// =========================================================
// COMPONENTE INTERNO: DASHBOARD DE VENTAS 
// =========================================================
const DashboardVentas = () => {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  
  const [kpis, setKpis] = useState([]);
  const [datosVentas, setDatosVentas] = useState([]);
  const [datosEstado, setDatosEstado] = useState([]);
  const [pedidosRecientes, setPedidosRecientes] = useState([]);
  const [productosTop, setProductosTop] = useState([]);

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  
  // 🔥 CORRECCIÓN PARA PRODUCCIÓN: URL base apuntando al backend real
  const API_URL = import.meta.env.VITE_API_URL || 'https://api.certimet.pe';

  useEffect(() => {
    obtenerDatosReales();
  }, []);

  const obtenerDatosReales = async () => {
    try {
      setCargando(true);
      const { data } = await axios.get(`${API_URL}/api/pedidos/admin/todos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const pedidos = data.pedidos || data;
      procesarMeticas(pedidos);
      setError(null);
    } catch (err) {
      console.error('Error cargando métricas:', err);
      setError('No se pudieron cargar los datos del Dashboard.');
    } finally {
      setCargando(false);
    }
  };

  const procesarMeticas = (pedidos) => {
    const hoy = new Date();
    const hace30Dias = new Date(hoy.getTime() - (30 * 24 * 60 * 60 * 1000));
    const pedidosUltimos30Dias = pedidos.filter(p => new Date(p.fecha_pedido) >= hace30Dias);

    let ingresosTotales = 0;
    const clientesUnicos = new Set();
    
    pedidosUltimos30Dias.forEach(p => {
      if (p.estado_pedido !== 'CANCELADO') ingresosTotales += Number(p.total);
      if (p.cliente_email) clientesUnicos.add(p.cliente_email);
    });

    const cantidadPedidos = pedidosUltimos30Dias.length;
    const ticketPromedio = cantidadPedidos > 0 ? (ingresosTotales / cantidadPedidos) : 0;

    setKpis([
      { titulo: 'Ingresos (30 días)', valor: `S/ ${ingresosTotales.toFixed(2)}`, icono: iconosDashboard.ventas, colorClass: 'cm-kpi-blue', tendencia: 'Últimos 30 días' },
      { titulo: 'Nuevos Pedidos', valor: cantidadPedidos, icono: iconosDashboard.pedidos, colorClass: 'cm-kpi-green', tendencia: 'Últimos 30 días' },
      { titulo: 'Clientes Activos', valor: clientesUnicos.size, icono: iconosDashboard.clientes, colorClass: 'cm-kpi-purple', tendencia: 'Únicos (30 días)' },
      { titulo: 'Ticket Promedio', valor: `S/ ${ticketPromedio.toFixed(2)}`, icono: iconosDashboard.ticket, colorClass: 'cm-kpi-orange', tendencia: 'Por pedido' }
    ]);

    const ultimos7Dias = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      ultimos7Dias.push({
        fechaPura: d.toISOString().split('T')[0],
        name: d.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric' }),
        ventas: 0
      });
    }

    pedidos.forEach(p => {
      if (p.estado_pedido === 'CANCELADO') return;
      const fechaPedido = new Date(p.fecha_pedido).toISOString().split('T')[0];
      const diaEncontrado = ultimos7Dias.find(d => d.fechaPura === fechaPedido);
      if (diaEncontrado) {
        diaEncontrado.ventas += Number(p.total);
      }
    });
    setDatosVentas(ultimos7Dias);

    const conteoEstados = {};
    pedidos.forEach(p => {
      conteoEstados[p.estado_pedido] = (conteoEstados[p.estado_pedido] || 0) + 1;
    });
    
    const datosDona = Object.keys(conteoEstados).map(estado => ({
      name: estado.replace('_', ' '),
      value: conteoEstados[estado],
      color: COLORES_ESTADO[estado] || '#95a5a6'
    }));
    setDatosEstado(datosDona);

    setPedidosRecientes(pedidos.slice(0, 5));

    const conteoProductos = {};
    pedidosUltimos30Dias.forEach(pedido => {
      if (pedido.estado_pedido === 'CANCELADO') return;
      if (!pedido.detalles) return;
      
      pedido.detalles.forEach(detalle => {
        const prodId = detalle.producto?.id;
        if (!prodId) return;
        
        if (!conteoProductos[prodId]) {
          conteoProductos[prodId] = {
            nombre: detalle.producto.nombre,
            ventas: 0,
            stock: detalle.producto.stock || 0
          };
        }
        conteoProductos[prodId].ventas += detalle.cantidad;
      });
    });

    const topArr = Object.values(conteoProductos)
      .sort((a, b) => b.ventas - a.ventas)
      .slice(0, 4);
    setProductosTop(topArr);
  };

  const getBadgeClass = (estado) => {
    switch (estado) {
      case 'ENTREGADO': return 'badge-success';
      case 'PENDIENTE': return 'badge-warning';
      case 'PAGADO': return 'badge-info';
      case 'EN_PREPARACION': return 'badge-purple';
      case 'ENVIADO': case 'EN_TRANSITO': return 'badge-primary';
      case 'CANCELADO': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  if (cargando) return <div className="cm-loading-state">Cargando métricas en tiempo real...</div>;
  if (error) return <div className="cm-error-state">{error}</div>;

  return (
    <div className="cm-dash-container">
      {/* SECCIÓN 1: KPIs Reales */}
      <div className="cm-kpi-grid">
        {kpis.map((kpi, index) => (
          <div key={index} className={`cm-kpi-card ${kpi.colorClass}`}>
            <div className="cm-kpi-header">
              <div className="cm-kpi-icon-wrapper">
                <Icon path={kpi.icono} size={24} />
              </div>
              <span className="cm-kpi-trend trend-up">
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

      {/* SECCIÓN 2: Gráficos */}
      <div className="cm-charts-grid">
        <div className="cm-card">
          <div className="cm-card-header">
            <h3 className="cm-card-title">Ventas de los últimos 7 días (S/)</h3>
          </div>
          <div className="cm-card-body" style={{ minHeight: '320px' }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={datosVentas} margin={{ top: 10, right: 30, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e6ed" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#7f8c8d', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7f8c8d', fontSize: 12 }} tickFormatter={(val) => `S/${val}`} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`S/ ${value}`, 'Ventas']}
                />
                <Line type="monotone" dataKey="ventas" stroke="#133a5e" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="cm-card">
          <div className="cm-card-header">
            <h3 className="cm-card-title">Distribución de Estados Global</h3>
          </div>
          <div className="cm-card-body" style={{ minHeight: '320px', display: 'flex', justifyContent: 'center' }}>
            {datosEstado.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={datosEstado}
                    cx="50%" cy="45%"
                    innerRadius={70} outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {datosEstado.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => [`${value} pedidos`, 'Cantidad']} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ alignSelf: 'center', color: '#999' }}>No hay pedidos registrados.</p>
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: Tablas y Listas */}
      <div className="cm-tables-grid">
        <div className="cm-card cm-card-table">
          <div className="cm-card-header">
            <h3 className="cm-card-title">Transacciones Recientes</h3>
          </div>
          <div className="cm-table-responsive">
            <table className="cm-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {pedidosRecientes.length === 0 && (
                  <tr><td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>No hay pedidos recientes</td></tr>
                )}
                {pedidosRecientes.map((pedido) => (
                  <tr key={pedido.id}>
                    <td className="font-medium text-blue">#{pedido.id}</td>
                    <td>{pedido.cliente_nombres ? `${pedido.cliente_nombres} ${pedido.cliente_apellidos || ''}` : (pedido.cliente_email || 'Cliente Web')}</td>
                    <td className="text-muted">{new Date(pedido.fecha_pedido).toLocaleDateString('es-PE')}</td>
                    <td>
                      <span className={`cm-badge ${getBadgeClass(pedido.estado_pedido)}`}>
                        {pedido.estado_pedido.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="text-right font-bold">S/ {Number(pedido.total).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="cm-card">
          <div className="cm-card-header">
            <h3 className="cm-card-title">Top 4 Productos (Últimos 30 días)</h3>
          </div>
          <div className="cm-list-group">
            {productosTop.length === 0 ? (
              <p style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Aún no hay ventas recientes.</p>
            ) : (
              productosTop.map((prod, idx) => (
                <div key={idx} className="cm-list-item">
                  <div className="cm-item-info">
                    <div className="cm-item-avatar">{idx + 1}</div>
                    <div>
                      <h4 className="cm-item-title">{prod.nombre}</h4>
                      <span className={`cm-item-stock ${prod.stock < 5 ? 'text-danger' : 'text-muted'}`}>
                        {prod.stock} en stock
                      </span>
                    </div>
                  </div>
                  <div className="cm-item-action">
                    <span className="cm-badge badge-primary">{prod.ventas} un.</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


// =========================================================
// COMPONENTE PRINCIPAL: CONTENEDOR DE PESTAÑAS (TABS)
// =========================================================
export default function DashboardMaster() {
  const [vistaActiva, setVistaActiva] = useState('ventas');

  return (
    <div className="cm-dash-master-wrapper">
      
      {/* Sistema de Pestañas Elegante (Pill Tabs) */}
      <div className="cm-dash-tabs-container">
        <button 
          className={`cm-dash-tab ${vistaActiva === 'ventas' ? 'active' : ''}`}
          onClick={() => setVistaActiva('ventas')}
        >
          Resumen Tienda y Ventas
        </button>
        <button 
          className={`cm-dash-tab ${vistaActiva === 'calendario' ? 'active' : ''}`}
          onClick={() => setVistaActiva('calendario')}
        >
          Productividad y Calendario
        </button>
        <button 
          className={`cm-dash-tab ${vistaActiva === 'seguimiento' ? 'active' : ''}`}
          onClick={() => setVistaActiva('seguimiento')}
        >
          Seguimiento de Equipo
        </button>
      </div>

      {/* Área de Renderizado Condicional */}
      <div className="cm-dash-content-area">
        {vistaActiva === 'ventas' && <DashboardVentas />}
        {vistaActiva === 'calendario' && <DashboardCalendario />}
        {vistaActiva === 'seguimiento' && <DashboardSeguimiento />}
      </div>

    </div>
  );
}