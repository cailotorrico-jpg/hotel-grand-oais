// ============================================================
// Controlador: Huéspedes
// Descripción: Maneja las solicitudes HTTP para el módulo de huéspedes
// ============================================================

const HuespedModel = require('../models/huesped.model');

// Obtener todos los huéspedes
const getAll = async (req, res) => {
  try {
    const huespedes = await HuespedModel.getAll();
    res.json(huespedes);
  } catch (error) {
    console.error('Error al obtener huéspedes:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener un huésped por ID
const getById = async (req, res) => {
  try {
    const huesped = await HuespedModel.getById(req.params.id);
    if (!huesped) {
      return res.status(404).json({ error: 'Huésped no encontrado' });
    }
    res.json(huesped);
  } catch (error) {
    console.error('Error al obtener huésped:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear un nuevo huésped
const create = async (req, res) => {
  try {
    const nuevoHuesped = await HuespedModel.create(req.body);
    res.status(201).json(nuevoHuesped);
  } catch (error) {
    console.error('Error al crear huésped:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar un huésped
const update = async (req, res) => {
  try {
    const huesped = await HuespedModel.update(req.params.id, req.body);
    if (!huesped) {
      return res.status(404).json({ error: 'Huésped no encontrado' });
    }
    res.json(huesped);
  } catch (error) {
    console.error('Error al actualizar huésped:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar un huésped
const remove = async (req, res) => {
  try {
    const rowsAffected = await HuespedModel.delete(req.params.id);
    if (rowsAffected === 0) {
      return res.status(404).json({ error: 'Huésped no encontrado' });
    }
    res.json({ message: 'Huésped eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar huésped:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Buscar huéspedes por término
const search = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Se requiere el parámetro de búsqueda "q"' });
    }
    const huespedes = await HuespedModel.search(q);
    res.json(huespedes);
  } catch (error) {
    console.error('Error al buscar huéspedes:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { getAll, getById, create, update, delete: remove, search };
