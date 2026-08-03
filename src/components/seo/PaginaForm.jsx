import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { upsertPagina } from '../../services/paginaService';
import './PaginaForm.css';

const PaginaForm = ({ initialData, onSave, onCancel, token }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    slug: '',
    contenido: '',
    activo: true,
    seo: {
      meta_titulo: '',
      meta_descripcion: '',
      indexar: true,
      seguir_enlaces: true,
      og_titulo: '',
      og_descripcion: '',
      twitter_card_tipo: 'summary_large_image',
    },
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        titulo: initialData.titulo || '',
        slug: initialData.slug || '',
        contenido: initialData.contenido || '',
        activo: initialData.activo !== undefined ? initialData.activo : true,
        seo: {
          meta_titulo: initialData.seo?.meta_titulo || '',
          meta_descripcion: initialData.seo?.meta_descripcion || '',
          indexar: initialData.seo?.indexar !== undefined ? initialData.seo.indexar : true,
          seguir_enlaces: initialData.seo?.seguir_enlaces !== undefined ? initialData.seo.seguir_enlaces : true,
          og_titulo: initialData.seo?.og_titulo || '',
          og_descripcion: initialData.seo?.og_descripcion || '',
          twitter_card_tipo: initialData.seo?.twitter_card_tipo || 'summary_large_image',
        }
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('seo.')) {
      const seoField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        seo: {
          ...prev.seo,
          [seoField]: type === 'checkbox' ? checked : value,
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        id: initialData?.id || undefined,
        titulo: formData.titulo,
        slug: formData.slug,
        contenido: formData.contenido,
        activo: formData.activo,
        seo: formData.seo,
      };
      await upsertPagina(payload, token);
      onSave();
    } catch (error) {
      alert('Error al guardar: ' + error.message);
    }
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content-pagina">
        <div className="modal-header-pagina">
          <h3>{initialData?.id ? '✏️ Editar Página' : '✨ Nueva Página'}</h3>
          <button type="button" className="btn-cerrar-modal" onClick={onCancel}>&times;</button>
        </div>

        <form className="cm-paginas-form" onSubmit={handleSubmit}>
          <div className="cm-paginas-form-group">
            <label>Título *</label>
            <input type="text" className="cm-input" name="titulo" value={formData.titulo} onChange={handleChange} required placeholder="Ej: Nosotros" />
          </div>

          <div className="cm-paginas-form-group">
            <label>Slug (URL) *</label>
            <div className="slug-input-wrapper">
              <span className="slug-prefix">/</span>
              <input type="text" className="cm-input slug-input" name="slug" value={formData.slug} onChange={handleChange} required placeholder="ej: nosotros" />
            </div>
            <small className="form-hint">URL final: /{formData.slug || '...'}</small>
          </div>

          <div className="cm-paginas-form-group">
            <label>Contenido (HTML)</label>
            <textarea className="cm-textarea" name="contenido" value={formData.contenido} onChange={handleChange} rows="5" placeholder="<p>Escribe el contenido HTML aquí...</p>" />
          </div>

          <div className="cm-paginas-form-group checkbox-wrapper">
            <label className="checkbox-container">
              <input type="checkbox" name="activo" checked={formData.activo} onChange={handleChange} />
              <span className="checkmark"></span>
              Página Activa
            </label>
          </div>

          <div className="modal-divider"></div>
          <h4 className="seo-section-title">⚙️ Configuración SEO y Redes Sociales</h4>

          <div className="cm-form-grid">
            <div className="cm-paginas-form-group">
              <label>Meta Título</label>
              <input type="text" className="cm-input" name="seo.meta_titulo" value={formData.seo.meta_titulo} onChange={handleChange} maxLength="70" placeholder="Título para buscadores" />
            </div>
            <div className="cm-paginas-form-group">
              <label>Twitter Card</label>
              <select className="cm-select" name="seo.twitter_card_tipo" value={formData.seo.twitter_card_tipo} onChange={handleChange}>
                <option value="summary">Summary</option>
                <option value="summary_large_image">Summary Large Image</option>
              </select>
            </div>
          </div>

          <div className="cm-paginas-form-group">
            <label>Meta Descripción</label>
            <textarea className="cm-textarea" name="seo.meta_descripcion" value={formData.seo.meta_descripcion} onChange={handleChange} rows="2" maxLength="160" placeholder="Breve descripción para Google..." />
          </div>

          <div className="cm-form-grid checkboxes-grid">
            <div className="cm-paginas-form-group checkbox-wrapper">
              <label className="checkbox-container">
                <input type="checkbox" name="seo.indexar" checked={formData.seo.indexar} onChange={handleChange} />
                <span className="checkmark"></span>
                Indexar en buscadores
              </label>
            </div>
            <div className="cm-paginas-form-group checkbox-wrapper">
              <label className="checkbox-container">
                <input type="checkbox" name="seo.seguir_enlaces" checked={formData.seo.seguir_enlaces} onChange={handleChange} />
                <span className="checkmark"></span>
                Seguir enlaces (Follow)
              </label>
            </div>
          </div>

          <div className="cm-paginas-form-group">
            <label>OG Título (Open Graph / Redes Sociales)</label>
            <input type="text" className="cm-input" name="seo.og_titulo" value={formData.seo.og_titulo} onChange={handleChange} placeholder="Título al compartir en Facebook/WhatsApp" />
          </div>

          <div className="cm-paginas-form-group">
            <label>OG Descripción</label>
            <textarea className="cm-textarea" name="seo.og_descripcion" value={formData.seo.og_descripcion} onChange={handleChange} rows="2" placeholder="Descripción al compartir en redes..." />
          </div>

          <div className="cm-paginas-form-actions">
            <button type="button" className="cm-paginas-btn-secondary" onClick={onCancel}>Cancelar</button>
            <button type="submit" className="cm-paginas-btn-primary">Guardar Página</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default PaginaForm;