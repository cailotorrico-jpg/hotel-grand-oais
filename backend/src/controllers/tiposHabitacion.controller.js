// ============================================================
// Controlador: Tipos de Habitación
// Descripción: Maneja las solicitudes HTTP para tipos de habitación
// ============================================================

const TipoHabitacionModel = require('../models/tipoHabitacion.model');

// Obtener todos los tipos de habitación
const getAll = async (req, res) => {
  try {
    const tipos = await TipoHabitacionModel.getAll();
    res.json(tipos);
  } catch (error) {
    console.error('Error al obtener tipos de habitación:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener un tipo de habitación por ID
const getById = async (req, res) => {
  try {
    const tipo = await TipoHabitacionModel.getById(req.params.id);
    if (!tipo) {
      return res.status(404).json({ error: 'Tipo de habitación no encontrado' });
    }
    res.json(tipo);
  } catch (error) {
    console.error('Error al obtener tipo de habitación:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear un nuevo tipo de habitación
const create = async (req, res) => {
  try {
    const nuevoTipo = await TipoHabitacionModel.create(req.body);
    res.status(201).json(nuevoTipo);
  } catch (error) {
    console.error('Error al crear tipo de habitación:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar un tipo de habitación
const update = async (req, res) => {
  try {
    const tipo = await TipoHabitacionModel.update(req.params.id, req.body);
    if (!tipo) {
      return res.status(404).json({ error: 'Tipo de habitación no encontrado' });
    }
    res.json(tipo);
  } catch (error) {
    console.error('Error al actualizar tipo de habitación:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar un tipo de habitación
const remove = async (req, res) => {
  try {
    const rowsAffected = await TipoHabitacionModel.delete(req.params.id);
    if (rowsAffected === 0) {
      return res.status(404).json({ error: 'Tipo de habitación no encontrado' });
    }
    res.json({ message: 'Tipo de habitación eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar tipo de habitación:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { getAll, getById, create, update, delete: remove };
