// ============================================================
// Controlador: Facturas
// Descripción: Maneja las solicitudes HTTP para el módulo de facturas
// ============================================================

const FacturaModel = require('../models/factura.model');

// Obtener todas las facturas
const getAll = async (req, res) => {
  try {
    const facturas = await FacturaModel.getAll();
    res.json(facturas);
  } catch (error) {
    console.error('Error al obtener facturas:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener una factura por ID
const getById = async (req, res) => {
  try {
    const factura = await FacturaModel.getById(req.params.id);
    if (!factura) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    res.json(factura);
  } catch (error) {
    console.error('Error al obtener factura:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener facturas por ID de reserva
const getByReserva = async (req, res) => {
  try {
    const facturas = await FacturaModel.getByReserva(req.params.idReserva);
    res.json(facturas);
  } catch (error) {
    console.error('Error al obtener facturas de la reserva:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Generar factura para una reserva
const generate = async (req, res) => {
  try {
    const factura = await FacturaModel.generate(req.params.idReserva);
    res.status(201).json(factura);
  } catch (error) {
    console.error('Error al generar factura:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar estado de una factura
const updateEstado = async (req, res) => {
  try {
    const { estado } = req.body;
    if (!estado) {
      return res.status(400).json({ error: 'Se requiere el campo "estado"' });
    }
    const factura = await FacturaModel.updateEstado(req.params.id, estado);
    if (!factura) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    res.json(factura);
  } catch (error) {
    console.error('Error al actualizar estado de factura:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { getAll, getById, getByReserva, generate, updateEstado };
