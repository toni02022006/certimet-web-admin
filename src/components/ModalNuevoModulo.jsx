import { useState } from 'react';

export default function ModalNuevoModulo({ onClose, onModuloCreado }) {
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // Ajusta la URL a tu puerto del backend (ej. 3000) o a producción si ya está subido
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/modulos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el módulo');
      }

      // Si todo sale bien, avisamos al componente padre y cerramos
      onModuloCreado(data.modulo);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>Crear Nuevo Módulo</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label>Nombre del Módulo</label>
            <input 
              type="text" 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Gestión de Blog"
              style={styles.input}
              required
            />
          </div>
          
          {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
          
          <div style={styles.botones}>
            <button type="button" onClick={onClose} style={styles.btnCancelar}>Cancelar</button>
            <button type="submit" style={styles.btnGuardar}>Guardar Módulo</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Estilos básicos en línea (puedes reemplazarlos por tus clases de CSS si prefieres)
const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000
  },
  modal: {
    backgroundColor: '#fff', padding: '20px', borderRadius: '8px',
    width: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  input: {
    width: '100%', padding: '8px', marginTop: '5px',
    boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px'
  },
  botones: {
    display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'
  },
  btnCancelar: {
    padding: '8px 15px', border: 'none', backgroundColor: '#ccc', borderRadius: '4px', cursor: 'pointer'
  },
  btnGuardar: {
    padding: '8px 15px', border: 'none', backgroundColor: '#28a745', color: 'white', borderRadius: '4px', cursor: 'pointer'
  }
};