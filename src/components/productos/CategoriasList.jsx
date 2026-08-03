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
      text: `Estás seguro de eliminar "${nombre}"?`,
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
      if (!res.ok) throw new Error('Error al eliminar');
      Swal.fire('Eliminada', 'Categoría eliminada correctamente', 'success');
      fetchCategorias();
    } catch (error) {
      Swal.fire('Error', 'No se pudo eliminar la categoría', 'error');
    }
  };

  // Función para mostrar la jerarquía con guiones
  const renderNombreConPadre = (cat, nivel = 0) => {
    const prefijo = '— '.repeat(nivel);
    return `${prefijo}${cat.nombre}`;
  };

  // Ordenar categorías por parent_id (simple)
  const categoriasOrdenadas = [...categorias].sort((a, b) => {
    if (a.parent_id === null && b.parent_id !== null) return -1;
    if (a.parent_id !== null && b.parent_id === null) return 1;
    if (a.parent_id === b.parent_id) return a.nombre.localeCompare(b.nombre);
    return a.parent_id - b.parent_id;
  });

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
              <th>Nombre</th>
              <th>Slug</th>
              <th>Padre</th>
              <th>Activo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categoriasOrdenadas.map((cat) => {
              const padre = categorias.find(p => p.id === cat.parent_id);
              return (
                <tr key={cat.id}>
                  <td>{cat.id}</td>
                  <td>{renderNombreConPadre(cat, 0)}</td>
                  <td>{cat.slug}</td>
                  <td>{padre ? padre.nombre : '—'}</td>
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