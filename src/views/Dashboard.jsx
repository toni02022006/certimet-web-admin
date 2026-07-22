import React from 'react';

export default function Dashboard() {
  const kpis = [
    { titulo: 'Ventas del Mes', valor: 'S/ 15,430.00', icono: '💰', color: '#28a745' },
    { titulo: 'Pedidos Nuevos', valor: '42', icono: '📦', color: '#007bff' },
    { titulo: 'Clientes Activos', valor: '128', icono: '👥', color: '#17a2b8' },
    { titulo: 'Tasa de Conversión', valor: '3.2%', icono: '📈', color: '#ffc107' }
  ];

  const pedidosRecientes = [
    { id: 'PED-1042', cliente: 'Constructora Arinco', producto: 'Anemómetro Kestrel 3500', fecha: '06 Jul 2026', estado: 'Enviado', total: 'S/ 1,250.00' },
    { id: 'PED-1043', cliente: 'Minera Los Andes', producto: 'Calibrador Vernier Digital', fecha: '05 Jul 2026', estado: 'Pendiente', total: 'S/ 340.00' },
    { id: 'PED-1044', cliente: 'Ingeniería SAC', producto: 'BConnect Plus Data Logger', fecha: '04 Jul 2026', estado: 'Entregado', total: 'S/ 4,800.00' },
    { id: 'PED-1045', cliente: 'Carlos Mendoza', producto: 'Termómetro Infrarrojo', fecha: '03 Jul 2026', estado: 'Cancelado', total: 'S/ 180.00' }
  ];

  const productosTop = [
    { nombre: 'Anemómetro Kestrel 3500', ventas: 15 },
    { nombre: 'BConnect Plus Data Logger', ventas: 12 },
    { nombre: 'Multímetro Fluke 117', ventas: 8 }
  ];

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Enviado': return { bg: '#d4edda', text: '#155724' };
      case 'Pendiente': return { bg: '#fff3cd', text: '#856404' };
      case 'Entregado': return { bg: '#cce5ff', text: '#004085' };
      case 'Cancelado': return { bg: '#f8d7da', text: '#721c24' };
      default: return { bg: '#e2e3e5', text: '#383d41' };
    }
  };

  const styles = {
    container: {
      padding: '10px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    },
    tituloSec: {
      color: '#002f6c',
      marginBottom: '10px',
      fontSize: '20px',
    },
    kpiGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '15px',
      marginBottom: '15px',
    },
    kpiCard: {
      backgroundColor: '#fff',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    kpiIcono: { fontSize: '24px' },
    kpiTitulo: { margin: 0, color: '#6c757d', fontSize: '12px', fontWeight: 'bold' },
    kpiValor: { margin: '2px 0 0 0', color: '#333', fontSize: '20px' },
    contentGrid: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '15px',
      flex: 1,
      minHeight: 0,
    },
    card: {
      backgroundColor: '#fff',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    },
    cardTitulo: {
      marginTop: 0,
      color: '#333',
      borderBottom: '2px solid #f4f6f9',
      paddingBottom: '8px',
      marginBottom: '10px',
      fontSize: '16px',
    },
    tableWrapper: {
      overflow: 'auto',
      flex: 1,
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '12px',
    },
    th: {
      backgroundColor: '#f8f9fa',
      padding: '6px 8px',
      textAlign: 'left',
      borderBottom: '2px solid #dee2e6',
      color: '#495057',
    },
    td: {
      padding: '6px 8px',
      borderBottom: '1px solid #dee2e6',
      color: '#333',
    },
    badge: {
      padding: '3px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 'bold',
    },
    listaTop: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      flex: 1,
    },
    itemTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0',
      borderBottom: '1px solid #f4f6f9',
      fontSize: '13px',
      color: '#333',
    },
    badgeTop: {
      backgroundColor: '#002f6c',
      color: '#fff',
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 'bold',
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.tituloSec}>Resumen de la Tienda</h2>

      <div style={styles.kpiGrid}>
        {kpis.map((kpi, index) => (
          <div key={index} style={{...styles.kpiCard, borderLeft: `5px solid ${kpi.color}`}}>
            <div style={styles.kpiIcono}>{kpi.icono}</div>
            <div>
              <p style={styles.kpiTitulo}>{kpi.titulo}</p>
              <h3 style={styles.kpiValor}>{kpi.valor}</h3>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.contentGrid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitulo}>Últimos Pedidos</h3>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Cliente</th>
                  <th style={styles.th}>Producto</th>
                  <th style={styles.th}>Fecha</th>
                  <th style={styles.th}>Estado</th>
                  <th style={styles.th}>Total</th>
                </tr>
              </thead>
              <tbody>
                {pedidosRecientes.map((pedido) => {
                  const colores = getEstadoColor(pedido.estado);
                  return (
                    <tr key={pedido.id}>
                      <td style={styles.td}><strong>{pedido.id}</strong></td>
                      <td style={styles.td}>{pedido.cliente}</td>
                      <td style={styles.td}>{pedido.producto}</td>
                      <td style={styles.td}>{pedido.fecha}</td>
                      <td style={styles.td}>
                        <span style={{...styles.badge, backgroundColor: colores.bg, color: colores.text}}>
                          {pedido.estado}
                        </span>
                      </td>
                      <td style={{...styles.td, fontWeight: 'bold'}}>{pedido.total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitulo}>Top Ventas (Mes)</h3>
          <ul style={styles.listaTop}>
            {productosTop.map((prod, idx) => (
              <li key={idx} style={styles.itemTop}>
                <span>{prod.nombre}</span>
                <span style={styles.badgeTop}>{prod.ventas} un.</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}