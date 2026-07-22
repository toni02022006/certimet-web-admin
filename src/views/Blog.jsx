import { useState, useEffect, useContext } from 'react';
import Swal from 'sweetalert2';
import { AuthContext } from '../context/AuthContext';
import ReactQuill from 'react-quill-new'; 
import 'react-quill-new/dist/quill.snow.css'; 

const Blog = () => {
  const { usuario } = useContext(AuthContext);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [articulos, setArticulos] = useState([]);
  
  const [formData, setFormData] = useState({
    titulo: '',
    subtitulo: '',
    categoria: '',
    fecha_publicacion: '',
    minutos_lectura: 1,
    imagen_url: '',
    contenido: ''
  });

  // Estado adicional para mostrar la imagen subida en la previsualización
  const [imagenPreview, setImagenPreview] = useState(null);

  const fetchArticulos = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/blog');
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

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Cambiamos el límite a 10MB (10 * 1024 * 1024)
      if (file.size > 10 * 1024 * 1024) {
        Swal.fire({ icon: 'warning', title: 'Imagen muy pesada', text: 'El peso máximo permitido es de 10MB.' });
        e.target.value = null;
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenPreview(reader.result); 
        setFormData(prev => ({ ...prev, imagen_url: reader.result })); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQuillChange = (content, delta, source, editor) => {
    const text = editor.getText();
    const wordCount = text.trim().split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200); 
    
    setFormData(prev => ({ 
      ...prev, 
      contenido: content,
      minutos_lectura: readingTime === 0 ? 1 : readingTime
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.contenido === '<p><br></p>' || formData.contenido.trim() === '') {
      Swal.fire({ icon: 'warning', title: 'Falta contenido', text: 'Por favor, escribe el artículo.' });
      return;
    }

    const payload = { ...formData, autor_id: usuario.id };

    try {
      const response = await fetch('http://localhost:3000/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resultado = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'El artículo fue publicado correctamente en el sistema.',
          confirmButtonColor: '#28a745'
        });
        
        setModalAbierto(false);
        setFormData({ titulo: '', subtitulo: '', categoria: '', fecha_publicacion: '', minutos_lectura: 1, imagen_url: '', contenido: '' });
        setImagenPreview(null);
        fetchArticulos(); 
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: resultado.error, confirmButtonColor: '#002f6c' });
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error de conexión', text: 'No se pudo conectar con el servidor.', confirmButtonColor: '#002f6c' });
    }
  };

  const styles = {
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    btnNuevo: { padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
    table: { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', fontSize: '14px' },
    th: { backgroundColor: '#f8f9fa', padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' },
    td: { padding: '12px', borderBottom: '1px solid #dee2e6' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    // Aumentamos el width a 1000px y agregamos display flex para partirlo a la mitad
    modalContent: { backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '1000px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', gap: '30px' },
    formSection: { flex: '1', display: 'flex', flexDirection: 'column' },
    previewSection: { flex: '1', borderLeft: '1px solid #eee', paddingLeft: '30px', display: 'flex', flexDirection: 'column', overflowY: 'auto' },
    formGroup: { display: 'flex', flexDirection: 'column', marginBottom: '15px' },
    input: { padding: '10px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '4px' },
    btnGroup: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
    btnCancelar: { padding: '10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    btnGuardar: { padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }
  };

  const modules = {
    toolbar: [
      [{ 'header': [2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['clean']
    ],
  };

  return (
    <div>
      <div style={styles.topBar}>
        <h2>Gestión del Blog</h2>
        <button style={styles.btnNuevo} onClick={() => setModalAbierto(true)}>+ Nuevo Artículo</button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Categoría</th>
            <th style={styles.th}>Título</th>
            <th style={styles.th}>Autor</th>
            <th style={styles.th}>Fecha Pub.</th>
            <th style={styles.th}>Estado</th>
            <th style={styles.th}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {articulos.length > 0 ? (
            articulos.map((art) => (
              <tr key={art.id}>
                <td style={styles.td}>{art.id}</td>
                <td style={styles.td}><strong>{art.categoria}</strong></td>
                <td style={styles.td}>{art.titulo}</td>
                <td style={styles.td}>{art.autor?.nombre} {art.autor?.apellidos}</td>
                <td style={styles.td}>{new Date(art.fecha_publicacion).toLocaleDateString()}</td>
                <td style={styles.td}>
                  <span style={{ padding: '4px 8px', borderRadius: '12px', backgroundColor: art.activo ? '#d4edda' : '#f8d7da', color: art.activo ? '#155724' : '#721c24', fontSize: '12px' }}>
                    {art.activo ? 'Publicado' : 'Oculto'}
                  </span>
                </td>
                <td style={styles.td}>
                  <button style={{marginRight: '5px', color: '#007bff', background: 'none', border: 'none', cursor: 'pointer'}}>Editar</button>
                  <button style={{color: 'red', background: 'none', border: 'none', cursor: 'pointer'}}>Eliminar</button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="7" style={{...styles.td, textAlign: 'center'}}>No hay artículos publicados aún.</td></tr>
          )}
        </tbody>
      </table>

      {modalAbierto && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            
            {/* IZQUIERDA: FORMULARIO */}
            <div style={styles.formSection}>
              <h3>Redactar Nuevo Artículo</h3>
              <form onSubmit={handleSubmit}>
                <div style={styles.formGroup}>
                  <label>Título del Artículo</label>
                  <input style={styles.input} type="text" name="titulo" value={formData.titulo} onChange={handleInputChange} required />
                </div>
                
                <div style={styles.formGroup}>
                  <label>Subtítulo (Breve descripción)</label>
                  <input style={styles.input} type="text" name="subtitulo" value={formData.subtitulo} onChange={handleInputChange} />
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{...styles.formGroup, flex: 1}}>
                    <label>Categoría</label>
                    <select style={styles.input} name="categoria" value={formData.categoria} onChange={handleInputChange} required>
                      <option value="" disabled>Seleccione...</option>
                      <option value="METROLOGIA">Metrología</option>
                      <option value="AUTOMATIZACION">Automatización</option>
                      <option value="NORMATIVAS">Normativas</option>
                    </select>
                  </div>
                  <div style={{...styles.formGroup, flex: 1}}>
                    <label>Fecha de Publicación</label>
                    <input style={styles.input} type="date" name="fecha_publicacion" value={formData.fecha_publicacion} onChange={handleInputChange} required />
                  </div>
                  <div style={{...styles.formGroup, width: '100px'}}>
                    <label>Min. Lect.</label>
                    <input 
                        style={styles.input} 
                        type="number" 
                        name="minutos_lectura" 
                        value={formData.minutos_lectura} 
                        onChange={handleInputChange} 
                        min="1" 
                    />
                    </div>
                </div>

                <div style={styles.formGroup}>
                  <label>Subir Imagen de Portada</label>
                  <input style={{...styles.input, padding: '5px'}} type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} />
                
                <small style={{ color: '#666', fontSize: '12.5px', marginTop: '6px', fontStyle: 'italic' }}>
                    * Recomendado: Formato <strong>WebP</strong> o <strong>JPG</strong> (carga más rápido). Peso máx: <strong>10MB</strong>.
                  </small>
                </div>

                <div style={{...styles.formGroup, marginBottom: '50px'}}>
                  <label style={{marginBottom: '5px'}}>Contenido del Artículo</label>
                  <ReactQuill 
                    theme="snow" 
                    value={formData.contenido} 
                    onChange={handleQuillChange}
                    modules={modules}
                    style={{ height: '200px' }}
                  />
                </div>

                <div style={styles.btnGroup}>
                  <button type="button" style={styles.btnCancelar} onClick={() => setModalAbierto(false)}>Cancelar</button>
                  <button type="submit" style={styles.btnGuardar}>Publicar Artículo</button>
                </div>
              </form>
            </div>

            {/* DERECHA: PREVISUALIZACIÓN */}
            <div style={styles.previewSection}>
              <h3 style={{color: '#002f6c', borderBottom: '2px solid #eee', paddingBottom: '10px'}}>Previsualización</h3>
              
              <div style={{ marginTop: '15px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ backgroundColor: '#00d639', color: 'white', padding: '4px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold' }}>
                    {formData.categoria || 'CATEGORÍA'}
                  </span>
                  <span style={{ color: '#666', fontSize: '13px' }}>⏱️ {formData.minutos_lectura} min de lectura</span>
                </div>
                
                <h1 style={{ fontSize: '24px', margin: '0 0 10px 0', lineHeight: '1.3', color: '#333' }}>
                  {formData.titulo || 'Título del artículo...'}
                </h1>
                
                <p style={{ color: '#666', fontSize: '16px', margin: '0 0 20px 0', fontStyle: 'italic' }}>
                  {formData.subtitulo || 'El subtítulo aparecerá aquí...'}
                </p>

                {imagenPreview ? (
                  <img src={imagenPreview} alt="Portada" style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '8px', marginBottom: '20px' }} />
                ) : (
                  <div style={{ width: '100%', height: '220px', backgroundColor: '#e9ecef', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#999', marginBottom: '20px' }}>
                    Sube una imagen para ver la portada
                  </div>
                )}

                <div 
                  className="quill-content-preview"
                  dangerouslySetInnerHTML={{ __html: formData.contenido }} 
                  style={{ lineHeight: '1.6', color: '#444' }}
                />
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Blog;