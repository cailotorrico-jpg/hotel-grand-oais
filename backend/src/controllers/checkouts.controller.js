// Controlador: CheckOuts
const CheckOutModel = require('../models/checkout.model');

const getAll = async (req, res) => {
  try { res.json(await CheckOutModel.getAll()); }
  catch (error) { console.error(error.message); res.status(500).json({ error: 'Error interno' }); }
};

const getById = async (req, res) => {
  try {
    const item = await CheckOutModel.getById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Check-out no encontrado' });
    res.json(item);
  } catch (error) { console.error(error.message); res.status(500).json({ error: 'Error interno' }); }
};

const create = async (req, res) => {
  try { res.status(201).json(await CheckOutModel.create(req.body)); }
  catch (error) { console.error(error.message); res.status(500).json({ error: error.message }); }
};

const getByReserva = async (req, res) => {
  try {
    const item = await CheckOutModel.getByReserva(req.params.idReserva);
    if (!item) return res.status(404).json({ error: 'No encontrado' });
    res.json(item);
  } catch (error) { console.error(error.message); res.status(500).json({ error: 'Error interno' }); }
};

const getReservasCheckedIn = async (req, res) => {
  try { res.json(await CheckOutModel.getReservasCheckedIn()); }
  catch (error) { console.error(error.message); res.status(500).json({ error: 'Error interno' }); }
};

module.exports = { getAll, getById, create, getByReserva, getReservasCheckedIn };
