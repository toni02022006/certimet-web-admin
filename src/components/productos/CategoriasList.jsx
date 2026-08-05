// CategoriasList.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Categorias.css';

const CategoriasList = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategorias = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/categorias');
      if (!res.ok) throw new Error('Error al cargar categorías');
      const data = await res.json();
      setCategorias(data);
    } catch (error) {
      Swal.fire('Error', 'No se pudieron cargar las categorías', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleDelete = async (id, nombre) => {
    const confirm = await Swal.fire({
      title: '¿Eliminar categoría?',
      text: `¿Estás seguro de eliminar "${nombre}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(import.meta.env.VITE_API_URL + `/api/categorias/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al eliminar');
      }
      Swal.fire('Eliminada', 'Categoría eliminada correctamente', 'success');
      fetchCategorias();
    } catch (error) {
      Swal.fire('Error', error.message || 'No se pudo eliminar la categoría', 'error');
    }
  };

  // Construir mapa de categorías por id para acceso rápido
  const categoriaMap = {};
  categorias.forEach(cat => {
    categoriaMap[cat.id] = cat;
  });

  // Función corregida: obtiene los ancestros de arriba hacia abajo
  const getAncestros = (categoria) => {
    const chain = [];
    let actual = categoria;

    // Subimos por el árbol jerárquico hasta llegar a la raíz (parent_id = null)
    while (actual) {
      // unshift agrega el elemento al inicio del array. 
      // Así, la categoría más "padre" siempre quedará en la posición 0.
      chain.unshift(actual.nombre);
      actual = actual.parent_id ? categoriaMap[actual.parent_id] : null;
    }

    // Retornamos un arreglo fijo de 3 posiciones para las 3 columnas
    return [
      chain[0] || null, // Nivel 1 (Padre)
      chain[1] || null, // Nivel 2 (Hijo)
      chain[2] || null  // Nivel 3 (Nieto)
    ];
  };

  // Ordenar por nombre para mejor lectura
  const categoriasOrdenadas = [...categorias].sort((a, b) => a.nombre.localeCompare(b.nombre));

  if (loading) return <div className="cl-loading">Cargando categorías...</div>;

  return (
    <div className="cl-container">
      <div className="cl-header">
        <h2>📂 Categorías</h2>
        <Link to="/productos/categorias/nueva" className="cl-btn cl-btn-primary">
          + Nueva Categoría
        </Link>
      </div>

      <div className="cl-table-wrapper">
        <table className="cl-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Categoría (Nivel 1)</th>
              <th>Subcategoría (Nivel 2)</th>
              <th>Sub‑subcategoría (Nivel 3)</th>
              <th>Activo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categoriasOrdenadas.map((cat) => {
              const [nivel1, nivel2, nivel3] = getAncestros(cat);
              return (
                <tr key={cat.id}>
                  <td>{cat.id}</td>
                  <td>{nivel1 || '—'}</td>
                  <td>{nivel2 || '—'}</td>
                  <td>{nivel3 || '—'}</td>
                  <td>
                    <span className={`cl-badge ${cat.activo ? 'cl-active' : 'cl-inactive'}`}>
                      {cat.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <Link to={`/productos/categorias/editar/${cat.id}`} className="cl-btn cl-btn-edit">
                      Editar
                    </Link>
                    <button
                      className="cl-btn cl-btn-delete"
                      onClick={() => handleDelete(cat.id, cat.nombre)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoriasList;