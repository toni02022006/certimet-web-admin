import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './ProductoFormPage.css';

import FormInfoGeneral from '../components/productos/FormInfoGeneral';
import FormGaleria from '../components/productos/FormGaleria';
import FormDescripciones from '../components/productos/FormDescripciones';
import ProductoPreview from '../components/productos/ProductoPreview';

const ProductoFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados para el formulario
  const [formData, setFormData] = useState({
    categoria_id: '',
    nombre: '',
    sku: '',
    descripcion_corta: '',
    descripcion_tecnica: '',
    descripcion_detallada: '',
    precio_regular: '',
    precio_oferta: '',
    stock: '',
    destacado: false,
    marca_id: '',
    mpn: '',
    peso_kg: '',
    largo_cm: '',
    ancho_cm: '',
    alto_cm: '',
    garantia_meses: '',
    condicion: 'NUEVO',
    incluye_igv: true,
    ficha_tecnica_url: '',
    nueva_subcategoria: '',
    slug: '',
  });

  const [imagenPreview, setImagenPreview] = useState(null);
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [galeriaPreviews, setGaleriaPreviews] = useState([]);
  const [archivosGaleria, setArchivosGaleria] = useState([]);
  const [galeriaExistente, setGaleriaExistente] = useState([]);
  const [imagenesAEliminar, setImagenesAEliminar] = useState([]);

  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoriaPadreId, setCategoriaPadreId] = useState('');
  const [subcategoriasFiltradas, setSubcategoriasFiltradas] = useState([]);

  // ============================================================
  // CARGAR DATOS INICIALES
  // ============================================================
  useEffect(() => {
    const fetchCategoriasYMarcas = async () => {
      try {
        const resCats = await fetch(import.meta.env.VITE_API_URL + '/api/categorias');
        if (resCats.ok) {
          const data = await resCats.json();
          setCategorias(data);
        }
        const resMarcas = await fetch(import.meta.env.VITE_API_URL + '/api/marcas');
        if (resMarcas.ok) {
          const data = await resMarcas.json();
          setMarcas(data);
        }
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
      }
    };
    fetchCategoriasYMarcas();
  }, []);

  useEffect(() => {
    if (!id || categorias.length === 0) return;
    const fetchProducto = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/productos/${id}`);
        if (res.ok) {
          const prod = await res.json();
          setFormData({
            categoria_id: prod.categoria_id || '',
            nombre: prod.nombre || '',
            sku: prod.sku || '',
            descripcion_corta: prod.descripcion_corta || '',
            descripcion_tecnica: prod.descripcion_tecnica || '',
            descripcion_detallada: prod.descripcion_detallada || '',
            precio_regular: prod.precio_regular || '',
            precio_oferta: prod.precio_oferta || '',
            stock: prod.stock || '',
            destacado: prod.destacado || false,
            marca_id: prod.marca_id || '',
            mpn: prod.mpn || '',
            peso_kg: prod.peso_kg || '',
            largo_cm: prod.largo_cm || '',
            ancho_cm: prod.ancho_cm || '',
            alto_cm: prod.alto_cm || '',
            garantia_meses: prod.garantia_meses || '',
            condicion: prod.condicion || 'NUEVO',
            incluye_igv: prod.incluye_igv ?? true,
            ficha_tecnica_url: prod.ficha_tecnica_url || '',
            slug: prod.slug || '',
          });
          if (prod.imagen_principal_url) {
            setImagenPreview(`${import.meta.env.VITE_API_URL}${prod.imagen_principal_url}`);
          }
          if (prod.imagenes && prod.imagenes.length > 0) {
            setGaleriaExistente(prod.imagenes);
          }
          const catSeleccionada = categorias.find(c => c.id === prod.categoria_id);
          if (catSeleccionada && catSeleccionada.parent_id) {
            setCategoriaPadreId(catSeleccionada.parent_id.toString());
          } else if (catSeleccionada) {
            setCategoriaPadreId(catSeleccionada.id.toString());
          }
        } else {
          Swal.fire('Error', 'No se pudo cargar el producto', 'error');
        }
      } catch (error) {
        Swal.fire('Error', 'Error de conexión', 'error');
      }
    };
    fetchProducto();
  }, [id, categorias]);

  useEffect(() => {
    if (categoriaPadreId) {
      const subcategorias = categorias.filter(c => c.parent_id === parseInt(categoriaPadreId));
      setSubcategoriasFiltradas(subcategorias);
    } else {
      setSubcategoriasFiltradas([]);
    }
  }, [categoriaPadreId, categorias]);

  // ============================================================
  // MANEJADORES
  // ============================================================
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleCategoriaPadreChange = (e) => {
    const padreId = e.target.value;
    setCategoriaPadreId(padreId);
    setFormData((prev) => ({ ...prev, categoria_id: '' }));
  };

  const handleSubcategoriaChange = (e) => {
    const subcatId = e.target.value;
    setFormData((prev) => ({ ...prev, categoria_id: subcatId }));
  };

  const handleQuillChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivoImagen(file);
      setImagenPreview(URL.createObjectURL(file));
    }
  };

  const handleGaleriaChange = (e) => {
    const nuevosArchivos = Array.from(e.target.files);
    const total = [...archivosGaleria, ...nuevosArchivos];
    const maxPermitido = 10 - galeriaExistente.length;
    const archivosFinal = total.slice(0, maxPermitido);
    setArchivosGaleria(archivosFinal);
    setGaleriaPreviews(archivosFinal.map((file) => URL.createObjectURL(file)));
  };

  const eliminarImagenGaleria = (index) => {
    const nuevosArchivos = archivosGaleria.filter((_, i) => i !== index);
    setArchivosGaleria(nuevosArchivos);
    setGaleriaPreviews(nuevosArchivos.map((file) => URL.createObjectURL(file)));
  };

  const eliminarImagenExistente = (idImagen) => {
    setImagenesAEliminar([...imagenesAEliminar, idImagen]);
    setGaleriaExistente(galeriaExistente.filter((img) => img.id !== idImagen));
  };

  // ============================================================
  // ENVÍO
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoria_id && !formData.nueva_subcategoria?.trim()) {
      Swal.fire('Atención', 'Selecciona una categoría o escribe una nueva subcategoría.', 'warning');
      return;
    }
    setLoading(true);
    const datosEnvio = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === 'destacado' || key === 'incluye_igv') {
        datosEnvio.append(key, formData[key] ? 'true' : 'false');
      } else {
        datosEnvio.append(key, formData[key] !== undefined ? formData[key] : '');
      }
    });
    datosEnvio.append('categoriaPadreId', categoriaPadreId);
    if (archivoImagen) datosEnvio.append('imagen_archivo', archivoImagen);
    if (archivosGaleria.length > 0) {
      archivosGaleria.forEach((file) => datosEnvio.append('galeria', file));
    }
    if (imagenesAEliminar.length > 0) {
      datosEnvio.append('imagenes_a_eliminar', JSON.stringify(imagenesAEliminar));
    }

    const url = id
      ? `${import.meta.env.VITE_API_URL}/api/productos/${id}`
      : import.meta.env.VITE_API_URL + '/api/productos';
    const method = id ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, { method, body: datosEnvio });
      const data = await response.json();
      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: id ? 'Producto actualizado' : 'Producto creado',
          text: id ? 'Los cambios se guardaron correctamente' : 'El producto se ha creado exitosamente',
        });
        navigate('/productos');
      } else {
        Swal.fire('Error', data.error || 'Hubo un problema al guardar', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Error de conexión con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="pfp-container">
      <div className="pfp-header">
        <h1 className="pfp-title">{id ? 'Editar Producto' : 'Nuevo Producto'}</h1>
        <p className="pfp-subtitle">
          {id ? 'Modifica los datos del equipo' : 'Completa los campos para agregar un nuevo equipo a la tienda'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="pfp-form">
        <div className="pfp-grid">
          {/* Sección 1: Información General */}
          <div className="pfp-card">
            <FormInfoGeneral
              formData={formData}
              handleInputChange={handleInputChange}
              setFormData={setFormData}
              categorias={categorias}
              marcas={marcas}
              categoriaPadreId={categoriaPadreId}
              handleCategoriaPadreChange={handleCategoriaPadreChange}
              subcategoriasFiltradas={subcategoriasFiltradas}
              handleSubcategoriaChange={handleSubcategoriaChange}
            />
          </div>

          {/* Sección 2: Galería */}
          <div className="pfp-card">
            <FormGaleria
              imagenPreview={imagenPreview}
              handleImageChange={handleImageChange}
              galeriaPreviews={galeriaPreviews}
              handleGaleriaChange={handleGaleriaChange}
              eliminarImagenGaleria={eliminarImagenGaleria}
              galeriaExistente={galeriaExistente}
              eliminarImagenExistente={eliminarImagenExistente}
            />
          </div>

          {/* Sección 3: Descripciones */}
          <div className="pfp-card">
            <FormDescripciones
              formData={formData}
              handleQuillChange={handleQuillChange}
            />
          </div>
        </div>

        {/* Vista previa */}
        <div className="pfp-preview-section">
          <h2 className="pfp-preview-title">📱 Vista Previa en Tienda</h2>
          <div className="pfp-preview-wrapper">
            <ProductoPreview
              formData={formData}
              imagenPreview={imagenPreview}
              categorias={categorias}
              fullWidth={true}
              galeriaPreviews={galeriaPreviews}
              galeriaExistente={galeriaExistente}
            />
          </div>
        </div>

        {/* Acciones */}
        <div className="pfp-actions">
          <button
            type="button"
            className="pfp-btn pfp-btn-cancel"
            onClick={() => navigate('/productos')}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="pfp-btn pfp-btn-submit"
            disabled={loading}
          >
            {loading ? 'Guardando...' : id ? 'Actualizar Producto' : 'Guardar Producto'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductoFormPage;