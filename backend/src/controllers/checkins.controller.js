// Controlador: CheckIns
const CheckInModel = require('../models/checkin.model');

const getAll = async (req, res) => {
  try { res.json(await CheckInModel.getAll()); }
  catch (error) { console.error(error.message); res.status(500).json({ error: 'Error interno' }); }
};

const getById = async (req, res) => {
  try {
    const item = await CheckInModel.getById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Check-in no encontrado' });
    res.json(item);
  } catch (error) { console.error(error.message); res.status(500).json({ error: 'Error interno' }); }
};

const create = async (req, res) => {
  try { res.status(201).json(await CheckInModel.create(req.body)); }
  catch (error) { console.error(error.message); res.status(500).json({ error: error.message }); }
};

const getByReserva = async (req, res) => {
  try {
    const item = await CheckInModel.getByReserva(req.params.idReserva);
    if (!item) return res.status(404).json({ error: 'No encontrado' });
    res.json(item);
  } catch (error) { console.error(error.message); res.status(500).json({ error: 'Error interno' }); }
};

const getReservasConfirmadas = async (req, res) => {
  try { res.json(await CheckInModel.getReservasConfirmadas()); }
  catch (error) { console.error(error.message); res.status(500).json({ error: 'Error interno' }); }
};

module.exports = { getAll, getById, create, getByReserva, getReservasConfirmadas };
