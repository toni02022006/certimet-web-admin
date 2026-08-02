import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // 🔥 1. IMPORTAMOS CREATEPORTAL
import Swal from 'sweetalert2';
import './Plantillas.css';

// Mismo IconEdit que se usa en Productos
const IconEdit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const Plantillas = ({ onApplyTemplate }) => {
  const [plantillas, setPlantillas] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estados para el Modal y el Formulario
  const [mostrarModal, setMostrarModal] = useState(false);
  const [plantillaEditando, setPlantillaEditando] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', asunto: '', contenido: '' });
  const [busqueda, setBusqueda] = useState('');

  // Cargar las plantillas desde el backend al montar el componente
  const cargarPlantillas = async () => {
    setCargando(true);
    try {
      const response = await fetch('http://localhost:3000/api/newsletter/plantillas');
      const data = await response.json();
      setPlantillas(data);
    } catch (error) {
      console.error("Error al cargar plantillas:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPlantillas();
  }, []);

  // --- Funciones CRUD ---
  const abrirModalCrear = () => {
    setPlantillaEditando(null);
    setFormData({ nombre: '', asunto: '', contenido: '' });
    setMostrarModal(true);
  };

  const abrirModalEditar = (plantilla) => {
    setPlantillaEditando(plantilla);
    setFormData({ nombre: plantilla.nombre, asunto: plantilla.asunto, contenido: plantilla.contenido });
    setMostrarModal(true);
  };

  const eliminarPlantilla = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta plantilla?')) {
      try {
        await fetch(`http://localhost:3000/api/newsletter/plantillas/${id}`, {
          method: 'DELETE'
        });
        cargarPlantillas(); // Recargar lista después de eliminar
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert('No se pudo eliminar la plantilla.');
      }
    }
  };

  // Guardar (Crear o Editar) conectado al backend
  const guardarPlantilla = async (e) => {
    e.preventDefault();
    try {
      const url = plantillaEditando
        ? `http://localhost:3000/api/newsletter/plantillas/${plantillaEditando.id}`
        : 'http://localhost:3000/api/newsletter/plantillas';
      
      const method = plantillaEditando ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMostrarModal(false);
        cargarPlantillas(); // Recargamos la lista para ver los cambios
      } else {
        const errorData = await response.json();
        Swal.fire('Error', `Error: ${errorData.error || 'No se pudo guardar la plantilla.'}`, 'error');
      }
    } catch (error) {
      console.error("Error al guardar plantilla:", error);
      Swal.fire('Error', 'Error de conexión con el servidor.', 'error');
    }
  };

  // --- Función para "Usar Plantilla" con confirmación usando SweetAlert2 ---
  const aplicarPlantilla = (plantilla) => {
    Swal.fire({
      title: `¿Usar la plantilla "${plantilla.nombre}"?`,
      text: 'Se cargará el asunto y el contenido en la pestaña de Redactar Campaña.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, usar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        if (onApplyTemplate) {
          onApplyTemplate({
            asunto: plantilla.asunto,
            contenido: plantilla.contenido
          });
          // Opcional: mostrar un mensaje de éxito
          Swal.fire({
            title: '¡Plantilla aplicada!',
            text: `Se ha cargado la plantilla "${plantilla.nombre}" en el editor.`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        } else {
          Swal.fire(
            'Aviso',
            `Plantilla "${plantilla.nombre}" lista para usar, pero no se pudo cambiar de pestaña automáticamente.`,
            'info'
          );
        }
      }
    });
  };

  // Filtrado de búsqueda
  const plantillasFiltradas = plantillas.filter(p => 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.asunto.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="plantillas-wrapper">
      <div className="plantillas-header">
        <h3>Banco de Plantillas</h3>
        <div className="plantillas-acciones">
          <input 
            type="text" 
            placeholder="Buscar plantilla..." 
            className="input-busqueda"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <button className="btn-nueva-plantilla" onClick={abrirModalCrear}>
            + Nueva Plantilla
          </button>
        </div>
      </div>

      {cargando ? (
        <div className="plantillas-vacio" style={{ padding: '20px' }}>
          <p>Cargando plantillas desde la base de datos...</p>
        </div>
      ) : plantillasFiltradas.length === 0 ? (
        <div className="plantillas-vacio">
          <p>No hay plantillas guardadas aún. <br />¡Crea la primera haciendo clic en el botón superior!</p>
        </div>
      ) : (
        <div className="plantillas-grid">
          {plantillasFiltradas.map((p) => (
            <div key={p.id} className="plantilla-card">
              <div className="plantilla-card-body">
                <div className="plantilla-preview">
                  <div className="plantilla-preview-inner" dangerouslySetInnerHTML={{ __html: p.contenido }} />
                </div>
              </div>
              <div className="plantilla-card-footer">
                <div className="acciones-crud">
                  <button className="btn-icon editar" onClick={() => abrirModalEditar(p)}>
                    <IconEdit />
                  </button>
                </div>
                <button className="btn-usar-plantilla" onClick={() => aplicarPlantilla(p)}>
                  Usar esta plantilla
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- MODAL PARA CREAR/EDITAR ENVUELTO EN CREATEPORTAL --- */}
      {mostrarModal && createPortal(
        <div className="modal-overlay">
          <div className="modal-contenido">
            <h3>{plantillaEditando ? '✏️ Editar Plantilla' : 'Nueva Plantilla'}</h3>
            <form onSubmit={guardarPlantilla}>
              <div className="form-group">
                <label>Nombre de la plantilla:</label>
                <input 
                  type="text" 
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  placeholder="Ej: Boletín Semanal"
                />
              </div>
              <div className="form-group">
                <label>Asunto del correo:</label>
                <input 
                  type="text" 
                  required
                  value={formData.asunto}
                  onChange={(e) => setFormData({...formData, asunto: e.target.value})}
                  placeholder="Ej: ¡Novedades de la semana!"
                />
              </div>
              <div className="form-group">
                <label>Contenido HTML:</label>
                <textarea 
                  rows="6"
                  required
                  value={formData.contenido}
                  onChange={(e) => setFormData({...formData, contenido: e.target.value})}
                  placeholder="<div>Escribe tu HTML aquí...</div>"
                ></textarea>
              </div>
              <div className="modal-acciones">
                <button type="button" className="btn-cancelar" onClick={() => setMostrarModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar">
                  Guardar Plantilla
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body // 🔥 2. LO RENDERIZAMOS EN EL BODY
      )}
    </div>
  );
};

export default Plantillas;