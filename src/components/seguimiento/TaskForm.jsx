import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './TaskForm.css';

const TaskForm = ({ onTaskCreated }) => {
  const [empresas, setEmpresas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    empresa_id: '',
    categoria_tarea_id: '',
  });
  const [cargando, setCargando] = useState(false);
  const [tiempo, setTiempo] = useState(0);

  useEffect(() => {
    api.get('/seguimiento/empresas')
      .then(res => setEmpresas(Array.isArray(res.data) ? res.data : (res.data?.empresas || [])))
      .catch(err => console.error("Error cargando empresas:", err));

    api.get('/seguimiento/categorias')
      .then(res => setCategorias(Array.isArray(res.data) ? res.data : (res.data?.categorias || [])))
      .catch(err => console.error("Error cargando categorías:", err));

    // Cronómetro para el formulario (solo visual)
    const interval = setInterval(() => {
      setTiempo(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      const response = await api.post('/seguimiento/tarea/iniciar', form);
      onTaskCreated(response.data);
      setForm({ titulo: '', descripcion: '', empresa_id: '', categoria_tarea_id: '' });
      setTiempo(0);
    } catch (error) {
      console.error('Error al iniciar tarea:', error);
    } finally {
      setCargando(false);
    }
  };

  const formatearTiempo = (segundos) => {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const secs = segundos % 60;
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <input
        name="titulo"
        placeholder="Título de la tarea"
        value={form.titulo}
        onChange={handleChange}
        required
      />
      <textarea
        name="descripcion"
        placeholder="Descripción (opcional)"
        value={form.descripcion}
        onChange={handleChange}
      />
      <select name="empresa_id" value={form.empresa_id} onChange={handleChange} required>
        <option value="">Selecciona empresa</option>
        {empresas.map(emp => (
          <option key={emp.id} value={emp.id}>{emp.nombre}</option>
        ))}
      </select>
      <select name="categoria_tarea_id" value={form.categoria_tarea_id} onChange={handleChange} required>
        <option value="">Selecciona categoría</option>
        {categorias.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.nombre}</option>
        ))}
      </select>
      
      <div className="task-form-actions">
        <span className="task-timer">{formatearTiempo(tiempo)}</span>
        <button type="submit" disabled={cargando}>
          {cargando ? 'Iniciando...' : 'Iniciar'}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;