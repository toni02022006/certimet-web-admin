import { useState } from 'react';
import { createPortal } from 'react-dom';
import './ModalNuevoModulo.css';

export default function ModalNuevoModulo({ onClose, onModuloCreado }) {
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/modulos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el módulo');
      }

      onModuloCreado(data.modulo);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>✨ Crear Nuevo Módulo</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre del Módulo</label>
            <input 
              type="text" 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Gestión de Blog"
              className="form-input"
              required
            />
          </div>
          
          {error && <p className="error-message">{error}</p>}
          
          <div className="btn-group">
            <button type="button" onClick={onClose} className="btn-cancelar">Cancelar</button>
            <button type="submit" className="btn-guardar">Guardar Módulo</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}