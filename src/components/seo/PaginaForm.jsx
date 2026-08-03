import React, { useState, useEffect } from 'react';
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

  return (
    <form className="cm-paginas-form" onSubmit={handleSubmit}>
      <div className="cm-paginas-form-group">
        <label>Título *</label>
        <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} required />
      </div>

      <div className="cm-paginas-form-group">
        <label>Slug *</label>
        <input type="text" name="slug" value={formData.slug} onChange={handleChange} required placeholder="ej: nosotros" />
        <small>Se usará en la URL: /{formData.slug || '...'}</small>
      </div>

      <div className="cm-paginas-form-group">
        <label>Contenido (HTML)</label>
        <textarea name="contenido" value={formData.contenido} onChange={handleChange} rows="8" placeholder="<p>Contenido de la página...</p>" />
      </div>

      <div className="cm-paginas-form-group">
        <label>
          <input type="checkbox" name="activo" checked={formData.activo} onChange={handleChange} />
          Activo
        </label>
      </div>

      <hr />
      <h4>SEO de la página</h4>

      <div className="cm-paginas-form-group">
        <label>Meta Título</label>
        <input type="text" name="seo.meta_titulo" value={formData.seo.meta_titulo} onChange={handleChange} maxLength="70" />
      </div>

      <div className="cm-paginas-form-group">
        <label>Meta Descripción</label>
        <textarea name="seo.meta_descripcion" value={formData.seo.meta_descripcion} onChange={handleChange} rows="2" maxLength="160" />
      </div>

      <div className="cm-paginas-form-group">
        <label>
          <input type="checkbox" name="seo.indexar" checked={formData.seo.indexar} onChange={handleChange} />
          Indexar
        </label>
      </div>
      <div className="cm-paginas-form-group">
        <label>
          <input type="checkbox" name="seo.seguir_enlaces" checked={formData.seo.seguir_enlaces} onChange={handleChange} />
          Seguir enlaces
        </label>
      </div>

      <div className="cm-paginas-form-group">
        <label>OG Título</label>
        <input type="text" name="seo.og_titulo" value={formData.seo.og_titulo} onChange={handleChange} />
      </div>

      <div className="cm-paginas-form-group">
        <label>OG Descripción</label>
        <textarea name="seo.og_descripcion" value={formData.seo.og_descripcion} onChange={handleChange} rows="2" />
      </div>

      <div className="cm-paginas-form-group">
        <label>Twitter Card Tipo</label>
        <select name="seo.twitter_card_tipo" value={formData.seo.twitter_card_tipo} onChange={handleChange}>
          <option value="summary">summary</option>
          <option value="summary_large_image">summary_large_image</option>
        </select>
      </div>

      <div className="cm-paginas-form-actions">
        <button type="submit" className="cm-paginas-btn-primary">Guardar</button>
        <button type="button" className="cm-paginas-btn-secondary" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
};

export default PaginaForm;