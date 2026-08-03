import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { upsertSeo } from '../../services/seoService';
import './SeoForm.css';

const SeoForm = ({ initialData, onSave, onCancel, token }) => {
  const [formData, setFormData] = useState({
    ruta_url: '',
    entidad_tipo: '',
    entidad_id: '',
    producto_id: '',
    blog_id: '',
    categoria_id: '',
    pagina_estatica_id: '',
    meta_titulo: '',
    meta_descripcion: '',
    frase_clave: '',
    indexar: true,
    seguir_enlaces: true,
    meta_robots_extra: '',
    titulo_migas_pan: '',
    url_canonica: '',
    og_titulo: '',
    og_descripcion: '',
    og_imagen_url: '',
    twitter_card_tipo: 'summary_large_image',
    schema_json: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        entidad_id: initialData.entidad_id || '',
        producto_id: initialData.producto_id || '',
        blog_id: initialData.blog_id || '',
        categoria_id: initialData.categoria_id || '',
        pagina_estatica_id: initialData.pagina_estatica_id || '',
        schema_json: initialData.schema_json ? JSON.stringify(initialData.schema_json, null, 2) : '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        id: initialData?.id || undefined,
        entidad_id: formData.entidad_id ? parseInt(formData.entidad_id) : null,
        producto_id: formData.producto_id ? parseInt(formData.producto_id) : null,
        blog_id: formData.blog_id ? parseInt(formData.blog_id) : null,
        categoria_id: formData.categoria_id ? parseInt(formData.categoria_id) : null,
        pagina_estatica_id: formData.pagina_estatica_id ? parseInt(formData.pagina_estatica_id) : null,
        schema_json: formData.schema_json ? JSON.parse(formData.schema_json) : null,
      };
      await upsertSeo(payload, token);
      onSave();
    } catch (error) {
      alert('Error al guardar: ' + error.message);
    }
  };

  return createPortal(
    <div className="cm-seo-modal-overlay">
      <div className="cm-seo-modal-content">
        <div className="cm-seo-modal-header">
          <h3>{initialData?.id ? '✏️ Editar Registro SEO' : '✨ Nuevo Registro SEO'}</h3>
          <button type="button" className="cm-seo-btn-close" onClick={onCancel}>&times;</button>
        </div>

        <form className="cm-seo-form" onSubmit={handleSubmit}>
          <div className="cm-seo-form-grid">
            <div className="cm-seo-form-group">
              <label>Ruta URL *</label>
              <input type="text" name="ruta_url" value={formData.ruta_url} onChange={handleChange} required placeholder="Ej: /productos" />
            </div>

            <div className="cm-seo-form-group">
              <label>Entidad Tipo</label>
              <input type="text" name="entidad_tipo" value={formData.entidad_tipo || ''} onChange={handleChange} placeholder="Ej: PRODUCTO, BLOG" />
            </div>

            <div className="cm-seo-form-group">
              <label>Entidad ID</label>
              <input type="number" name="entidad_id" value={formData.entidad_id || ''} onChange={handleChange} placeholder="ID..." />
            </div>

            <div className="cm-seo-form-group">
              <label>Producto ID</label>
              <input type="number" name="producto_id" value={formData.producto_id || ''} onChange={handleChange} placeholder="ID..." />
            </div>
            
            <div className="cm-seo-form-group">
              <label>Blog ID</label>
              <input type="number" name="blog_id" value={formData.blog_id || ''} onChange={handleChange} placeholder="ID..." />
            </div>
            
            <div className="cm-seo-form-group">
              <label>Categoría ID</label>
              <input type="number" name="categoria_id" value={formData.categoria_id || ''} onChange={handleChange} placeholder="ID..." />
            </div>
            
            <div className="cm-seo-form-group">
              <label>Página Estática ID</label>
              <input type="number" name="pagina_estatica_id" value={formData.pagina_estatica_id || ''} onChange={handleChange} placeholder="ID..." />
            </div>

            <div className="cm-seo-form-group full-width">
              <label>Meta Título</label>
              <input type="text" name="meta_titulo" value={formData.meta_titulo || ''} onChange={handleChange} maxLength="70" placeholder="Título optimizado para buscadores..." />
            </div>

            <div className="cm-seo-form-group full-width">
              <label>Meta Descripción</label>
              <textarea name="meta_descripcion" value={formData.meta_descripcion || ''} onChange={handleChange} rows="2" maxLength="160" placeholder="Descripción resumida..." />
            </div>

            <div className="cm-seo-form-group full-width">
              <label>Frase Clave</label>
              <input type="text" name="frase_clave" value={formData.frase_clave || ''} onChange={handleChange} placeholder="Palabra clave principal..." />
            </div>

            <div className="cm-seo-form-group checkbox-group-inline">
              <label className="checkbox-label">
                <input type="checkbox" name="indexar" checked={formData.indexar} onChange={handleChange} />
                Indexar
              </label>
            </div>
            
            <div className="cm-seo-form-group checkbox-group-inline">
              <label className="checkbox-label">
                <input type="checkbox" name="seguir_enlaces" checked={formData.seguir_enlaces} onChange={handleChange} />
                Seguir enlaces
              </label>
            </div>

            <div className="cm-seo-form-group full-width">
              <label>Meta Robots Extra</label>
              <input type="text" name="meta_robots_extra" value={formData.meta_robots_extra || ''} onChange={handleChange} placeholder="Ej: noarchive, nosnippet" />
            </div>

            <div className="cm-seo-form-group full-width">
              <label>Título Migas de Pan</label>
              <input type="text" name="titulo_migas_pan" value={formData.titulo_migas_pan || ''} onChange={handleChange} placeholder="Título en el breadcrumb..." />
            </div>

            <div className="cm-seo-form-group full-width">
              <label>URL Canónica</label>
              <input type="text" name="url_canonica" value={formData.url_canonica || ''} onChange={handleChange} placeholder="https://..." />
            </div>

            <div className="cm-seo-form-group full-width">
              <label>OG Título</label>
              <input type="text" name="og_titulo" value={formData.og_titulo || ''} onChange={handleChange} placeholder="Título para redes sociales..." />
            </div>

            <div className="cm-seo-form-group full-width">
              <label>OG Descripción</label>
              <textarea name="og_descripcion" value={formData.og_descripcion || ''} onChange={handleChange} rows="2" placeholder="Descripción para compartir..." />
            </div>

            <div className="cm-seo-form-group full-width">
              <label>OG Imagen URL</label>
              <input type="text" name="og_imagen_url" value={formData.og_imagen_url || ''} onChange={handleChange} placeholder="https://..." />
            </div>

            <div className="cm-seo-form-group full-width">
              <label>Twitter Card Tipo</label>
              <select name="twitter_card_tipo" value={formData.twitter_card_tipo} onChange={handleChange}>
                <option value="summary">summary</option>
                <option value="summary_large_image">summary_large_image</option>
                <option value="app">app</option>
                <option value="player">player</option>
              </select>
            </div>

            <div className="cm-seo-form-group full-width">
              <label>Schema JSON (JSON-LD)</label>
              <textarea name="schema_json" value={formData.schema_json || ''} onChange={handleChange} rows="5" placeholder='{"@context":"https://schema.org", ...}' />
            </div>
          </div>

          <div className="cm-seo-form-actions">
            <button type="submit" className="cm-seo-btn-primary">Guardar</button>
            <button type="button" className="cm-seo-btn-secondary" onClick={onCancel}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default SeoForm;