import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api'; 
import Swal from 'sweetalert2';
import FiltrosCalendario from '../components/calendario/FiltrosCalendario';
import EventosPasados from '../components/calendario/EventosPasados';
import ListaMeses from '../components/calendario/ListaMeses';
import VistaMeses from '../components/calendario/VistaMeses';
import AgendaEventos from '../components/calendario/AgendaEventos';
import AgendaTareas from '../components/calendario/AgendaTareas';
import EventoModal from '../components/calendario/EventoModal';
import '../components/calendario/Calendario.css';

const Calendario = () => {
  const { usuario } = useContext(AuthContext);
  
  // ==============================
  // ESTADOS PRINCIPALES
  // ==============================
  const [eventos, setEventos] = useState([]);
  const [tareasUsuario, setTareasUsuario] = useState([]);
  const [vistaAgenda, setVistaAgenda] = useState('agenda'); // 'agenda', 'miAgenda', 'misTareas'
  const [cargando, setCargando] = useState(false);
  
  // ==============================
  // FILTROS
  // ==============================
  const [filtros, setFiltros] = useState({
    busqueda: '',
    mes: new Date().getMonth() + 1,
    anio: new Date().getFullYear(),
    categoria: '',
    alcance: '',
    estado: '',
    prioridad: '',
  });
  
  // ==============================
  // MODAL Y VISTA DE CALENDARIO
  // ==============================
  const [mostrarModal, setMostrarModal] = useState(false);
  const [eventoEditando, setEventoEditando] = useState(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [vistaActual, setVistaActual] = useState('meses');

  // ==============================
  // 1. CARGAR EVENTOS (con filtros y tipo de vista)
  // ==============================
  const cargarEventos = async () => {
    // 👇 PASO 1 APLICADO: Si estamos en "misTareas", abortamos la petición para evitar errores
    if (!usuario?.id || vistaAgenda === 'misTareas') return;
    
    setCargando(true);
    try {
      const params = new URLSearchParams({
        mes: filtros.mes,
        anio: filtros.anio,
        tipo: vistaAgenda,
        ...(filtros.busqueda && { busqueda: filtros.busqueda }),
        ...(filtros.categoria && { categoria: filtros.categoria }),
        ...(filtros.alcance && { alcance: filtros.alcance }),
        ...(filtros.estado && { estado: filtros.estado }),
        ...(filtros.prioridad && { prioridad: filtros.prioridad }),
      });
      const res = await api.get(`/calendario/eventos?${params}`);
      setEventos(res.data);
    } catch (error) {
      console.error('Error cargando eventos:', error);
      Swal.fire('Error', 'No se pudieron cargar los eventos', 'error');
    } finally {
      setCargando(false);
    }
  };

  // ==============================
  // 2. CARGAR TAREAS DEL USUARIO (para "Mis tareas")
  // ==============================
  const cargarTareasUsuario = async () => {
    if (!usuario?.id) return;
    setCargando(true);
    try {
      const res = await api.get(`/seguimiento/usuario/${usuario.id}/tareas`);
      setTareasUsuario(res.data);
    } catch (error) {
      console.error('Error cargando tareas:', error);
      Swal.fire('Error', 'No se pudieron cargar tus tareas de seguimiento', 'error');
    } finally {
      setCargando(false);
    }
  };

  // ==============================
  // 3. DISPARAR CARGA SEGÚN PESTAÑA ACTIVA
  // ==============================
  useEffect(() => {
    if (!usuario?.id) return;
    if (vistaAgenda === 'misTareas') {
      cargarTareasUsuario();
    } else {
      cargarEventos();
    }
  }, [filtros, vistaAgenda, usuario?.id]);

  // ==============================
  // 4. GUARDAR EVENTO (CREAR / ACTUALIZAR)
  // ==============================
  const handleGuardarEvento = async (datos) => {
    try {
      let response;
      if (eventoEditando) {
        response = await api.put(`/calendario/eventos/${eventoEditando.id}`, datos);
        Swal.fire('Actualizado', 'Evento actualizado correctamente', 'success');
      } else {
        response = await api.post('/calendario/eventos', { ...datos, creador_id: usuario.id });
        Swal.fire('Creado', 'Evento creado correctamente', 'success');
        
        // Si se asignó una tarea, recargar tareas del usuario actual
        if (datos.asignar_tarea) {
          cargarTareasUsuario();
        }
      }
      setMostrarModal(false);
      setEventoEditando(null);
      setFechaSeleccionada(null);
      
      // Recargar según la vista actual
      if (vistaAgenda === 'misTareas') {
        cargarTareasUsuario();
      } else {
        cargarEventos();
      }
    } catch (error) {
      console.error('Error guardando evento:', error);
      Swal.fire('Error', 'No se pudo guardar el evento', 'error');
    }
  };

  // ==============================
  // 5. ELIMINAR EVENTO
  // ==============================
  const handleEliminarEvento = async (id) => {
    const confirm = await Swal.fire({
      title: '¿Eliminar evento?',
      text: 'Esta acción es permanente',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
    });
    if (!confirm.isConfirmed) return;

    try {
      await api.delete(`/calendario/eventos/${id}`);
      Swal.fire('Eliminado', 'Evento eliminado', 'success');
      cargarEventos();
    } catch (error) {
      console.error('Error eliminando evento:', error);
      Swal.fire('Error', 'No se pudo eliminar', 'error');
    }
  };

  // ==============================
  // 6. ABRIR MODAL PARA CREAR / EDITAR
  // ==============================
  const abrirCrearEvento = (fecha) => {
    setEventoEditando(null);
    setFechaSeleccionada(fecha || null);
    setMostrarModal(true);
  };

  const abrirEditarEvento = (item) => {
    if (item.es_tarea_seguimiento) {
      Swal.fire({
        title: 'Tarea de Seguimiento',
        text: `"${item.titulo}" es una tarea asignada. ¿Deseas ir al módulo de tareas de seguimiento para gestionarla?`,
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#4A6CF7',
        confirmButtonText: 'Sí, ir a Tareas',
        cancelButtonText: 'Cerrar'
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/inicio'; 
        }
      });
      return;
    }
    setEventoEditando(item);
    setFechaSeleccionada(null);
    setMostrarModal(true);
  };

  // ==============================
  // 7. CAMBIAR MES (para filtros y vistas)
  // ==============================
  const handleCambiarMes = (mes, anio) => {
    setFiltros(prev => ({ ...prev, mes, anio }));
  };

  // ==============================
  // 8. ADAPTAR TAREAS PARA MOSTRAR EN COMPONENTES DE CALENDARIO
  // ==============================
  const eventosAMostrar = vistaAgenda === 'misTareas'
    ? tareasUsuario.map(tarea => ({
        id: tarea.id,
        titulo: tarea.titulo,
        descripcion: tarea.descripcion || '',
        tipo_evento: 'TAREA',
        estado: tarea.estado,
        fecha_inicio: tarea.fecha_creacion,
        fecha_fin: tarea.fecha_creacion,
        es_todo_el_dia: true,
        es_tarea_seguimiento: true,
      }))
    : eventos;

  // ==============================
  // 9. RENDERIZADO
  // ==============================
  return (
    <div className="calendario-container">
      {/* Header y Pestañas alineados en la misma fila */}
      <div 
        className="calendario-header" 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '15px',
          marginBottom: '20px'
        }}
      >
        {/* Lado Izquierdo: Títulos */}
        <div>
          <h2 className="calendario-titulo" style={{ margin: '0 0 5px 0' }}>Calendario</h2>
          <p className="calendario-subtitulo" style={{ margin: 0 }}>Gestiona eventos, tareas y fechas importantes</p>
        </div>

        {/* Lado Derecho: Pestañas de Agenda */}
        <div className="agenda-tabs" style={{ margin: 0 }}>
          <button
            className={`agenda-tab ${vistaAgenda === 'agenda' ? 'active' : ''}`}
            onClick={() => setVistaAgenda('agenda')}
          >
            Agenda
          </button>
          <button
            className={`agenda-tab ${vistaAgenda === 'miAgenda' ? 'active' : ''}`}
            onClick={() => setVistaAgenda('miAgenda')}
          >
            Mi agenda
          </button>
          <button
            className={`agenda-tab ${vistaAgenda === 'misTareas' ? 'active' : ''}`}
            onClick={() => setVistaAgenda('misTareas')}
          >
            Mis tareas
          </button>
        </div>
      </div>

      <div className="calendario-grid">
        {/* Columna izquierda: Filtros + Eventos Pasados */}
        <div className="calendario-col-izquierda">
          <FiltrosCalendario
            filtros={filtros}
            setFiltros={setFiltros}
            onNuevoEvento={() => abrirCrearEvento(null)}
          />
          <EventosPasados
            eventos={eventosAMostrar}
            onEventoClick={abrirEditarEvento}
          />
        </div>

        {/* Columna derecha: Agenda + Barra + Contenido dinámico */}
        <div className="calendario-col-derecha">
          {vistaAgenda === 'misTareas' ? (
            <AgendaTareas
              tareas={tareasUsuario}
              cargando={cargando}
              onTareaIniciada={() => {
                // 👇 PASO 2 APLICADO: Redirige automáticamente al Inicio
                window.location.href = '/inicio';
              }}
              onTareaEditada={abrirEditarEvento}
              onTareaEliminada={handleEliminarEvento}
            />
          ) : (
            <AgendaEventos
              eventos={eventosAMostrar}
              cargando={cargando}
              onEditar={abrirEditarEvento}
              onEliminar={handleEliminarEvento}
            />
          )}

          {/* Barra de contador + selector de vista */}
          <div className="calendario-bar">
            <span className="calendario-contador">
              {eventosAMostrar.length} {vistaAgenda === 'misTareas' ? 'tareas encontradas' : 'eventos encontrados'}
            </span>
            <div className="vista-selector">
              <button
                className={`vista-btn ${vistaActual === 'meses' ? 'active' : ''}`}
                onClick={() => setVistaActual('meses')}
              >
                Meses
              </button>
              <button
                className={`vista-btn ${vistaActual === 'calendario' ? 'active' : ''}`}
                onClick={() => setVistaActual('calendario')}
              >
                Calendario
              </button>
            </div>
          </div>

          {vistaActual === 'meses' ? (
            <VistaMeses
              eventos={eventosAMostrar}
              mesActual={filtros.mes}
              anioActual={filtros.anio}
              onCambiarMes={handleCambiarMes}
              onEventoClick={abrirEditarEvento}
            />
          ) : (
            <ListaMeses
              eventos={eventosAMostrar}
              mesActual={filtros.mes}
              anioActual={filtros.anio}
              onCambiarMes={handleCambiarMes}
              onDiaClick={vistaAgenda === 'misTareas' ? null : abrirCrearEvento}
              onEventoClick={abrirEditarEvento}
            />
          )}
        </div>
      </div>

      {/* Modal para crear/editar evento */}
      <EventoModal
        visible={mostrarModal}
        onClose={() => {
          setMostrarModal(false);
          setEventoEditando(null);
          setFechaSeleccionada(null);
        }}
        onGuardar={handleGuardarEvento}
        evento={eventoEditando}
        fechaInicial={fechaSeleccionada}
      />
    </div>
  );
};

export default Calendario;