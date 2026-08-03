import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Marcas.css';

const MarcasList = () => {
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMarcas = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/marcas');
      if (!res.ok) throw new Error('Error al cargar marcas');
      const data = await res.json();
      setMarcas(data);
    } catch (error) {
      Swal.fire('Error', 'No se pudieron cargar las marcas', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarcas();
  }, []);

  const handleDelete = async (id, nombre) => {
    const confirm = await Swal.fire({
      title: '¿Eliminar marca?',
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
      const res = await fetch(import.meta.env.VITE_API_URL + `/api/marcas/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Error al eliminar');
      Swal.fire('Eliminada', 'Marca eliminada correctamente', 'success');
      fetchMarcas();
    } catch (error) {
      Swal.fire('Error', 'No se pudo eliminar la marca', 'error');
    }
  };

  if (loading) return <div className="ml-loading">Cargando marcas...</div>;

  return (
    <div className="ml-container">
      <div className="ml-header">
        <h2>🏷️ Marcas</h2>
        <Link to="/productos/marcas/nueva" className="ml-btn ml-btn-primary">
          + Nueva Marca
        </Link>
      </div>

      <div className="ml-table-wrapper">
        <table className="ml-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Logo</th>
              <th>Activo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {marcas.map((marca) => (
              <tr key={marca.id}>
                <td>{marca.id}</td>
                <td>{marca.nombre}</td>
                <td>
                  {marca.logo_url ? (
                    <img
                      src={import.meta.env.VITE_API_URL + marca.logo_url}
                      alt={marca.nombre}
                      className="ml-logo-thumb"
                    />
                  ) : (
                    '—'
                  )}
                </td>
                <td>
                  <span className={`ml-badge ${marca.activo ? 'ml-active' : 'ml-inactive'}`}>
                    {marca.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <Link to={`/productos/marcas/editar/${marca.id}`} className="ml-btn ml-btn-edit">
                    Editar
                  </Link>
                  <button
                    className="ml-btn ml-btn-delete"
                    onClick={() => handleDelete(marca.id, marca.nombre)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MarcasList;