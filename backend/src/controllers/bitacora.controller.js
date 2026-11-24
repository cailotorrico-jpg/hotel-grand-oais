// Controlador: Bitácora
const BitacoraModel = require('../models/bitacora.model');

const getAll = async (req, res) => {
  try {
    const filters = {};
    if (req.query.tabla) filters.tabla = req.query.tabla;
    if (req.query.accion) filters.accion = req.query.accion;
    res.json(await BitacoraModel.getAll(filters));
  } catch (error) { console.error(error.message); res.status(500).json({ error: 'Error interno' }); }
};

const getByTabla = async (req, res) => {
  try { res.json(await BitacoraModel.getByTabla(req.params.tabla)); }
  catch (error) { console.error(error.message); res.status(500).json({ error: 'Error interno' }); }
};

const create = async (req, res) => {
  try { res.status(201).json(await BitacoraModel.create(req.body)); }
  catch (error) { console.error(error.message); res.status(500).json({ error: 'Error interno' }); }
};

module.exports = { getAll, getByTabla, create };
