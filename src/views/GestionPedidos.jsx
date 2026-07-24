import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './GestionPedidos.css';

const GestionPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [busqueda, setBusqueda] = useState('');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const obtenerPedidos = async () => {
    try {
      setCargando(true);
      const { data } = await axios.get(`${API_URL}/api/pedidos/admin/todos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPedidos(data.pedidos || data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar pedidos:', err);
      setError('No se pudieron cargar los pedidos del servidor. Verifica que el backend esté encendido.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerPedidos();
  }, []);

  const cambiarEstadoPedido = async (idPedido, nuevoEstado) => {
    try {
      await axios.put(`${API_URL}/api/pedidos/admin/${idPedido}/estado`, 
        { estado_pedido: nuevoEstado },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Actualizar localmente
      setPedidos(pedidos.map(p => p.id === idPedido ? { ...p, estado_pedido: nuevoEstado } : p));
      if (pedidoSeleccionado && pedidoSeleccionado.id === idPedido) {
        setPedidoSeleccionado({ ...pedidoSeleccionado, estado_pedido: nuevoEstado });
      }
      alert(`Estado actualizado exitosamente a ${nuevoEstado}`);
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      alert('Hubo un error al actualizar el estado del pedido.');
    }
  };

  const pedidosFiltrados = pedidos.filter(pedido => {
    const cumpleEstado = filtroEstado === 'TODOS' || pedido.estado_pedido === filtroEstado;
    const textoBusqueda = busqueda.toLowerCase();
    const clienteNombre = `${pedido.cliente_nombres || ''} ${pedido.cliente_apellidos || ''}`.toLowerCase();
    const documento = (pedido.numero_documento || '').toLowerCase();
    const idPedidoStr = String(pedido.id);

    const cumpleBusqueda = clienteNombre.includes(textoBusqueda) || 
                           documento.includes(textoBusqueda) || 
                           idPedidoStr.includes(textoBusqueda);
    return cumpleEstado && cumpleBusqueda;
  });

  return (
    <div className="gp-container">
      <div className="gp-header-section">
        <h2>Gestión y Administración de Pedidos</h2>
        <p>Administra los pedidos de invitados (cotizaciones) y usuarios registrados para validar pagos y stock.</p>
      </div>

      {/* Filtros y Buscador */}
      <div className="gp-filters-bar">
        <div className="gp-search-box">
          <input 
            type="text" 
            placeholder="Buscar por ID, cliente o DNI/RUC..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="gp-status-filters">
          <button className={filtroEstado === 'TODOS' ? 'active' : ''} onClick={() => setFiltroEstado('TODOS')}>Todos</button>
          <button className={filtroEstado === 'PENDIENTE' ? 'active' : ''} onClick={() => setFiltroEstado('PENDIENTE')}>Pendientes</button>
          <button className={filtroEstado === 'PAGADO' ? 'active' : ''} onClick={() => setFiltroEstado('PAGADO')}>Pagados</button>
          <button className={filtroEstado === 'RECHAZADO' ? 'active' : ''} onClick={() => setFiltroEstado('RECHAZADO')}>Rechazados</button>
        </div>
      </div>

      {error && <div className="gp-error-banner">{error}</div>}

      {/* Tabla de Pedidos */}
      <div className="gp-table-container">
        {cargando ? (
          <div className="gp-loading">Cargando pedidos...</div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="gp-empty">No se encontraron pedidos con los filtros seleccionados.</div>
        ) : (
          <table className="gp-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Tipo / Contacto</th>
                <th>Método Pago</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map((pedido) => (
                <tr key={pedido.id}>
                  <td><strong>#{pedido.id}</strong></td>
                  <td>
                    <div className="gp-client-info">
                      <span className="gp-name">{pedido.cliente_nombres} {pedido.cliente_apellidos}</span>
                      <span className="gp-doc">{pedido.tipo_documento}: {pedido.numero_documento || 'N/A'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="gp-contact-info">
                      <span>{pedido.cliente_email}</span>
                      <span className="gp-phone">{pedido.cliente_telefono}</span>
                    </div>
                  </td>
                  <td>{pedido.metodo_pago || 'Contra Entrega / Cotización'}</td>
                  <td><strong>S/ {Number(pedido.total).toFixed(2)}</strong></td>
                  <td>
                    <span className={`gp-badge ${pedido.estado_pedido?.toLowerCase()}`}>
                      {pedido.estado_pedido}
                    </span>
                  </td>
                  <td>
                    <div className="gp-actions">
                      <button 
                        className="gp-btn-view" 
                        onClick={() => setPedidoSeleccionado(pedido)}
                        title="Ver detalles"
                      >
                        Ver Detalle
                      </button>
                      {pedido.estado_pedido === 'PENDIENTE' && (
                        <>
                          <button 
                            className="gp-btn-success" 
                            onClick={() => cambiarEstadoPedido(pedido.id, 'PAGADO')}
                            title="Confirmar Pago y Bajar Stock"
                          >
                            Aprobar Pago
                          </button>
                          <button 
                            className="gp-btn-danger" 
                            onClick={() => cambiarEstadoPedido(pedido.id, 'RECHAZADO')}
                            title="Rechazar pedido"
                          >
                            Rechazar
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de Detalle de Pedido */}
      {pedidoSeleccionado && (
        <div className="gp-modal-overlay" onClick={() => setPedidoSeleccionado(null)}>
          <div className="gp-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="gp-modal-header">
              <h3>Detalles del Pedido #{pedidoSeleccionado.id}</h3>
              <button className="gp-close-btn" onClick={() => setPedidoSeleccionado(null)}>&times;</button>
            </div>
            
            <div className="gp-modal-body">
              <div className="gp-grid-info">
                <div>
                  <h4>Información del Cliente</h4>
                  <p><strong>Nombres:</strong> {pedidoSeleccionado.cliente_nombres} {pedidoSeleccionado.cliente_apellidos}</p>
                  <p><strong>Email:</strong> {pedidoSeleccionado.cliente_email}</p>
                  <p><strong>Teléfono:</strong> {pedidoSeleccionado.cliente_telefono}</p>
                  <p><strong>{pedidoSeleccionado.tipo_documento}:</strong> {pedidoSeleccionado.numero_documento}</p>
                  {pedidoSeleccionado.razon_social && (
                    <>
                      <p><strong>Razón Social:</strong> {pedidoSeleccionado.razon_social}</p>
                      <p><strong>Dir. Fiscal:</strong> {pedidoSeleccionado.direccion_fiscal}</p>
                    </>
                  )}
                </div>
                <div>
                  <h4>Datos de Envíos y Totales</h4>
                  <p><strong>Dirección:</strong> {pedidoSeleccionado.direccion_envio_texto || 'No especificada'}</p>
                  <p><strong>Ciudad / Distrito:</strong> {pedidoSeleccionado.ciudad || 'Lima'}</p>
                  <p><strong>Método de Pago:</strong> {pedidoSeleccionado.metodo_pago}</p>
                  <p><strong>Estado Actual:</strong> <span className={`gp-badge ${pedidoSeleccionado.estado_pedido?.toLowerCase()}`}>{pedidoSeleccionado.estado_pedido}</span></p>
                  <p><strong>Subtotal:</strong> S/ {Number(pedidoSeleccionado.subtotal || 0).toFixed(2)}</p>
                  <p><strong>IGV (18%):</strong> S/ {Number(pedidoSeleccionado.igv_total || 0).toFixed(2)}</p>
                  <p className="gp-total-modal"><strong>Total a Pagar:</strong> S/ {Number(pedidoSeleccionado.total || 0).toFixed(2)}</p>
                </div>
              </div>

              <div className="gp-modal-actions-bar">
                {pedidoSeleccionado.estado_pedido === 'PENDIENTE' && (
                  <>
                    <button 
                      className="gp-btn-success gp-btn-large" 
                      onClick={() => cambiarEstadoPedido(pedidoSeleccionado.id, 'PAGADO')}
                    >
                      Confirmar Pago (Aprobar)
                    </button>
                    <button 
                      className="gp-btn-danger gp-btn-large" 
                      onClick={() => cambiarEstadoPedido(pedidoSeleccionado.id, 'RECHAZADO')}
                    >
                      Rechazar Pedido
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionPedidos;