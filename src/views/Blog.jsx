import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Blog.css'; 

const Blog = () => {
  const navigate = useNavigate(); 
  const [articulos, setArticulos] = useState([]);
  
  // Estados para los filtros
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  // Estados para la paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(10);

  const fetchArticulos = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/blog');
      if (response.ok) {
        const data = await response.json();
        setArticulos(data);
      }
    } catch (error) {
      console.error('Error al conectar con la API:', error);
    }
  };

  useEffect(() => {
    fetchArticulos();
  }, []);

  // Si se cambia algún filtro, regresamos a la página 1
  useEffect(() => {
    setPaginaActual(1);
  }, [filtroBusqueda, filtroCategoria, filtroEstado]);

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "El artículo se eliminará de la base de datos.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/blog/${id}`, { method: 'DELETE' });
        if (response.ok) {
          Swal.fire('¡Eliminado!', 'El artículo ha sido eliminado.', 'success');
          fetchArticulos(); 
        } else {
          const data = await response.json();
          Swal.fire('Error', data.error || 'No se pudo eliminar.', 'error');
        }
      } catch (error) {
        Swal.fire('Error', 'Error de conexión.', 'error');
      }
    }
  };

  // 1. Filtrar los artículos primero
  const filteredArticulos = articulos.filter((art) => {
    const coincideBusqueda = art.titulo.toLowerCase().includes(filtroBusqueda.toLowerCase());
    const coincideCategoria = filtroCategoria === '' || art.categoria === filtroCategoria;
    
    let coincideEstado = true;
    if (filtroEstado === 'publicado') coincideEstado = art.activo === true;
    if (filtroEstado === 'oculto') coincideEstado = art.activo === false;

    return coincideBusqueda && coincideCategoria && coincideEstado;
  });

  // 2. Calcular variables de paginación sobre los artículos ya filtrados
  const totalPaginas = Math.max(1, Math.ceil(filteredArticulos.length / itemsPorPagina));
  const indiceUltimoItem = paginaActual * itemsPorPagina;
  const indicePrimerItem = indiceUltimoItem - itemsPorPagina;
  
  // 3. Obtener solo los artículos de la página actual
  const articulosPaginados = filteredArticulos.slice(indicePrimerItem, indiceUltimoItem);

  // Función para manejar el input del número de página
  const handleCambioPagina = (e) => {
    const valor = e.target.value;
    if (valor === '') {
      setPaginaActual(''); // Permite borrar para escribir un número nuevo
      return;
    }
    
    let pagina = parseInt(valor);
    if (pagina > totalPaginas) pagina = totalPaginas;
    if (pagina < 1) pagina = 1;
    
    setPaginaActual(pagina);
  };

  // Función para cuando el input pierde el foco (por si lo dejan vacío)
  const handleBlurPagina = () => {
    if (paginaActual === '' || paginaActual < 1) {
      setPaginaActual(1);
    }
  };

  return (
    <div className="blog-dashboard-layout">
      
      <div className="blog-page-header">
        <div className="blog-title-block">
          <h2>Gestión del Blog</h2>
          <p>Administra los artículos de la plataforma o publica contenido nuevo.</p>
        </div>
        <button 
          className="btn-accion-principal" 
          onClick={() => navigate('/admin/blog/nuevo')} 
        >
          + Nuevo Artículo
        </button>
      </div>

      <div className="blog-filters-card">
        <div className="filter-item search-item">
          <label>Buscar</label>
          <div className="search-input-wrapper">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder="Buscar por título..." 
              value={filtroBusqueda}
              onChange={(e) => setFiltroBusqueda(e.target.value)}
            />
          </div>
        </div>
        
        <div className="filter-item">
          <label>Categoría</label>
          <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
            <option value="">Todas</option>
            <option value="METROLOGIA">Metrología</option>
            <option value="AUTOMATIZACION">Automatización</option>
            <option value="NORMATIVAS">Normativas</option>
          </select>
        </div>

        <div className="filter-item">
          <label>Estado</label>
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="">Todos</option>
            <option value="publicado">Publicados</option>
            <option value="oculto">Ocultos</option>
          </select>
        </div>
      </div>

      <div className="tabla-tareas-container">
        
        <div className="tabla-tareas-header">
          <div className="tabla-tareas-title">
            <h3>Historial de Publicaciones</h3>
            <span className="tabla-tareas-count">{filteredArticulos.length}</span>
          </div>
        </div>

        <div className="tabla-tareas-wrapper">
          <table className="tabla-tareas">
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Título</th>
                <th>Autor</th>
                <th>Fecha Pub.</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {/* ATENCIÓN AQUÍ: Usamos articulosPaginados en lugar de filteredArticulos */}
              {articulosPaginados.length > 0 ? (
                articulosPaginados.map((art) => (
                  <tr key={art.id} className="tabla-fila">
                    <td>{art.categoria}</td>
                    <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {art.titulo}
                    </td>
                    <td>{art.autor?.nombre} {art.autor?.apellidos}</td>
                    <td>{new Date(art.fecha_publicacion).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge-estado ${art.activo ? 'badge-verde' : 'badge-gris'}`}>
                        {art.activo ? 'Publicado' : 'Oculto'}
                      </span>
                    </td>
                    <td>
                      <div className="tabla-acciones">
                        <button 
                          className="btn-accion btn-editar" 
                          onClick={() => navigate(`/admin/blog/editar/${art.id}`)}
                          title="Editar"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button 
                          className="btn-accion btn-eliminar" 
                          onClick={() => handleEliminar(art.id)}
                          title="Eliminar"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="tabla-tareas-empty">
                    No se encontraron artículos con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ==========================================
            NUEVA SECCIÓN DE PAGINACIÓN
            ========================================== */}
        {filteredArticulos.length > 0 && (
          <div className="tabla-paginacion">
            <div className="tabla-paginacion-info">
              Mostrando {indicePrimerItem + 1} a {Math.min(indiceUltimoItem, filteredArticulos.length)} de {filteredArticulos.length} artículos
            </div>
            
            <div className="tabla-paginacion-controls">
              <span className="items-por-pagina-label">Mostrar:</span>
              <select 
                value={itemsPorPagina} 
                onChange={(e) => {
                  setItemsPorPagina(Number(e.target.value));
                  setPaginaActual(1);
                }}
                className="select-paginacion"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>

              <button 
                className="btn-pagina" 
                disabled={paginaActual === 1 || paginaActual === ''}
                onClick={() => setPaginaActual(paginaActual - 1)}
              >
                Anterior
              </button>

              <div className="input-pagina-wrapper">
                <input 
                  type="number" 
                  className="input-pagina" 
                  value={paginaActual} 
                  onChange={handleCambioPagina}
                  onBlur={handleBlurPagina}
                  min="1" 
                  max={totalPaginas}
                />
                <span className="total-paginas-text">de {totalPaginas}</span>
              </div>

              <button 
                className="btn-pagina" 
                disabled={paginaActual === totalPaginas || paginaActual === ''}
                onClick={() => setPaginaActual(paginaActual + 1)}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Blog;