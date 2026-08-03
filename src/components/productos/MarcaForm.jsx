import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Marcas.css';

const MarcaForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id && id !== 'nueva';

  const [formData, setFormData] = useState({
    nombre: '',
    logo_url: '',
    activo: true
  });
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');

  // Cargar datos en edición
  useEffect(() => {
    if (isEdit) {
      const fetchMarca = async () => {
        try {
          const res = await fetch(import.meta.env.VITE_API_URL + `/api/marcas/${id}`);
          if (res.ok) {
            const data = await res.json();
            setFormData({
              nombre: data.nombre || '',
              logo_url: data.logo_url || '',
              activo: data.activo !== undefined ? data.activo : true
            });
            if (data.logo_url) {
              setLogoPreview(import.meta.env.VITE_API_URL + data.logo_url);
            }
          } else {
            Swal.fire('Error', 'No se encontró la marca', 'error');
            navigate('/productos/marcas');
          }
        } catch (error) {
          Swal.fire('Error', 'Error de conexión', 'error');
        }
      };
      fetchMarca();
    }
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // ✅ Prevenir recarga

    // Validar nombre
    if (!formData.nombre.trim()) {
      Swal.fire('Atención', 'El nombre es obligatorio', 'warning');
      return;
    }

    setLoading(true);

    // Construir FormData
    const payload = new FormData();
    payload.append('nombre', formData.nombre.trim());
    payload.append('activo', formData.activo ? 'true' : 'false');
    if (logoFile) {
      payload.append('logo', logoFile);
    }

    // 🔍 LOG para ver qué se envía
    console.log('📤 Enviando FormData:');
    for (let [key, value] of payload.entries()) {
      console.log(key, value);
    }

    const url = isEdit
      ? import.meta.env.VITE_API_URL + `/api/marcas/${id}`
      : import.meta.env.VITE_API_URL + '/api/marcas';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        body: payload
        // NO headers: Content-Type
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: isEdit ? 'Marca actualizada' : 'Marca creada',
          text: isEdit ? 'Los cambios se guardaron' : 'La marca se creó exitosamente'
        });
        navigate('/productos/marcas');
      } else {
        Swal.fire('Error', data.error || 'Ocurrió un error', 'error');
      }
    } catch (error) {
      console.error('❌ Error en fetch:', error);
      Swal.fire('Error', 'Error de conexión con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mf-container">
      <h2>{isEdit ? 'Editar Marca' : 'Nueva Marca'}</h2>
      <form onSubmit={handleSubmit} className="mf-form">
        <div className="mf-group">
          <label>Nombre *</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mf-group">
          <label>Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          {logoPreview && (
            <div className="mf-logo-preview">
              <img src={logoPreview} alt="Logo preview" />
            </div>
          )}
        </div>

        <div className="mf-group mf-checkbox">
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

        <div className="mf-actions">
          <button
            type="button"
            className="mf-btn mf-btn-cancel"
            onClick={() => navigate('/productos/marcas')}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="mf-btn mf-btn-submit"
            disabled={loading}
          >
            {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MarcaForm;