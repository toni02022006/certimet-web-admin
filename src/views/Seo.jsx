import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getSeoList, deleteSeo } from '../services/seoService';
import SeoForm from '../components/seo/SeoForm';
import './Seo.css';

const Seo = () => {
  const { token } = useContext(AuthContext);
  const [seos, setSeos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSeo, setEditingSeo] = useState(null);

  const loadSeos = async () => {
    try {
      const data = await getSeoList(token);
      setSeos(data);
    } catch (error) {
      console.error('Error al cargar SEO:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeos();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este registro SEO?')) return;
    try {
      await deleteSeo(id, token);
      await loadSeos();
    } catch (error) {
      alert('Error al eliminar: ' + error.message);
    }
  };

  const handleEdit = (seo) => {
    setEditingSeo(seo);
    setShowModal(true);
  };

  const handleNew = () => {
    setEditingSeo(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingSeo(null);
  };

  const handleSave = () => {
    loadSeos();
    setShowModal(false);
    setEditingSeo(null);
  };

  if (loading) return <div className="cm-seo-loading">Cargando...</div>;

  return (
    <div className="cm-seo-container">
      <div className="cm-seo-header">
        <h2>Gestión de SEO</h2>
        <button className="cm-seo-btn-primary" onClick={handleNew}>
          + Nuevo SEO
        </button>
      </div>

      <table className="cm-seo-table">
        <thead>
          <tr>
            <th>Ruta</th>
            <th>Meta Título</th>
            <th>Meta Descripción</th>
            <th>Indexar</th>
            <th>Seguir</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {seos.length === 0 ? (
            <tr><td colSpan="6">No hay registros SEO</td></tr>
          ) : (
            seos.map((seo) => (
              <tr key={seo.id}>
                <td>{seo.ruta_url}</td>
                <td>{seo.meta_titulo || '-'}</td>
                <td>{seo.meta_descripcion || '-'}</td>
                <td>{seo.indexar ? '✅' : '❌'}</td>
                <td>{seo.seguir_enlaces ? '✅' : '❌'}</td>
                <td>
                  <button onClick={() => handleEdit(seo)} className="cm-seo-btn-edit">Editar</button>
                  <button onClick={() => handleDelete(seo.id)} className="cm-seo-btn-delete">Eliminar</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showModal && (
        <div className="cm-seo-modal-overlay" onClick={handleModalClose}>
          <div className="cm-seo-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingSeo ? 'Editar SEO' : 'Nuevo SEO'}</h3>
            <SeoForm 
              initialData={editingSeo} 
              onSave={handleSave} 
              onCancel={handleModalClose}
              token={token}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Seo;