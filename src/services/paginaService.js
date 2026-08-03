import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

// Obtener todas las páginas estáticas
export const getPaginas = async (token) => {
  const res = await axios.get(`${BASE_URL}/api/paginas`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Obtener una página por slug (público)
export const getPaginaBySlug = async (slug) => {
  const res = await axios.get(`${BASE_URL}/api/paginas/${slug}`);
  return res.data;
};

// Crear o actualizar una página estática
export const upsertPagina = async (data, token) => {
  const method = data.id ? 'put' : 'post';
  const url = data.id ? `${BASE_URL}/api/paginas/${data.id}` : `${BASE_URL}/api/paginas`;
  const res = await axios[method](url, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Eliminar una página estática
export const deletePagina = async (id, token) => {
  const res = await axios.delete(`${BASE_URL}/api/paginas/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};