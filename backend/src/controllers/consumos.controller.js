// Controlador: Consumos
const ConsumoModel = require('../models/consumo.model');

const getAll = async (req, res) => {
  try { res.json(await ConsumoModel.getAll()); }
  catch (error) { console.error(error.message); res.status(500).json({ error: 'Error interno' }); }
};

const getById = async (req, res) => {
  try { res.json([]); }
  catch (error) { res.status(500).json({ error: 'Error interno' }); }
};

const getByReserva = async (req, res) => {
  try { res.json(await ConsumoModel.getByReserva(req.params.idReserva)); }
  catch (error) { console.error(error.message); res.status(500).json({ error: 'Error interno' }); }
};

const create = async (req, res) => {
  try { res.status(201).json(await ConsumoModel.create(req.body)); }
  catch (error) { console.error(error.message); res.status(500).json({ error: error.message }); }
};

const remove = async (req, res) => {
  try {
    const rows = await ConsumoModel.delete(req.params.id);
    if (rows === 0) return res.status(404).json({ error: 'Consumo no encontrado' });
    res.json({ message: 'Consumo eliminado' });
  } catch (error) { console.error(error.message); res.status(500).json({ error: 'Error interno' }); }
};

module.exports = { getAll, getById, getByReserva, create, delete: remove };
