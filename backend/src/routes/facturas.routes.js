const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/facturas.controller');

router.post('/generar/:idReserva', ctrl.generate);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.patch('/:id/estado', ctrl.updateEstado);

module.exports = router;
