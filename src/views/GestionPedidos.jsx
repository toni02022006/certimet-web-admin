import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './GestionPedidos.css';

const ESTADOS_VALIDOS = [
  'PENDIENTE', 'PAGADO', 'EN_PREPARACION',
  'DESPACHADO', 'EN_TRANSITO', 'EN_REPARTO', 'ENTREGADO', 'CANCELADO'
];

const GestionPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [busqueda, setBusqueda] = useState('');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [paginaInput, setPaginaInput] = useState('');

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const API_URL = import.meta.env.VITE_API_URL;

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
      const { data } = await axios.put(`${API_URL}/api/pedidos/admin/${idPedido}/estado`, 
        { estado_pedido: nuevoEstado },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Actualizar lista
      setPedidos(pedidos.map(p => p.id === idPedido ? { ...p, estado_pedido: nuevoEstado } : p));
      if (pedidoSeleccionado && pedidoSeleccionado.id === idPedido) {
        setPedidoSeleccionado({ ...pedidoSeleccionado, estado_pedido: nuevoEstado });
      }

      // Mostrar mensaje de éxito
      Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        text: `El pedido #${idPedido} ahora está ${nuevoEstado.replace('_', ' ')}`,
        timer: 2000,
        showConfirmButton: false
      });

    } catch (err) {
      console.error('Error al actualizar estado:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.error || 'Hubo un error al actualizar el estado del pedido.'
      });
    }
  };

  // Función específica para cancelar con confirmación
  const handleCancelarPedido = async (pedido) => {
    if (pedido.estado_pedido === 'CANCELADO' || pedido.estado_pedido === 'ENTREGADO') {
      Swal.fire('No disponible', 'Este pedido ya no se puede cancelar', 'info');
      return;
    }

    const result = await Swal.fire({
      title: `¿Cancelar pedido #${pedido.id}?`,
      html: `
        <p><strong>Cliente:</strong> ${pedido.cliente_nombres} ${pedido.cliente_apellidos}</p>
        <p><strong>Total:</strong> S/ ${Number(pedido.total).toFixed(2)}</p>
        <p style="color: #dc2626; margin-top: 1rem;">
          ${pedido.estado_pedido === 'PAGADO' ? '⚠️ El pedido ya está pagado. Se devolverá el stock automáticamente, pero deberás gestionar el reembolso en MercadoPago.' : 'El pedido está pendiente, solo se cambiará el estado.'}
        </p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Cancelar acción'
    });

    if (result.isConfirmed) {
      await cambiarEstadoPedido(pedido.id, 'CANCELADO');
    }
  };

  // Estadísticas
  const totalPedidos = pedidos.length;
  const pendientes = pedidos.filter(p => p.estado_pedido === 'PENDIENTE').length;
  const pagados = pedidos.filter(p => p.estado_pedido === 'PAGADO').length;
  const enTransito = pedidos.filter(p => p.estado_pedido === 'EN_TRANSITO').length;
  const entregados = pedidos.filter(p => p.estado_pedido === 'ENTREGADO').length;

  // Filtrado
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

  // Paginación
  const indexUltimo = paginaActual * filasPorPagina;
  const indexPrimero = indexUltimo - filasPorPagina;
  const pedidosPaginados = pedidosFiltrados.slice(indexPrimero, indexUltimo);
  const totalPaginas = Math.ceil(pedidosFiltrados.length / filasPorPagina);

  const cambiarPagina = (numero) => {
    if (numero >= 1 && numero <= totalPaginas) {
      setPaginaActual(numero);
      setPaginaInput('');
    }
  };

  const irPaginaInput = (e) => {
    e.preventDefault();
    const num = parseInt(paginaInput);
    if (!isNaN(num) && num >= 1 && num <= totalPaginas) {
      cambiarPagina(num);
    } else {
      setPaginaInput('');
    }
  };

  useEffect(() => {
    setPaginaActual(1);
  }, [filtroEstado, busqueda, filasPorPagina]);

  const getRangoPaginas = () => {
    const delta = 3;
    const rango = [];
    const inicio = Math.max(1, paginaActual - delta);
    const fin = Math.min(totalPaginas, paginaActual + delta);
    for (let i = inicio; i <= fin; i++) {
      rango.push(i);
    }
    return rango;
  };

  const renderProductos = (pedido) => {
    const detalles = pedido.detalles || [];
    if (!detalles || detalles.length === 0) {
      return <span className="gp-sin-productos">Sin productos</span>;
    }
    return detalles.map((item, idx) => {
      const nombre = item.producto?.nombre || 'Producto';
      const cantidad = item.cantidad || 1;
      return (
        <div key={idx} className="gp-producto-item">
          <span className="gp-producto-nombre" title={nombre}>
            {nombre}
          </span>
          <span className="gp-producto-cantidad">×{cantidad}</span>
        </div>
      );
    });
  };

  return (
    <div className="gp-container">
      {/* Cabecera con estadísticas */}
      <div className="gp-header">
        <div className="gp-header-left">
          <h1>Gestión de Pedidos</h1>
          <p>Administra y actualiza el estado de todos los pedidos</p>
        </div>
        <div className="gp-stats">
          <div className="gp-stat-item"><span>Total</span><strong>{totalPedidos}</strong></div>
          <div className="gp-stat-item"><span>Pendientes</span><strong>{pendientes}</strong></div>
          <div className="gp-stat-item"><span>Pagados</span><strong>{pagados}</strong></div>
          <div className="gp-stat-item"><span>En tránsito</span><strong>{enTransito}</strong></div>
          <div className="gp-stat-item"><span>Entregados</span><strong>{entregados}</strong></div>
        </div>
      </div>

      {/* Barra de filtros */}
      <div className="gp-filters-bar">
        <div className="gp-search-wrapper">
          <input 
            type="text" 
            placeholder="Buscar por ID, cliente o DNI/RUC..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="gp-status-filters">
          {['TODOS', 'PENDIENTE', 'PAGADO', 'EN_TRANSITO', 'ENTREGADO'].map(estado => (
            <button 
              key={estado}
              className={filtroEstado === estado ? 'active' : ''}
              onClick={() => setFiltroEstado(estado)}
            >
              {estado === 'TODOS' ? 'Todos' : estado.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="gp-rows-selector">
          <span>Mostrar</span>
          <select value={filasPorPagina} onChange={(e) => setFilasPorPagina(Number(e.target.value))}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {error && <div className="gp-error-banner">{error}</div>}

      {/* Tabla */}
      <div className="gp-table-wrapper">
        {cargando ? (
          <div className="gp-loading">Cargando pedidos...</div>
        ) : pedidosPaginados.length === 0 ? (
          <div className="gp-empty">No se encontraron pedidos con los filtros seleccionados.</div>
        ) : (
          <table className="gp-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Contacto</th>
                <th>Productos</th>
                <th>Método de Pago</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidosPaginados.map((pedido) => (
                <tr key={pedido.id}>
                  <td><span className="gp-id">#{pedido.id}</span></td>
                  <td>
                    <div className="gp-client">
                      <span className="gp-name">{pedido.cliente_nombres} {pedido.cliente_apellidos}</span>
                      <span className="gp-doc">{pedido.tipo_documento}: {pedido.numero_documento || 'N/A'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="gp-contact">
                      <span>{pedido.cliente_email}</span>
                      <span className="gp-phone">{pedido.cliente_telefono}</span>
                    </div>
                  </td>
                  <td className="gp-productos-col">
                    {renderProductos(pedido)}
                  </td>
                  <td>{pedido.metodo_pago || 'Contra Entrega'}</td>
                  <td><strong>S/ {Number(pedido.total).toFixed(2)}</strong></td>
                  <td>
                    <select 
                      className={`gp-status-select ${pedido.estado_pedido?.toLowerCase()}`}
                      value={pedido.estado_pedido}
                      onChange={(e) => cambiarEstadoPedido(pedido.id, e.target.value)}
                    >
                      {ESTADOS_VALIDOS.map(estado => (
                        <option key={estado} value={estado}>
                          {estado.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div className="gp-actions">
                      <button 
                        className="gp-btn-view" 
                        onClick={() => setPedidoSeleccionado(pedido)}
                      >
                        Ver Detalle
                      </button>
                      {pedido.estado_pedido === 'PENDIENTE' && (
                        <>
                          <button 
                            className="gp-btn-success" 
                            onClick={() => cambiarEstadoPedido(pedido.id, 'PAGADO')}
                          >
                            Aprobar
                          </button>
                          <button 
                            className="gp-btn-danger" 
                            onClick={() => cambiarEstadoPedido(pedido.id, 'CANCELADO')}
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

      {/* Paginación */}
      {!cargando && pedidosFiltrados.length > 0 && (
        <div className="gp-pagination">
          <div className="gp-pagination-info">
            Mostrando {indexPrimero + 1} - {Math.min(indexUltimo, pedidosFiltrados.length)} de {pedidosFiltrados.length} pedidos
          </div>
          <div className="gp-pagination-controls">
            <button onClick={() => cambiarPagina(1)} disabled={paginaActual === 1}>&lt;&lt;</button>
            <button onClick={() => cambiarPagina(paginaActual - 1)} disabled={paginaActual === 1}>&lt;</button>
            {getRangoPaginas().map(num => (
              <button key={num} className={num === paginaActual ? 'active' : ''} onClick={() => cambiarPagina(num)}>
                {num}
              </button>
            ))}
            <button onClick={() => cambiarPagina(paginaActual + 1)} disabled={paginaActual === totalPaginas}>&gt;</button>
            <button onClick={() => cambiarPagina(totalPaginas)} disabled={paginaActual === totalPaginas}>&gt;&gt;</button>
            <form onSubmit={irPaginaInput} className="gp-pagination-form">
              <span>Ir a</span>
              <input 
                type="number" 
                min="1" 
                max={totalPaginas} 
                value={paginaInput}
                onChange={(e) => setPaginaInput(e.target.value)}
                placeholder="Pág."
              />
              <button type="submit">Ir</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de detalle */}
      {pedidoSeleccionado && (
        <div className="gp-modal-overlay" onClick={() => setPedidoSeleccionado(null)}>
          <div className="gp-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="gp-modal-header">
              <h3>Detalles del Pedido #{pedidoSeleccionado.id}</h3>
              <button className="gp-close-btn" onClick={() => setPedidoSeleccionado(null)}>&times;</button>
            </div>
            <div className="gp-modal-body">
              <div className="gp-modal-grid">
                <div>
                  <h4>👤 Cliente</h4>
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
                  <h4 style={{ marginTop: '1rem' }}>🛒 Productos</h4>
                  {renderProductos(pedidoSeleccionado)}
                </div>
                <div>
                  <h4>📦 Envío y Total</h4>
                  <p><strong>Dirección:</strong> {pedidoSeleccionado.direccion_envio_texto || 'No especificada'}</p>
                  <p><strong>Ciudad / Distrito:</strong> {pedidoSeleccionado.ciudad || 'Lima'}</p>
                  <p><strong>Método de Pago:</strong> {pedidoSeleccionado.metodo_pago}</p>
                  <p>
                    <strong>Estado:</strong>
                    <select 
                      className={`gp-status-select modal-select ${pedidoSeleccionado.estado_pedido?.toLowerCase()}`}
                      value={pedidoSeleccionado.estado_pedido}
                      onChange={(e) => cambiarEstadoPedido(pedidoSeleccionado.id, e.target.value)}
                    >
                      {ESTADOS_VALIDOS.map(estado => (
                        <option key={estado} value={estado}>{estado.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </p>
                  <p><strong>Subtotal:</strong> S/ {Number(pedidoSeleccionado.subtotal || 0).toFixed(2)}</p>
                  <p><strong>IGV (18%):</strong> S/ {Number(pedidoSeleccionado.igv_total || 0).toFixed(2)}</p>
                  <p className="gp-total-modal"><strong>Total a Pagar:</strong> S/ {Number(pedidoSeleccionado.total || 0).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionPedidos;