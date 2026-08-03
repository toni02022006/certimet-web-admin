import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getPaginas, deletePagina } from '../services/paginaService';
import PaginaForm from '../components/seo/PaginaForm';
import './Paginas.css';

const Paginas = () => {
  const { token } = useContext(AuthContext);
  const [paginas, setPaginas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPagina, setEditingPagina] = useState(null);

  const loadPaginas = async () => {
    try {
      const data = await getPaginas(token);
      setPaginas(data);
    } catch (error) {
      console.error('Error al cargar páginas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaginas();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta página?')) return;
    try {
      await deletePagina(id, token);
      await loadPaginas();
    } catch (error) {
      alert('Error al eliminar: ' + error.message);
    }
  };

  const handleEdit = (pagina) => {
    setEditingPagina(pagina);
    setShowModal(true);
  };

  const handleNew = () => {
    setEditingPagina(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingPagina(null);
  };

  const handleSave = () => {
    loadPaginas();
    setShowModal(false);
    setEditingPagina(null);
  };

  if (loading) return <div className="cm-paginas-loading">Cargando...</div>;

  return (
    <div className="cm-paginas-container">
      <div className="cm-paginas-header">
        <h2>Gestión de Páginas Estáticas</h2>
        <button className="cm-paginas-btn-primary" onClick={handleNew}>
          + Nueva Página
        </button>
      </div>

      <table className="cm-paginas-table">
        <thead>
          <tr>
            <th>Título</th>
            <th>Slug</th>
            <th>Activo</th>
            <th>Fecha Creación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {paginas.length === 0 ? (
            <tr><td colSpan="5">No hay páginas</td></tr>
          ) : (
            paginas.map((pagina) => (
              <tr key={pagina.id}>
                <td>{pagina.titulo}</td>
                <td>/ {pagina.slug}</td>
                <td>{pagina.activo ? '✅' : '❌'}</td>
                <td>{new Date(pagina.fecha_creacion).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleEdit(pagina)} className="cm-paginas-btn-edit">Editar</button>
                  <button onClick={() => handleDelete(pagina.id)} className="cm-paginas-btn-delete">Eliminar</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showModal && (
        <div className="cm-paginas-modal-overlay" onClick={handleModalClose}>
          <div className="cm-paginas-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingPagina ? 'Editar Página' : 'Nueva Página'}</h3>
            <PaginaForm 
              initialData={editingPagina} 
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

export default Paginas;