import React, { useState, useEffect } from 'react';
import api from '../../services/api'; // (Quitamos axios porque ya usas tu instancia api)

// Iconos SVG
const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconFilter = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 13 10 21 14 18 14 13 22 3" />
  </svg>
);

const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const FiltrosCalendario = ({ filtros, setFiltros, onNuevoEvento }) => {
  const [categorias, setCategorias] = useState([]);
  const [alcances, setAlcances] = useState([]);
  const [estados, setEstados] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const fetchOpciones = async () => {
      setCargando(true);
      try {
        const [resCats, resAlc, resEst, resPri] = await Promise.all([
          api.get('/calendario/categorias').then(r => r.data),
          api.get('/calendario/alcances').then(r => r.data),
          api.get('/calendario/estados').then(r => r.data),
          api.get('/calendario/prioridades').then(r => r.data),
        ]);
        
        // CORRECCIÓN: Quitamos el .data porque ya se extrajo arriba. 
        // Agregamos || [] por si el backend no devuelve nada, evitar que sea undefined.
        setCategorias(resCats || []);
        setAlcances(resAlc || []);
        setEstados(resEst || []);
        setPrioridades(resPri || []);
      } catch (error) {
        console.error('Error cargando opciones de filtros:', error);
        setCategorias(['TAREA', 'ACTIVIDAD', 'REUNION', 'RECORDATORIO', 'CUMPLEANOS', 'VACACIONES', 'FERIADO', 'FECHA_IMPORTANTE', 'OTRO']);
        setAlcances(['Nacional', 'Internacional', 'Local', 'Regional']);
        setEstados(['PENDIENTE', 'EN_CURSO', 'COMPLETADO', 'CANCELADO']);
        setPrioridades(['Baja', 'Media', 'Alta', 'Muy Alta']);
      } finally {
        setCargando(false);
      }
    };
    fetchOpciones();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const handleLimpiar = () => {
    setFiltros({
      busqueda: '',
      mes: new Date().getMonth() + 1,
      anio: new Date().getFullYear(),
      categoria: '',
      alcance: '',
      estado: '',
      prioridad: '',
    });
  };

  return (
    <div className="filtros-sticky">
      <div className="filtros-header">
        <h3><IconFilter /> Filtros</h3>
        <button className="btn-nuevo-evento" onClick={onNuevoEvento}>
          <IconPlus /> Nuevo evento
        </button>
      </div>

      <div className="filtros-campos">
        {/* Búsqueda */}
        <div className="filtro-busqueda">
          <IconSearch />
          <input
            type="text"
            name="busqueda"
            placeholder="Buscar por título o descripción..."
            value={filtros.busqueda || ''}
            onChange={handleChange}
          />
        </div>

        {/* Cada filtro en su propia fila */}
        <div className="filtro-fila">
          <label className="filtro-label">CATEGORÍA</label>
          <select
            name="categoria"
            value={filtros.categoria || ''}
            onChange={handleChange}
            disabled={cargando}
          >
            <option value="">Todas las categorías</option>
            {/* CORRECCIÓN: Agregamos el signo de interrogación (?.) para asegurar que no falle si está vacío */}
            {categorias?.map(cat => (
              <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        <div className="filtro-fila">
          <label className="filtro-label">ALCANCE</label>
          <select
            name="alcance"
            value={filtros.alcance || ''}
            onChange={handleChange}
            disabled={cargando}
          >
            <option value="">Todos los alcances</option>
            {alcances?.map(alc => (
              <option key={alc} value={alc}>{alc}</option>
            ))}
          </select>
        </div>

        <div className="filtro-fila">
          <label className="filtro-label">ESTADO</label>
          <select
            name="estado"
            value={filtros.estado || ''}
            onChange={handleChange}
            disabled={cargando}
          >
            <option value="">Todos los estados</option>
            {estados?.map(est => (
              <option key={est} value={est}>{est.replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        <div className="filtro-fila">
          <label className="filtro-label">PRIORIDAD</label>
          <select
            name="prioridad"
            value={filtros.prioridad || ''}
            onChange={handleChange}
            disabled={cargando}
          >
            <option value="">Todas las prioridades</option>
            {prioridades?.map(pri => (
              <option key={pri} value={pri}>{pri}</option>
            ))}
          </select>
        </div>

        <button className="btn-limpiar" onClick={handleLimpiar}>
          Limpiar filtros
        </button>
      </div>
    </div>
  );
};

export default FiltrosCalendario;