import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; 
import Swal from 'sweetalert2';
import { AuthContext } from '../../context/AuthContext';
import ReactQuill from 'react-quill-new'; 
import 'react-quill-new/dist/quill.snow.css'; 
import './NuevoArticulo.css';
import ArticuloPreview from './ArticuloPreview'; 

const NuevoArticulo = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const { usuario } = useContext(AuthContext);
  const quillRef = useRef(null);
  
  const [isEditing, setIsEditing] = useState(false);

  // Se agregaron 'activo' y se asegura que 'minutos_lectura' inicie en 1
  const [formData, setFormData] = useState({
    titulo: '',
    subtitulo: '',
    categoria: '',
    fecha_publicacion: '',
    minutos_lectura: 1,
    imagen_url: '',
    contenido: '',
    activo: true // Por defecto, al crear un artículo está activo
  });

  const [showTableModal, setShowTableModal] = useState(false);
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      const fetchArticulo = async () => {
        try {
          const response = await fetch(`http://localhost:3000/api/blog/${id}`);
          if (response.ok) {
            const data = await response.json();
            const fechaFormateada = data.fecha_publicacion 
              ? new Date(data.fecha_publicacion).toISOString().split('T')[0] 
              : '';

            setFormData({
              titulo: data.titulo || '',
              subtitulo: data.subtitulo || '',
              categoria: data.categoria || '',
              fecha_publicacion: fechaFormateada,
              minutos_lectura: data.minutos_lectura || 1,
              imagen_url: data.imagen_url || '',
              contenido: data.contenido || '',
              activo: data.activo !== undefined ? data.activo : true
            });
          } else {
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar el artículo para editar.' });
          }
        } catch (error) {
          console.error("Error al cargar el artículo:", error);
          Swal.fire({ icon: 'error', title: 'Error de conexión', text: 'No se pudo conectar con el servidor.' });
        }
      };
      
      fetchArticulo();
    }
  }, [id]);

  const modulos = {
    toolbar: {
      container: [
        [{ header: [2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ color: [] }, { background: [] }],
        ['link', 'image'],
        ['clean'],
      ],
    },
  };

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        Swal.fire({ icon: 'warning', title: 'Imagen muy pesada', text: 'El peso máximo es 10MB.' });
        e.target.value = null;
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
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
      // Si el usuario no ha puesto un valor manual, lo calculamos automáticamente
      minutos_lectura: prev.minutos_lectura > 1 ? prev.minutos_lectura : (readingTime === 0 ? 1 : readingTime)
    }));
  };

  const generateQuillTableHTML = (rCount, cCount) => {
    let html = '<table width="100%" style="border-collapse: collapse; margin: 15px 0;"><tbody>';
    for (let r = 0; r < rCount; r++) {
      html += '<tr>';
      for (let c = 0; c < cCount; c++) {
        const isHeader = r === 0;
        const style = isHeader 
          ? 'border: 1px solid #ccc; padding: 10px; background-color: #f8f9fa; font-weight: bold; text-align: left;' 
          : 'border: 1px solid #ccc; padding: 10px; text-align: left;';
        const content = isHeader ? `Encabezado ${c + 1}` : `Celda ${r + 1}-${c + 1}`;
        html += `<td style="${style}">${content}</td>`;
      }
      html += '</tr>';
    }
    html += '</tbody></table><p><br></p>'; 
    return html;
  };

  const insertTableWithDelta = () => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      let range = quill.getSelection();
      
      if (!range) {
        const length = quill.getLength();
        quill.setSelection(length, 0);
        range = quill.getSelection();
      }

      if (range) {
        const tableHTML = generateQuillTableHTML(rows, cols);
        quill.clipboard.dangerouslyPasteHTML(range.index, tableHTML);
        setFormData(prev => ({ ...prev, contenido: quill.root.innerHTML }));
        setShowTableModal(false);
      } else {
        alert('Por favor, haz clic en el editor de texto primero para posicionar el cursor.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.contenido === '<p><br></p>' || formData.contenido.trim() === '') {
      Swal.fire({ icon: 'warning', title: 'Falta contenido', text: 'Por favor, escribe el artículo.' });
      return;
    }
    
    // Aseguramos que minutos de lectura se envíe como número
    const payload = { 
      ...formData, 
      autor_id: usuario.id,
      minutos_lectura: parseInt(formData.minutos_lectura) || 1
    };

    const url = isEditing ? `http://localhost:3000/api/blog/${id}` : 'http://localhost:3000/api/blog';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const tituloExito = isEditing ? '¡Actualizado!' : '¡Publicado!';
        const textoExito = isEditing ? 'El artículo fue modificado con éxito.' : 'El artículo ha sido guardado.';
        Swal.fire({ icon: 'success', title: tituloExito, text: textoExito }).then(() => navigate(-1));
      } else {
        const res = await response.json();
        Swal.fire({ icon: 'error', title: 'Error', text: res.error });
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Fallo de conexión al guardar.' });
    }
  };

  return (
    <div className="nuevo-articulo-container">
      <div className="nuevo-articulo-header">
        <button className="btn-volver" onClick={() => navigate(-1)}>← Volver a la lista</button>
        <h2 className="nuevo-articulo-title">{isEditing ? 'Editar Artículo' : 'Redactar Nuevo Artículo'}</h2>
      </div>

      <div className="nuevo-articulo-workspace">
        
        <div className="nuevo-articulo-form">
          <form onSubmit={handleSubmit}>
            
            <div className="form-row">
              <div className="form-group" style={{ flex: 1.5 }}>
                <label>Título del Artículo</label>
                <input className="form-input" type="text" name="titulo" value={formData.titulo} onChange={handleInputChange} placeholder="Ej. Guía definitiva de Metrología" required />
              </div>
              <div className="form-group" style={{ flex: 1.5 }}>
                <label>Subtítulo (Breve descripción)</label>
                <input className="form-input" type="text" name="subtitulo" value={formData.subtitulo} onChange={handleInputChange} placeholder="Un resumen atractivo para los lectores..." />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>Categoría</label>
                {/* Reemplazo por un input con datalist */}
                <input 
                  className="form-input" 
                  type="text"
                  list="categorias-list" 
                  name="categoria" 
                  value={formData.categoria} 
                  onChange={handleInputChange} 
                  placeholder="Escribe o selecciona..."
                  required 
                />
                <datalist id="categorias-list">
                  <option value="METROLOGIA" />
                  <option value="AUTOMATIZACION" />
                  <option value="NORMATIVAS" />
                  <option value="WEBINAR" />
                </datalist>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Fecha de Publicación</label>
                <input className="form-input" type="date" name="fecha_publicacion" value={formData.fecha_publicacion} onChange={handleInputChange} required />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Imagen de Portada</label>
                <input className="form-input file-input" type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} />
              </div>
            </div>

            {/* NUEVA FILA: Minutos de Lectura y Checkbox Activo */}
            <div className="form-row" style={{ marginBottom: '15px' }}>
              <div className="form-group" style={{ flex: 1, maxWidth: '250px' }}>
                <label>Minutos de Lectura (Est.)</label>
                <input 
                  className="form-input" 
                  type="number" 
                  min="1" 
                  name="minutos_lectura" 
                  value={formData.minutos_lectura} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              
              <div className="form-group" style={{ flex: 1, justifyContent: 'center' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Estado de Visibilidad</label>
                <label className="checkbox-estilizado" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
                  <input 
                    type="checkbox" 
                    name="activo" 
                    checked={formData.activo} 
                    onChange={handleInputChange} 
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '15px', color: formData.activo ? '#198754' : '#6c757d', fontWeight: 'bold' }}>
                    {formData.activo ? '✓ Público (Visible en la tienda)' : '∅ Oculto (Guardar como borrador)'}
                  </span>
                </label>
              </div>
            </div>

            <div className="form-group quill-container">
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <span style={{ display: 'block', marginBottom: '4px' }}>Contenido del Artículo</span>
                </div>
                <button 
                  type="button" 
                  className="btn-insertar-tabla-mini" 
                  onClick={() => setShowTableModal(true)}
                >
                  📊 Insertar Tabla
                </button>
              </label>
              <ReactQuill 
                ref={quillRef}
                theme="snow" 
                value={formData.contenido} 
                onChange={handleQuillChange}
                modules={modulos}
                style={{ height: '400px' }} 
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancelar" onClick={() => navigate(-1)}>Cancelar</button>
              <button type="submit" className="btn-guardar">{isEditing ? 'Actualizar Artículo' : 'Guardar Artículo'}</button>
            </div>
          </form>
        </div>

        <div className="nuevo-articulo-preview-wrapper">
          <div className="preview-label">
            <span style={{ marginRight: '8px' }}>👁️</span> 
            Vista Previa en Vivo (Pantalla Completa)
          </div>
          <div className="preview-scroll-container">
            <ArticuloPreview articulo={formData} />
          </div>
        </div>
      </div>

      {/* MODAL DE TABLAS */}
      {showTableModal && (
        <div className="table-modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowTableModal(false)}>
          <div className="table-modal">
            <div className="table-modal-title"><span>📊</span> Insertar Tabla</div>
            <div className="table-modal-input-group">
              <div className="table-modal-input-item">
                <label>Filas</label>
                <input type="number" min="1" max="20" value={rows} onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 1))} />
              </div>
              <div className="table-modal-input-item">
                <label>Columnas</label>
                <input type="number" min="1" max="20" value={cols} onChange={(e) => setCols(Math.max(1, parseInt(e.target.value) || 1))} />
              </div>
            </div>
            <div className="table-modal-buttons">
              <button type="button" className="btn-cancelar" onClick={() => setShowTableModal(false)}>Cancelar</button>
              <button type="button" className="btn-guardar" onClick={insertTableWithDelta}>✅ Insertar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NuevoArticulo;