import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

// ============================================
// API Services for each module
// ============================================

// --- Huéspedes ---
export const huespedesAPI = {
  getAll: () => api.get('/huespedes'),
  getById: (id) => api.get(`/huespedes/${id}`),
  create: (data) => api.post('/huespedes', data),
  update: (id, data) => api.put(`/huespedes/${id}`, data),
  remove: (id) => api.delete(`/huespedes/${id}`),
  search: (query) => api.get(`/huespedes/buscar?q=${encodeURIComponent(query)}`),
};

// --- Tipos de Habitación ---
export const tiposHabitacionAPI = {
  getAll: () => api.get('/tipos-habitacion'),
  getById: (id) => api.get(`/tipos-habitacion/${id}`),
  create: (data) => api.post('/tipos-habitacion', data),
  update: (id, data) => api.put(`/tipos-habitacion/${id}`, data),
  remove: (id) => api.delete(`/tipos-habitacion/${id}`),
};

// --- Habitaciones ---
export const habitacionesAPI = {
  getAll: () => api.get('/habitaciones'),
  getById: (id) => api.get(`/habitaciones/${id}`),
  create: (data) => api.post('/habitaciones', data),
  update: (id, data) => api.put(`/habitaciones/${id}`, data),
  remove: (id) => api.delete(`/habitaciones/${id}`),
  cambiarEstado: (id, estado) => api.patch(`/habitaciones/${id}/estado`, { estado }),
};

// --- Reservas ---
export const reservasAPI = {
  getAll: () => api.get('/reservas'),
  getById: (id) => api.get(`/reservas/${id}`),
  create: (data) => api.post('/reservas', data),
  update: (id, data) => api.put(`/reservas/${id}`, data),
  remove: (id) => api.delete(`/reservas/${id}`),
  cambiarEstado: (id, estado) => api.patch(`/reservas/${id}/estado`, { estado }),
};

// --- Check-Ins ---
export const checkInsAPI = {
  getAll: () => api.get('/checkins'),
  getById: (id) => api.get(`/checkins/${id}`),
  create: (data) => api.post('/checkins', data),
  getReservasConfirmadas: () => api.get('/checkins/reservas-confirmadas'),
};

// --- Servicios ---
export const serviciosAPI = {
  getAll: () => api.get('/servicios'),
  getById: (id) => api.get(`/servicios/${id}`),
  create: (data) => api.post('/servicios', data),
  update: (id, data) => api.put(`/servicios/${id}`, data),
  remove: (id) => api.delete(`/servicios/${id}`),
};

// --- Consumos ---
export const consumosAPI = {
  getAll: () => api.get('/consumos'),
  getById: (id) => api.get(`/consumos/${id}`),
  create: (data) => api.post('/consumos', data),
  update: (id, data) => api.put(`/consumos/${id}`, data),
  remove: (id) => api.delete(`/consumos/${id}`),
  getByReserva: (reservaId) => api.get(`/consumos/reserva/${reservaId}`),
};

// --- Facturas ---
export const facturasAPI = {
  getAll: () => api.get('/facturas'),
  getById: (id) => api.get(`/facturas/${id}`),
  create: (data) => api.post('/facturas', data),
  update: (id, data) => api.put(`/facturas/${id}`, data),
  remove: (id) => api.delete(`/facturas/${id}`),
  generar: (reservaId) => api.post(`/facturas/generar/${reservaId}`),
};

// --- Check-Outs ---
export const checkOutsAPI = {
  getAll: () => api.get('/checkouts'),
  getById: (id) => api.get(`/checkouts/${id}`),
  create: (data) => api.post('/checkouts', data),
  getReservasCheckedIn: () => api.get('/checkouts/reservas-checkedin'),
};

// --- Bitácora ---
export const bitacoraAPI = {
  getAll: () => api.get('/bitacora'),
  getByTabla: (tabla) => api.get(`/bitacora?tabla=${tabla}`),
  getByAccion: (accion) => api.get(`/bitacora?accion=${accion}`),
  search: (params) => api.get('/bitacora', { params }),
};

// --- Dashboard ---
export const dashboardAPI = {
  getData: () => api.get('/dashboard'),
};
