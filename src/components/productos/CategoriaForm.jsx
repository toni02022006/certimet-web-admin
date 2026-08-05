import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Categorias.css';

const CategoriaForm = () => {
  const { id } = useParams(); // "nueva" o número
  const navigate = useNavigate();
  const isEdit = id && id !== 'nueva';

  const [formData, setFormData] = useState({
    nivel1: '', // Categoría Principal (Nivel 1)
    nivel2: '', // Subcategoría (Nivel 2)
    nivel3: '', // Sub-subcategoría (Nivel 3)
    slug: '',
    activo: true
  });
  
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);

  // Generar slug automáticamente a partir del nombre
  const generateSlug = (nombre) => {
    return nombre
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
  };

  // Cargar todas las categorías y, si es edición, resolver el árbol jerárquico
  useEffect(() => {
    const initData = async () => {
      try {
        const resCats = await fetch(import.meta.env.VITE_API_URL + '/api/categorias');
        let allCategorias = [];
        if (resCats.ok) {
          allCategorias = await resCats.json();
          setCategorias(allCategorias);
        }

        if (isEdit) {
          const resCat = await fetch(import.meta.env.VITE_API_URL + `/api/categorias/${id}`);
          if (resCat.ok) {
            const data = await resCat.json();
            
            let nivel1 = '';
            let nivel2 = '';
            let nivel3 = '';

            // Lógica para reconstruir la jerarquía de abajo hacia arriba
            if (data.parent_id) {
              const parent = allCategorias.find(c => c.id === data.parent_id);
              if (parent) {
                if (parent.parent_id) {
                  // Tiene abuelo, por lo tanto 'data' es Nivel 3
                  nivel3 = data.nombre;
                  nivel2 = parent.nombre;
                  const root = allCategorias.find(c => c.id === parent.parent_id);
                  if (root) nivel1 = root.nombre;
                } else {
                  // No tiene abuelo, 'data' es Nivel 2
                  nivel3 = '';
                  nivel2 = data.nombre;
                  nivel1 = parent.nombre;
                }
              }
            } else {
               // No tiene padre, 'data' es Nivel 1
               nivel1 = data.nombre;
               nivel2 = '';
               nivel3 = '';
            }

            setFormData({
              nivel1,
              nivel2,
              nivel3,
              slug: data.slug || '',
              activo: data.activo !== undefined ? data.activo : true
            });
          } else {
            Swal.fire('Error', 'No se encontró la categoría', 'error');
            navigate('/productos/categorias');
          }
        }
      } catch (error) {
        console.error('Error al inicializar datos', error);
        Swal.fire('Error', 'Error de conexión', 'error');
      }
    };
    initData();
  }, [id, isEdit, navigate]);

  // Manejar cambios en los campos genéricos (activo, slug manual)
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Manejar cambios en los niveles y autogenerar el slug basado en el nivel más profundo
  const handleLevelChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newState = { ...prev, [name]: value };
      
      // Determinar qué nombre usar para el slug (el más profundo que tenga texto)
      let nombreBase = newState.nivel3.trim() || newState.nivel2.trim() || newState.nivel1.trim();
      newState.slug = generateSlug(nombreBase);
      
      return newState;
    });
  };

  // Función para crear categorías sobre la marcha de forma silenciosa
  const createCategorySilently = async (nombre, parentId = null) => {
    const payload = {
      nombre: nombre.trim(),
      slug: generateSlug(nombre),
      parent_id: parentId,
      activo: true
    };
    const res = await fetch(import.meta.env.VITE_API_URL + '/api/categorias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Error creando ${nombre}`);
    const nuevaData = await res.json();
    
    // Agregamos la nueva categoría al estado local para que las validaciones posteriores la encuentren
    setCategorias(prev => [...prev, nuevaData]);
    return nuevaData;
  };

  // Función auxiliar para buscar u obligar la creación de un nivel
  const getOrCreateLevel = async (nombre, parentId) => {
    const nameLower = nombre.trim().toLowerCase();
    const existente = categorias.find(c => 
      c.nombre.toLowerCase() === nameLower && c.parent_id === parentId
    );
    if (existente) return existente.id;
    
    const nueva = await createCategorySilently(nombre, parentId);
    return nueva.id;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Nivel 1 es el único 100% obligatorio
    if (!formData.nivel1.trim()) {
      Swal.fire('Atención', 'La Categoría Principal es obligatoria', 'warning');
      return;
    }

    // Validación lógica: No puedes tener Nivel 3 sin tener Nivel 2
    if (formData.nivel3.trim() && !formData.nivel2.trim()) {
      Swal.fire('Atención', 'Para agregar una Sub-subcategoría, primero debes escribir una Subcategoría.', 'warning');
      return;
    }

    setLoading(true);

    try {
      let finalName = '';
      let parentIdToSave = null;

      // Definir cuál es la categoría objetivo (la más profunda) y preparar sus padres
      if (formData.nivel3.trim()) {
        finalName = formData.nivel3.trim();
        const n1Id = await getOrCreateLevel(formData.nivel1, null);
        parentIdToSave = await getOrCreateLevel(formData.nivel2, n1Id);

      } else if (formData.nivel2.trim()) {
        finalName = formData.nivel2.trim();
        parentIdToSave = await getOrCreateLevel(formData.nivel1, null);

      } else {
        finalName = formData.nivel1.trim();
        parentIdToSave = null;
      }

      // Preparar el envío final para la categoría principal del formulario
      const payload = {
        nombre: finalName,
        slug: formData.slug || generateSlug(finalName),
        parent_id: parentIdToSave,
        activo: formData.activo
      };

      const url = isEdit
        ? import.meta.env.VITE_API_URL + `/api/categorias/${id}`
        : import.meta.env.VITE_API_URL + '/api/categorias';
      const method = isEdit ? 'PUT' : 'POST';

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
          text: isEdit ? 'Los cambios se guardaron' : 'La jerarquía se procesó exitosamente'
        });
        navigate('/productos/categorias');
      } else {
        Swal.fire('Error', data.error || 'Ocurrió un error', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Error al procesar las categorías. Revisa la conexión.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar datalists
  const categoriasRaiz = categorias.filter(c => c.parent_id === null && c.id !== parseInt(id));
  
  const getSubCategorias = () => {
    const padreSeleccionado = categoriasRaiz.find(c => c.nombre.toLowerCase() === formData.nivel1.trim().toLowerCase());
    if (!padreSeleccionado) return [];
    return categorias.filter(c => c.parent_id === padreSeleccionado.id && c.id !== parseInt(id));
  };

  return (
    <div className="cf-container">
      <h2>{isEdit ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
      <form onSubmit={handleSubmit} className="cf-form">
        
        {/* Nivel 1: Categoría Padre (Obligatorio) */}
        <div className="cf-group">
          <label>Categoría Principal (Ej: Laboratorio) *</label>
          <input
            type="text"
            list="categorias-padre-list"
            name="nivel1"
            value={formData.nivel1}
            onChange={handleLevelChange}
            placeholder="Selecciona de la lista o escribe para crear una nueva"
            required
          />
          <datalist id="categorias-padre-list">
            {categoriasRaiz.map(cat => (
              <option key={cat.id} value={cat.nombre} />
            ))}
          </datalist>
          <small>Campo obligatorio. Esta es la categoría raíz.</small>
        </div>

        {/* Nivel 2: Subcategoría (Opcional) */}
        <div className="cf-group">
          <label>Subcategoría (Ej: Medidor de PH) (Opcional)</label>
          <input
            type="text"
            list="subcategorias-list"
            name="nivel2"
            value={formData.nivel2}
            onChange={handleLevelChange}
            placeholder="Selecciona o escribe una nueva subcategoría"
            disabled={!formData.nivel1.trim()} 
          />
          <datalist id="subcategorias-list">
            {getSubCategorias().map(cat => (
              <option key={cat.id} value={cat.nombre} />
            ))}
          </datalist>
          <small>Solo disponible si has escrito una categoría principal.</small>
        </div>

        {/* Nivel 3: Sub-subcategoría (Opcional) */}
        <div className="cf-group">
          <label>Sub-subcategoría (Ej: Multiparámetros) (Opcional)</label>
          <input
            type="text"
            name="nivel3"
            value={formData.nivel3}
            onChange={handleLevelChange}
            placeholder="Nombre de la tercera categoría"
            disabled={!formData.nivel2.trim()}
          />
          <small>Solo disponible si has escrito una subcategoría.</small>
        </div>

        <hr style={{margin: '20px 0', border: '0.5px solid #ccc'}} />

        {/* Slug y Activo */}
        <div className="cf-group">
          <label>Slug</label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            placeholder="Se genera automáticamente"
          />
          <small>Identificador único para la URL. Se genera solo según la categoría más profunda que llenes.</small>
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