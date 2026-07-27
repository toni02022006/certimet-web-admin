import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Productos.css';

// Iconos SVG (puedes usar react-icons si lo prefieres)
const IconEdit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const IconDelete = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const IconChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const IconChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(10);
  const navigate = useNavigate();

  const fetchProductos = async () => {
    setCargando(true);
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/productos');
      if (response.ok) {
        const data = await response.json();
        setProductos(data);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  // Resetear página al cambiar búsqueda o itemsPorPagina
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, itemsPorPagina]);

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.sku.toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.categoria?.nombre && p.categoria.nombre.toLowerCase().includes(busqueda.toLowerCase()))
  );

  // Cálculos de paginación
  const totalProductos = productosFiltrados.length;
  const totalPaginas = Math.ceil(totalProductos / itemsPorPagina);
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const indiceFin = Math.min(indiceInicio + itemsPorPagina, totalProductos);
  const productosPaginados = productosFiltrados.slice(indiceInicio, indiceFin);

  const handleCambiarPagina = (nuevaPagina) => {
    if (nuevaPagina < 1 || nuevaPagina > totalPaginas) return;
    setPaginaActual(nuevaPagina);
  };

  const handleCambiarItemsPorPagina = (e) => {
    setItemsPorPagina(Number(e.target.value));
    setPaginaActual(1);
  };

  const handleEliminar = async (id) => {
    const confirm = await Swal.fire({
      title: '¿Eliminar producto?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (confirm.isConfirmed) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/productos/${id}`, { method: 'DELETE' });
        if (res.ok) {
          Swal.fire('Eliminado', 'El producto ha sido eliminado.', 'success');
          fetchProductos();
        } else {
          Swal.fire('Error', 'No se pudo eliminar el producto.', 'error');
        }
      } catch (error) {
        Swal.fire('Error', 'Ocurrió un error al eliminar.', 'error');
      }
    }
  };

  // Generar números de página para mostrar (máximo 5)
  const getPaginasMostradas = () => {
    const paginas = [];
    const maxVisible = 5;
    let inicio = Math.max(1, paginaActual - Math.floor(maxVisible / 2));
    let fin = Math.min(totalPaginas, inicio + maxVisible - 1);
    if (fin - inicio + 1 < maxVisible) {
      inicio = Math.max(1, fin - maxVisible + 1);
    }
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    return paginas;
  };

  return (
    <div className="productos-container">
      <div className="productos-header">
        <div className="productos-title-section">
          <h2>Catálogo de Productos</h2>
          <span className="productos-count">{totalProductos} productos</span>
        </div>
        <div className="productos-actions">
          <div className="productos-search">
            <input
              type="text"
              placeholder="🔍 Buscar por nombre, SKU o categoría..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="productos-search-input"
            />
          </div>
          <button
            className="productos-btn-nuevo"
            onClick={() => navigate('/productos/nuevo')}
          >
            + Nuevo Producto
          </button>
        </div>
      </div>

      {cargando ? (
        <div className="productos-loading">Cargando productos...</div>
      ) : productosFiltrados.length === 0 ? (
        <div className="productos-empty">
          {busqueda ? 'No se encontraron productos con esa búsqueda.' : 'No hay productos registrados.'}
        </div>
      ) : (
        <>
          <div className="productos-table-wrapper">
            <table className="productos-table">
              <thead>
                <tr>
                  <th>IMG</th>
                  <th>SKU</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosPaginados.map((prod) => (
                  <tr key={prod.id} className="productos-fila">
                    <td>
                      {prod.imagen_principal_url ? (
                        <img
                          src={`https://api.certimet.pe${prod.imagen_principal_url}`}
                          alt={prod.nombre}
                          className="productos-img"
                        />
                      ) : (
                        <span className="productos-no-img">N/A</span>
                      )}
                    </td>
                    <td><strong>{prod.sku}</strong></td>
                    <td>{prod.nombre}</td>
                    <td>{prod.categoria?.nombre || 'Sin categoría'}</td>
                    <td>S/ {Number(prod.precio_regular).toFixed(2)}</td>
                    <td>{prod.stock}</td>
                    <td>
                      <div className="productos-acciones">
                        <button
                          className="productos-btn-editar"
                          onClick={() => navigate(`/productos/editar/${prod.id}`)}
                          title="Editar"
                        >
                          <IconEdit />
                        </button>
                        <button
                          className="productos-btn-eliminar"
                          onClick={() => handleEliminar(prod.id)}
                          title="Eliminar"
                        >
                          <IconDelete />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Controles de paginación */}
          <div className="productos-paginacion">
            <div className="productos-paginacion-info">
              Mostrando {indiceInicio + 1} - {indiceFin} de {totalProductos} productos
            </div>

            <div className="productos-paginacion-controls">
              {/* Selector de cantidad por página */}
              <div className="productos-paginacion-selector">
                <label htmlFor="itemsPorPagina">Mostrar:</label>
                <select
                  id="itemsPorPagina"
                  value={itemsPorPagina}
                  onChange={handleCambiarItemsPorPagina}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {/* Botones de navegación */}
              <button
                className="productos-paginacion-btn"
                onClick={() => handleCambiarPagina(paginaActual - 1)}
                disabled={paginaActual === 1}
              >
                <IconChevronLeft />
              </button>

              {getPaginasMostradas().map((num) => (
                <button
                  key={num}
                  className={`productos-paginacion-btn ${num === paginaActual ? 'active' : ''}`}
                  onClick={() => handleCambiarPagina(num)}
                >
                  {num}
                </button>
              ))}

              <button
                className="productos-paginacion-btn"
                onClick={() => handleCambiarPagina(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
              >
                <IconChevronRight />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Productos;