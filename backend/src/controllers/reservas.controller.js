// ============================================================
// Controlador: Reservas
// Descripción: Maneja las solicitudes HTTP para el módulo de reservas
// ============================================================

const ReservaModel = require('../models/reserva.model');

// Obtener todas las reservas
const getAll = async (req, res) => {
  try {
    const reservas = await ReservaModel.getAll();
    res.json(reservas);
  } catch (error) {
    console.error('Error al obtener reservas:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener una reserva por ID (incluye detalles)
const getById = async (req, res) => {
  try {
    const reserva = await ReservaModel.getById(req.params.id);
    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }
    res.json(reserva);
  } catch (error) {
    console.error('Error al obtener reserva:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener reservas de un huésped
const getByHuesped = async (req, res) => {
  try {
    const reservas = await ReservaModel.getByHuesped(req.params.idHuesped);
    res.json(reservas);
  } catch (error) {
    console.error('Error al obtener reservas del huésped:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear una reserva (simple, sin detalles)
const create = async (req, res) => {
  try {
    const nuevaReserva = await ReservaModel.create(req.body);
    res.status(201).json(nuevaReserva);
  } catch (error) {
    console.error('Error al crear reserva:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear una reserva con detalles (habitaciones)
const createWithDetails = async (req, res) => {
  try {
    const { reserva, detalles } = req.body;
    if (!reserva || !detalles || !Array.isArray(detalles) || detalles.length === 0) {
      return res.status(400).json({ error: 'Se requiere "reserva" y "detalles" (array no vacío)' });
    }
    const nuevaReserva = await ReservaModel.createWithDetails(reserva, detalles);
    res.status(201).json(nuevaReserva);
  } catch (error) {
    console.error('Error al crear reserva con detalles:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar una reserva
const update = async (req, res) => {
  try {
    const reserva = await ReservaModel.update(req.params.id, req.body);
    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }
    res.json(reserva);
  } catch (error) {
    console.error('Error al actualizar reserva:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar estado de una reserva
const updateEstado = async (req, res) => {
  try {
    const { estado } = req.body;
    if (!estado) {
      return res.status(400).json({ error: 'Se requiere el campo "estado"' });
    }
    const reserva = await ReservaModel.updateEstado(req.params.id, estado);
    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }
    res.json(reserva);
  } catch (error) {
    console.error('Error al actualizar estado de reserva:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Cancelar una reserva
const cancel = async (req, res) => {
  try {
    const reserva = await ReservaModel.cancel(req.params.id);
    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }
    res.json({ message: 'Reserva cancelada correctamente', reserva });
  } catch (error) {
    console.error('Error al cancelar reserva:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getAll, getById, getByHuesped, create, createWithDetails,
  update, updateEstado, cancel,
};
