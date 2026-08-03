import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Categorias.css';

const CategoriaForm = () => {
  const { id } = useParams(); // "nueva" o número
  const navigate = useNavigate();
  const isEdit = id && id !== 'nueva';

  const [formData, setFormData] = useState({
    nombre: '',
    slug: '',
    parent_id: '',
    activo: true
  });
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar todas las categorías para el select de padre
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await fetch(import.meta.env.VITE_API_URL + '/api/categorias');
        if (res.ok) {
          const data = await res.json();
          setCategorias(data);
        }
      } catch (error) {
        console.error('Error al cargar categorías para select', error);
      }
    };
    fetchCategorias();
  }, []);

  // Si es edición, cargar datos de la categoría
  useEffect(() => {
    if (isEdit) {
      const fetchCategoria = async () => {
        try {
          const res = await fetch(import.meta.env.VITE_API_URL + `/api/categorias/${id}`);
          if (res.ok) {
            const data = await res.json();
            setFormData({
              nombre: data.nombre || '',
              slug: data.slug || '',
              parent_id: data.parent_id || '',
              activo: data.activo !== undefined ? data.activo : true
            });
          } else {
            Swal.fire('Error', 'No se encontró la categoría', 'error');
            navigate('/productos/categorias');
          }
        } catch (error) {
          Swal.fire('Error', 'Error de conexión', 'error');
        }
      };
      fetchCategoria();
    }
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Generar slug automáticamente a partir del nombre
  const generateSlug = (nombre) => {
    return nombre
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
  };

  const handleNombreChange = (e) => {
    const nombre = e.target.value;
    setFormData(prev => ({
      ...prev,
      nombre,
      slug: generateSlug(nombre)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      Swal.fire('Atención', 'El nombre es obligatorio', 'warning');
      return;
    }
    setLoading(true);

    const payload = {
      nombre: formData.nombre.trim(),
      slug: formData.slug || generateSlug(formData.nombre),
      parent_id: formData.parent_id ? parseInt(formData.parent_id) : null,
      activo: formData.activo
    };

    const url = isEdit
      ? import.meta.env.VITE_API_URL + `/api/categorias/${id}`
      : import.meta.env.VITE_API_URL + '/api/categorias';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: isEdit ? 'Categoría actualizada' : 'Categoría creada',
          text: isEdit ? 'Los cambios se guardaron' : 'La categoría se creó exitosamente'
        });
        navigate('/productos/categorias');
      } else {
        Swal.fire('Error', data.error || 'Ocurrió un error', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Error de conexión con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar para que no se pueda seleccionar a sí misma como padre (en edición)
  const categoriasDisponibles = categorias.filter(cat => cat.id !== parseInt(id));

  return (
    <div className="cf-container">
      <h2>{isEdit ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
      <form onSubmit={handleSubmit} className="cf-form">
        <div className="cf-group">
          <label>Nombre *</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleNombreChange}
            required
          />
        </div>

        <div className="cf-group">
          <label>Slug</label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            placeholder="Se genera automáticamente"
          />
          <small>Identificador único para la URL. Se genera solo si lo dejas vacío.</small>
        </div>

        <div className="cf-group">
          <label>Categoría padre</label>
          <select
            name="parent_id"
            value={formData.parent_id}
            onChange={handleChange}
          >
            <option value="">Ninguna (Raíz)</option>
            {categoriasDisponibles.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="cf-group cf-checkbox">
          <label>
            <input
              type="checkbox"
              name="activo"
              checked={formData.activo}
              onChange={handleChange}
            />
            Activo
          </label>
        </div>

        <div className="cf-actions">
          <button
            type="button"
            className="cf-btn cf-btn-cancel"
            onClick={() => navigate('/productos/categorias')}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="cf-btn cf-btn-submit"
            disabled={loading}
          >
            {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoriaForm;