// ============================================================
// Controlador: Habitaciones
// Descripción: Maneja las solicitudes HTTP para el módulo de habitaciones
// ============================================================

const HabitacionModel = require('../models/habitacion.model');

// Obtener todas las habitaciones
const getAll = async (req, res) => {
  try {
    const habitaciones = await HabitacionModel.getAll();
    res.json(habitaciones);
  } catch (error) {
    console.error('Error al obtener habitaciones:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener una habitación por ID
const getById = async (req, res) => {
  try {
    const habitacion = await HabitacionModel.getById(req.params.id);
    if (!habitacion) {
      return res.status(404).json({ error: 'Habitación no encontrada' });
    }
    res.json(habitacion);
  } catch (error) {
    console.error('Error al obtener habitación:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener habitaciones por estado
const getByEstado = async (req, res) => {
  try {
    const habitaciones = await HabitacionModel.getByEstado(req.params.estado);
    res.json(habitaciones);
  } catch (error) {
    console.error('Error al obtener habitaciones por estado:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear una nueva habitación
const create = async (req, res) => {
  try {
    const nuevaHabitacion = await HabitacionModel.create(req.body);
    res.status(201).json(nuevaHabitacion);
  } catch (error) {
    console.error('Error al crear habitación:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar una habitación
const update = async (req, res) => {
  try {
    const habitacion = await HabitacionModel.update(req.params.id, req.body);
    if (!habitacion) {
      return res.status(404).json({ error: 'Habitación no encontrada' });
    }
    res.json(habitacion);
  } catch (error) {
    console.error('Error al actualizar habitación:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar solo el estado de una habitación
const updateEstado = async (req, res) => {
  try {
    const { estado } = req.body;
    if (!estado) {
      return res.status(400).json({ error: 'Se requiere el campo "estado"' });
    }
    const habitacion = await HabitacionModel.updateEstado(req.params.id, estado);
    if (!habitacion) {
      return res.status(404).json({ error: 'Habitación no encontrada' });
    }
    res.json(habitacion);
  } catch (error) {
    console.error('Error al actualizar estado de habitación:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar una habitación
const remove = async (req, res) => {
  try {
    const rowsAffected = await HabitacionModel.delete(req.params.id);
    if (rowsAffected === 0) {
      return res.status(404).json({ error: 'Habitación no encontrada' });
    }
    res.json({ message: 'Habitación eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar habitación:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { getAll, getById, getByEstado, create, update, updateEstado, delete: remove };
