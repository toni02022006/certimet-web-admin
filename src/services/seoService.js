import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

// Obtener todos los registros SEO (requiere autenticación)
export const getSeoList = async (token) => {
  const res = await axios.get(`${BASE_URL}/api/seo/all`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Crear o actualizar un registro SEO
export const upsertSeo = async (data, token) => {
  const res = await axios.post(`${BASE_URL}/api/seo`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Eliminar un registro SEO
export const deleteSeo = async (id, token) => {
  const res = await axios.delete(`${BASE_URL}/api/seo/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Obtener SEO por ruta (público)
export const getSeoByRuta = async (ruta) => {
  const res = await axios.get(`${BASE_URL}/api/seo?ruta=${encodeURIComponent(ruta)}`);
  return res.data;
};