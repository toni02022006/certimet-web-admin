import React, { useEffect, useState } from 'react';
import './ListaSuscriptores.css'; // Puedes usar Marketing.css si prefieres

// Definimos la URL base para producción (Compatible con Vite)
const API_URL = import.meta.env.VITE_API_URL || 'https://api.certimet.pe';

const ListaSuscriptores = () => {
  const [suscriptores, setSuscriptores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [paginaInput, setPaginaInput] = useState('');

  // Obtener suscriptores desde el backend
  const fetchSuscriptores = async () => {
    try {
      // Cambio para producción: usamos API_URL
      const response = await fetch(`${API_URL}/api/newsletter/lista`);
      const data = await response.json();
      setSuscriptores(data);
    } catch (error) {
      console.error('Error cargando suscriptores:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuscriptores();
  }, []);

  // Resetear página al cambiar búsqueda o filas por página
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filasPorPagina]);

  // Filtrado local por correo, origen o etiquetas
  const suscriptoresFiltrados = suscriptores.filter((sub) => {
    const term = busqueda.toLowerCase().trim();
    if (!term) return true;
    const correo = (sub.correo || '').toLowerCase();
    const origen = (sub.origen || '').toLowerCase();
    const etiquetas = (sub.etiquetas || []).join(' ').toLowerCase();
    return correo.includes(term) || origen.includes(term) || etiquetas.includes(term);
  });

  // Paginación
  const totalRegistros = suscriptoresFiltrados.length;
  const totalPaginas = Math.ceil(totalRegistros / filasPorPagina);
  const indiceInicio = (paginaActual - 1) * filasPorPagina;
  const indiceFin = Math.min(indiceInicio + filasPorPagina, totalRegistros);
  const datosPaginados = suscriptoresFiltrados.slice(indiceInicio, indiceFin);

  const cambiarPagina = (num) => {
    if (num >= 1 && num <= totalPaginas) {
      setPaginaActual(num);
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

  // Rango de páginas a mostrar (máximo 5)
  const getRangoPaginas = () => {
    const delta = 2;
    const rango = [];
    let inicio = Math.max(1, paginaActual - delta);
    let fin = Math.min(totalPaginas, paginaActual + delta);
    if (fin - inicio + 1 < 5) {
      if (inicio === 1) fin = Math.min(totalPaginas, 5);
      else inicio = Math.max(1, fin - 4);
    }
    for (let i = inicio; i <= fin; i++) rango.push(i);
    return rango;
  };

  // Estadísticas rápidas (opcional)
  const totalActivos = suscriptores.filter(s => s.activo).length;
  const totalInactivos = suscriptores.filter(s => !s.activo).length;

  return (
    <div className="ls-container">
      {/* Cabecera con estadísticas y buscador */}
      <div className="ls-header">
        <div className="ls-stats">
          <span>Total: <strong>{suscriptores.length}</strong></span>
          <span>Activos: <strong className="ls-active">{totalActivos}</strong></span>
          <span>Inactivos: <strong className="ls-inactive">{totalInactivos}</strong></span>
        </div>
        <div className="ls-search">
          <input
            type="text"
            placeholder="🔍 Buscar por correo, origen o etiquetas..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="ls-table-wrapper">
        {loading ? (
          <div className="ls-loading">Cargando suscriptores...</div>
        ) : datosPaginados.length === 0 ? (
          <div className="ls-empty">
            {busqueda ? 'No se encontraron suscriptores con esa búsqueda.' : 'No hay suscriptores registrados.'}
          </div>
        ) : (
          <table className="ls-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Correo Electrónico</th>
                <th>Origen</th>
                <th>Etiquetas</th>
                <th>Estado</th>
                <th>Fecha Registro</th>
              </tr>
            </thead>
            <tbody>
              {datosPaginados.map((sub) => (
                <tr key={sub.id}>
                  <td>{sub.id}</td>
                  <td>{sub.correo}</td>
                  <td>{sub.origen || 'No definido'}</td>
                  <td>
                    <div className="ls-etiquetas">
                      {sub.etiquetas && sub.etiquetas.length > 0 ? (
                        sub.etiquetas.map((tag, idx) => (
                          <span key={idx} className="ls-tag">{tag}</span>
                        ))
                      ) : (
                        'N/A'
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`ls-badge ${sub.activo ? 'ls-badge-active' : 'ls-badge-inactive'}`}>
                      {sub.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>{new Date(sub.fecha_suscripcion).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginación */}
      {!loading && totalRegistros > 0 && (
        <div className="ls-pagination">
          <div className="ls-pagination-info">
            Mostrando {indiceInicio + 1} - {indiceFin} de {totalRegistros} suscriptores
          </div>
          <div className="ls-pagination-controls">
            {/* Selector de filas por página */}
            <div className="ls-rows-selector">
              <span>Mostrar</span>
              <select value={filasPorPagina} onChange={(e) => setFilasPorPagina(Number(e.target.value))}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Botones de navegación */}
            <button onClick={() => cambiarPagina(1)} disabled={paginaActual === 1}>&lt;&lt;</button>
            <button onClick={() => cambiarPagina(paginaActual - 1)} disabled={paginaActual === 1}>&lt;</button>
            {getRangoPaginas().map((num) => (
              <button
                key={num}
                className={num === paginaActual ? 'active' : ''}
                onClick={() => cambiarPagina(num)}
              >
                {num}
              </button>
            ))}
            <button onClick={() => cambiarPagina(paginaActual + 1)} disabled={paginaActual === totalPaginas}>&gt;</button>
            <button onClick={() => cambiarPagina(totalPaginas)} disabled={paginaActual === totalPaginas}>&gt;&gt;</button>

            {/* Salto a página */}
            <form onSubmit={irPaginaInput} className="ls-pagination-form">
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
    </div>
  );
};

export default ListaSuscriptores;