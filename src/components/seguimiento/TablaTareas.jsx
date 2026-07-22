import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './TablaTareas.css';

// ==============================
// ICONOS SVG (puedes sustituir por react-icons)
// ==============================
const IconEdit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const IconPlay = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const IconStop = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
  </svg>
);

const IconDelete = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const TablaTareas = ({ usuarioId, onTareaCambio }) => {
  // ==============================
  // ESTADOS
  // ==============================
  const [tareas, setTareas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(10);
  const [tareaEditando, setTareaEditando] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  // ==============================
  // CARGAR TAREAS DEL USUARIO
  // ==============================
  const cargarTareas = async () => {
    if (!usuarioId) return;
    setCargando(true);
    try {
      const res = await axios.get(`/api/seguimiento/usuario/${usuarioId}/tareas`);
      setTareas(res.data);
    } catch (error) {
      console.error('Error al cargar tareas:', error);
      Swal.fire('Error', 'No se pudieron cargar las tareas', 'error');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarTareas();
  }, [usuarioId]);

  // ==============================
  // FILTRADO Y PAGINACIÓN
  // ==============================
  const tareasFiltradas = tareas.filter(t =>
    t.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.empresa?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.categoria?.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalTareas = tareasFiltradas.length;
  const totalPaginas = Math.ceil(totalTareas / itemsPorPagina);
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const indiceFin = Math.min(indiceInicio + itemsPorPagina, totalTareas);
  const tareasPaginadas = tareasFiltradas.slice(indiceInicio, indiceFin);

  // ==============================
  // CÁLCULO DE TIEMPO TOTAL
  // ==============================
  const calcularTiempoTotal = (tarea) => {
    if (!tarea.intervalos || tarea.intervalos.length === 0) return 0;
    let total = 0;
    tarea.intervalos.forEach(inter => {
      if (inter.fecha_fin) {
        total += new Date(inter.fecha_fin) - new Date(inter.fecha_inicio);
      } else {
        // Si hay intervalo abierto, sumamos hasta ahora (esto solo aplica si está EN_PROCESO)
        total += new Date() - new Date(inter.fecha_inicio);
      }
    });
    return total;
  };

  const formatearTiempo = (ms) => {
    if (!ms) return '00:00:00';
    const totalSegundos = Math.floor(ms / 1000);
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
  };

  // ==============================
  // ACCIONES
  // ==============================

  // Reanudar tarea (solo si está PAUSADA)
  const handleReanudar = async (id) => {
    try {
      await axios.post('/api/seguimiento/tarea/reanudar', { tareaId: id });
      Swal.fire('Reanudada', 'La tarea se ha reanudado', 'success');
      cargarTareas();
      if (onTareaCambio) onTareaCambio(); // Notifica al padre para que refresque la tarea activa
    } catch (error) {
      Swal.fire('Error', 'No se pudo reanudar la tarea', 'error');
    }
  };

  // Finalizar tarea (si está EN_PROCESO o PAUSADA)
  const handleFinalizar = async (id) => {
    const confirm = await Swal.fire({
      title: '¿Finalizar tarea?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#dc3545',
      confirmButtonText: 'Sí, finalizar',
      cancelButtonText: 'Cancelar',
    });
    if (!confirm.isConfirmed) return;

    try {
      await axios.post('/api/seguimiento/tarea/finalizar', { tareaId: id });
      Swal.fire('Finalizada', 'La tarea ha sido finalizada', 'success');
      cargarTareas();
      if (onTareaCambio) onTareaCambio();
    } catch (error) {
      Swal.fire('Error', 'No se pudo finalizar la tarea', 'error');
    }
  };

  // Eliminar tarea (solo si está FINALIZADA, o si el usuario es Superadmin)
  const handleEliminar = async (id) => {
    const confirm = await Swal.fire({
      title: '¿Eliminar tarea?',
      text: 'Esta acción es permanente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`/api/seguimiento/tarea/${id}`);
      Swal.fire('Eliminada', 'Tarea eliminada correctamente', 'success');
      cargarTareas();
      if (onTareaCambio) onTareaCambio();
    } catch (error) {
      Swal.fire('Error', 'No se pudo eliminar la tarea', 'error');
    }
  };

  // ==============================
  // MODAL DE EDICIÓN
  // ==============================
  const abrirModalEdicion = (tarea) => {
    setTareaEditando(tarea);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setTareaEditando(null);
    setMostrarModal(false);
  };

  const guardarEdicion = async (e) => {
    e.preventDefault();
    const form = e.target;
    const titulo = form.titulo.value.trim();
    const descripcion = form.descripcion.value.trim();

    if (!titulo) {
      Swal.fire('Error', 'El título es obligatorio', 'warning');
      return;
    }

    try {
      await axios.put(`/api/seguimiento/tarea/${tareaEditando.id}`, { titulo, descripcion });
      Swal.fire('Actualizada', 'Tarea actualizada correctamente', 'success');
      cerrarModal();
      cargarTareas();
    } catch (error) {
      Swal.fire('Error', 'No se pudo actualizar la tarea', 'error');
    }
  };

  // ==============================
  // RENDERIZADO DE ESTADO (BADGE)
  // ==============================
  const renderEstado = (estado) => {
    const clases = {
      EN_PROCESO: 'badge-verde',
      PAUSADA: 'badge-amarillo',
      FINALIZADA: 'badge-gris',
    };
    const textos = {
      EN_PROCESO: 'En progreso',
      PAUSADA: 'Pausada',
      FINALIZADA: 'Finalizada',
    };
    return <span className={`badge-estado ${clases[estado] || ''}`}>{textos[estado] || estado}</span>;
  };

  // ==============================
  // RENDER PRINCIPAL
  // ==============================
  return (
    <div className="tabla-tareas-container">
      {/* Cabecera con búsqueda */}
      <div className="tabla-tareas-header">
        <div className="tabla-tareas-title">
          <h3>Historial de Tareas</h3>
          <span className="tabla-tareas-count">{totalTareas} tareas</span>
        </div>
        <div className="tabla-tareas-search">
          <input
            type="text"
            placeholder="🔍 Buscar por título, empresa o categoría..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="tabla-tareas-input"
          />
        </div>
      </div>

      {/* Contenido de la tabla */}
      {cargando ? (
        <div className="tabla-tareas-loading">Cargando tareas...</div>
      ) : tareasFiltradas.length === 0 ? (
        <div className="tabla-tareas-empty">
          {busqueda ? 'No se encontraron tareas con esa búsqueda.' : 'No hay tareas registradas.'}
        </div>
      ) : (
        <>
          <div className="tabla-tareas-wrapper">
            <table className="tabla-tareas">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Título</th>
                  <th>Empresa</th>
                  <th>Categoría</th>
                  <th>Estado</th>
                  <th>Tiempo total</th>
                  <th>Fecha creación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tareasPaginadas.map((tarea) => {
                  const tiempo = calcularTiempoTotal(tarea);
                  const puedeReanudar = tarea.estado === 'PAUSADA';
                  const puedeFinalizar = tarea.estado === 'EN_PROCESO' || tarea.estado === 'PAUSADA';
                  const puedeEliminar = tarea.estado === 'FINALIZADA'; // solo finalizadas

                  return (
                    <tr key={tarea.id} className="tabla-fila">
                      <td>{tarea.id}</td>
                      <td>{tarea.titulo}</td>
                      <td>{tarea.empresa?.nombre || 'Sin empresa'}</td>
                      <td>{tarea.categoria?.nombre || 'Sin categoría'}</td>
                      <td>{renderEstado(tarea.estado)}</td>
                      <td>{formatearTiempo(tiempo)}</td>
                      <td>{new Date(tarea.fecha_creacion).toLocaleDateString()}</td>
                      <td>
                        <div className="tabla-acciones">
                          {/* Editar siempre visible */}
                          <button
                            className="btn-accion btn-editar"
                            onClick={() => abrirModalEdicion(tarea)}
                            title="Editar"
                          >
                            <IconEdit />
                          </button>

                          {/* Reanudar solo si está PAUSADA */}
                          {puedeReanudar && (
                            <button
                              className="btn-accion btn-reanudar"
                              onClick={() => handleReanudar(tarea.id)}
                              title="Reanudar"
                            >
                              <IconPlay />
                            </button>
                          )}

                          {/* Finalizar si está EN_PROCESO o PAUSADA */}
                          {puedeFinalizar && (
                            <button
                              className="btn-accion btn-finalizar"
                              onClick={() => handleFinalizar(tarea.id)}
                              title="Finalizar"
                            >
                              <IconStop />
                            </button>
                          )}

                          {/* Eliminar solo si está FINALIZADA */}
                          {puedeEliminar && (
                            <button
                              className="btn-accion btn-eliminar"
                              onClick={() => handleEliminar(tarea.id)}
                              title="Eliminar"
                            >
                              <IconDelete />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="tabla-paginacion">
            <div className="tabla-paginacion-info">
              Mostrando {indiceInicio + 1} - {indiceFin} de {totalTareas} tareas
            </div>
            <div className="tabla-paginacion-controls">
              <select
                value={itemsPorPagina}
                onChange={(e) => {
                  setItemsPorPagina(Number(e.target.value));
                  setPaginaActual(1);
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
              <button
                className="btn-pagina"
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual(paginaActual - 1)}
              >
                ◀
              </button>
              <span className="pagina-actual">{paginaActual} / {totalPaginas}</span>
              <button
                className="btn-pagina"
                disabled={paginaActual === totalPaginas}
                onClick={() => setPaginaActual(paginaActual + 1)}
              >
                ▶
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal de edición */}
      {mostrarModal && tareaEditando && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Editar Tarea</h3>
            <form onSubmit={guardarEdicion}>
              <div className="modal-field">
                <label>Título</label>
                <input name="titulo" defaultValue={tareaEditando.titulo} required />
              </div>
              <div className="modal-field">
                <label>Descripción</label>
                <textarea name="descripcion" defaultValue={tareaEditando.descripcion || ''} rows="3" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancelar" onClick={cerrarModal}>Cancelar</button>
                <button type="submit" className="btn-guardar">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablaTareas;