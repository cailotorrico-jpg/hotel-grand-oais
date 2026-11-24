// ============================================================
// Controlador: Servicios Adicionales
// Descripción: Maneja las solicitudes HTTP para servicios adicionales
// ============================================================

const ServicioModel = require('../models/servicio.model');

// Obtener todos los servicios
const getAll = async (req, res) => {
  try {
    const servicios = await ServicioModel.getAll();
    res.json(servicios);
  } catch (error) {
    console.error('Error al obtener servicios:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener un servicio por ID
const getById = async (req, res) => {
  try {
    const servicio = await ServicioModel.getById(req.params.id);
    if (!servicio) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }
    res.json(servicio);
  } catch (error) {
    console.error('Error al obtener servicio:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener servicios por categoría
const getByCategoria = async (req, res) => {
  try {
    const servicios = await ServicioModel.getByCategoria(req.params.categoria);
    res.json(servicios);
  } catch (error) {
    console.error('Error al obtener servicios por categoría:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear un nuevo servicio
const create = async (req, res) => {
  try {
    const nuevoServicio = await ServicioModel.create(req.body);
    res.status(201).json(nuevoServicio);
  } catch (error) {
    console.error('Error al crear servicio:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar un servicio
const update = async (req, res) => {
  try {
    const servicio = await ServicioModel.update(req.params.id, req.body);
    if (!servicio) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }
    res.json(servicio);
  } catch (error) {
    console.error('Error al actualizar servicio:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar un servicio
const remove = async (req, res) => {
  try {
    const rowsAffected = await ServicioModel.delete(req.params.id);
    if (rowsAffected === 0) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }
    res.json({ message: 'Servicio eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar servicio:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { getAll, getById, getByCategoria, create, update, delete: remove };
